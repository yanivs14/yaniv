import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_LABELS = {
  monthly: "Monthly — $35/month",
  annual: "Annual — $250/year",
  promo: "Promo — $25/month (first 3 months)",
};

async function ensureKitTags(kitKey, tagNames) {
  const headers = { "X-Kit-Api-Key": kitKey };
  const tagsRes = await fetch("https://api.kit.com/v4/tags", { headers });
  const existingTags = (await tagsRes.json())?.tags || [];
  const tagMap = {};
  for (const name of tagNames) {
    let tag = existingTags.find(t => t.name === name);
    if (!tag) {
      const createRes = await fetch("https://api.kit.com/v4/tags", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (createRes.ok) tag = (await createRes.json())?.tag;
    }
    if (tag?.id) tagMap[name] = tag.id;
  }
  return tagMap;
}

async function tagKitSubscriber(kitKey, subscriberId, tagNames) {
  if (!subscriberId || !tagNames.length) return;
  const tagMap = await ensureKitTags(kitKey, tagNames);
  const headers = { "X-Kit-Api-Key": kitKey, "Content-Type": "application/json" };
  for (const [name, tagId] of Object.entries(tagMap)) {
    await fetch(`https://api.kit.com/v4/subscribers/${subscriberId}/tags`, {
      method: "POST", headers, body: JSON.stringify({ tag_id: tagId }),
    });
    console.log(`Kit tag applied: ${name} → subscriber ${subscriberId}`);
  }
}

async function handleChurn(stripe, subscription) {
  const customerId = subscription.customer;
  let customerEmail = "";
  let customerName = "";
  try {
    const customer = await stripe.customers.retrieve(customerId);
    customerEmail = customer?.email || "";
    customerName = customer?.name || customer?.email || "Churned Customer";
  } catch (custErr) {
    console.warn("Stripe customer retrieve failed:", custErr.message);
    return Response.json({ received: true, skipped: "customer_lookup_failed", error: custErr.message });
  }
  if (!customerEmail) return Response.json({ received: true, skipped: "no_email" });

  const created = new Date(subscription.created * 1000);
  const canceledAt = subscription.canceled_at || Math.floor(Date.now() / 1000);
  const canceled = new Date(canceledAt * 1000);
  const durationMs = canceled - created;
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const churnTag = durationMs > sixMonthsMs ? ">6m Churn" : "Churned <6m";

  console.log(`Churn: ${customerEmail} | duration ~${Math.round(durationMs / (30*24*60*60*1000))}mo | tag: ${churnTag}`);

  const kitKey = Deno.env.get("API_Key_kit");
  if (kitKey) {
    try {
      const kitHeaders = { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey };
      let subscriberId = null;
      const kitRes = await fetch("https://api.kit.com/v4/subscribers", {
        method: "POST",
        headers: kitHeaders,
        body: JSON.stringify({
          email_address: customerEmail,
          first_name: (customerName || "").split(" ")[0] || "",
          state: "active",
          fields: { lifecycle_stage: "churned" },
        }),
      });
      if (kitRes.ok) subscriberId = (await kitRes.json())?.subscriber?.id;
      if (subscriberId) await tagKitSubscriber(kitKey, subscriberId, [churnTag]);
    } catch (kitErr) {
      console.warn("Kit churn sync failed:", kitErr.message);
    }
  }

  // Update HubSpot lifecycle to churned
  const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
  if (hubToken) {
    try {
      const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: customerEmail }] }] }),
      });
      const searchData = await searchRes.json();
      const contactId = searchData.results?.[0]?.id;
      if (contactId) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ properties: { lifecyclestage: "churned" } }),
        });
        console.log("HubSpot contact marked as churned:", contactId);
      }
    } catch (hubErr) {
      console.warn("HubSpot churn update failed:", hubErr.message);
    }
  }

  return Response.json({ received: true, processed: true, churn: churnTag, email: customerEmail });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log("Stripe webhook received:", event.type);

    if (event.type === "customer.subscription.deleted") {
      return await handleChurn(stripe, event.data.object);
    }

    if (event.type !== "checkout.session.completed") {
      return Response.json({ received: true, skipped: event.type });
    }

    const session = event.data.object;
    const plan = session.metadata?.plan || "unknown";
    const planLabel = PLAN_LABELS[plan] || plan;
    const customerEmail = session.customer_details?.email || "";
    const customerName = session.customer_details?.name || customerEmail || "Unknown Customer";
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency?.toUpperCase() || "USD";
    const transactionId = session.id;

    // Try to match an existing lead by email to get quiz data
    let matchedLead = null;
    if (customerEmail) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ email: customerEmail });
        matchedLead = leads[0] || null;
      } catch (e) {
        console.error("Lead match error:", e.message);
      }
    }

    // Get admin notification emails
    let recipientEmails = [];
    try {
      const settings = await base44.asServiceRole.entities.LeadSettings.list();
      recipientEmails = settings?.[0]?.recipient_emails || [];
    } catch (e) {
      console.error("LeadSettings error:", e.message);
    }

    if (recipientEmails.length === 0) {
      console.error("No admin recipient emails configured!");
    }

    console.log(`Sending purchase notification to ${recipientEmails.length} admins for ${customerName}`);

    // Send admin notification email
    for (const adminEmail of recipientEmails) {
      try {
        const quizRows = matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0
          ? Object.entries(matchedLead.quiz_answers).map(([k, v]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">${k}</span>
                <span style="color:#00fff7;font-size:14px;font-weight:600;">${v}</span>
              </td>
            </tr>`).join('')
          : '';

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `💰 New Purchase — ${customerName} — ${planLabel}`,
          from_name: 'The Movement - Roye Gold',
          body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #222;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">New Purchase 🎉</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:#22c55e;color:#0a0a0a;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;white-space:nowrap;">Paid</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Purchase Details -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Purchase Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PLAN</span>
                  <span style="color:#00fff7;font-size:16px;font-weight:700;">${planLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">AMOUNT PAID</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:700;">${amount.toFixed(2)} ${currency}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">TRANSACTION ID</span>
                  <span style="color:#F5F5F5;font-size:14px;font-family:monospace;">${transactionId}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Customer Info -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Customer</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">FULL NAME</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:700;">${customerName}</span>
                </td>
              </tr>
              ${customerEmail ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">EMAIL</span>
                  <span style="color:#00fff7;font-size:15px;font-weight:600;">${customerEmail}</span>
                </td>
              </tr>` : ''}
              ${matchedLead?.phone ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PHONE</span>
                  <span style="color:#F5F5F5;font-size:15px;">${matchedLead.phone}</span>
                </td>
              </tr>` : ''}
              ${matchedLead?.country ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">LOCATION</span>
                  <span style="color:#F5F5F5;font-size:14px;">${matchedLead.country}${matchedLead.browser_language ? ' · ' + matchedLead.browser_language : ''}</span>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Quiz Recommendation -->
        ${matchedLead?.quiz_recommendation ? `<tr>
          <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
            <p style="margin:0 0 6px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Recommendation</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#00fff7;">${matchedLead.quiz_recommendation}</p>
          </td>
        </tr>` : ''}

        <!-- Quiz Answers -->
        ${quizRows ? `<tr>
          <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Answers</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${quizRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;">
            <p style="margin:0;font-size:11px;color:#444;">${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jerusalem', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })} · The Movement Admin</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
        });
        console.log(`Admin email sent to ${adminEmail}`);
      } catch (e) {
        console.error(`Failed to send admin email to ${adminEmail}:`, e.message);
      }
    }

    // Sync to HubSpot — direct API call (non-blocking)
    if (customerEmail) {
      try {
        const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
        if (hubToken) {
          const hubNameParts = (customerName || "").trim().split(" ");
          const originParts = [];
          if (matchedLead?.source) originParts.push(`Form: ${matchedLead.source}`);
          if (matchedLead?.quiz_recommendation) originParts.push(`Recommendation: ${matchedLead.quiz_recommendation}`);
          if (matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0) {
            originParts.push(`Quiz: ${Object.entries(matchedLead.quiz_answers).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
          }
          originParts.push(`Purchased: ${planLabel}`);
          const hubProps = {
            email: customerEmail,
            firstname: hubNameParts[0] || "",
            lastname: hubNameParts.slice(1).join(" ") || "",
            phone: matchedLead?.phone || "",
            lifecyclestage: "customer",
            message: originParts.join(" | "),
          };

          const hubCreateRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ properties: hubProps }),
          });
          if (hubCreateRes.ok) {
            console.log("HubSpot customer created:", (await hubCreateRes.json())?.id);
          } else if (hubCreateRes.status === 409) {
            const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
              method: "POST",
              headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: customerEmail }] }] }),
            });
            const searchData = await searchRes.json();
            const contactId = searchData.results?.[0]?.id;
            if (contactId) {
              await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ properties: hubProps }),
              });
              console.log("HubSpot customer updated:", contactId);
            }
          } else {
            console.warn("HubSpot create failed:", hubCreateRes.status, await hubCreateRes.text());
          }
        }
      } catch (hubErr) {
        console.warn("HubSpot customer sync failed (non-critical):", hubErr.message);
      }
    }

    // Send purchase behavioral event to HubSpot analytics (non-blocking)
    // Mirrors GA4 fields: revenue, plan details, lead attribution, and quiz data.
    if (customerEmail) {
      try {
        const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
        if (hubToken) {
          const leadSource = matchedLead?.source || "checkout";
          const quizRec = matchedLead?.quiz_recommendation || "";
          const country = matchedLead?.country || "";
          const browserLang = matchedLead?.browser_language || "";
          const isPromo = plan === "promo";
          const hasQuizData = matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0;

          const evRes = await fetch("https://api.hubapi.com/events/v3/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              email: customerEmail,
              eventName: "pe148037733_purchase",
              occurredAt: new Date().toISOString(),
              properties: {
                revenue: String(amount),
                price: String(amount),
                value: String(amount),
                currency,
                plan: planLabel,
                plan_type: plan,
                product: planLabel,
                transaction_id: transactionId,
                quantity: "1",
                coupon: isPromo ? "promo_25_first_3_months" : "",
                lead_source: leadSource,
                quiz_recommendation: quizRec,
                country,
                browser_language: browserLang,
                has_quiz_data: hasQuizData ? "true" : "false",
                lifecycle_stage: "customer",
              },
            }),
          });
          if (evRes.ok) {
            console.log(`HubSpot purchase event sent: ${customerEmail} | $${amount} ${currency} | ${planLabel} | source: ${leadSource}`);
          } else {
            console.warn("HubSpot purchase event failed:", evRes.status, await evRes.text());
          }
        }
      } catch (evErr) {
        console.warn("HubSpot purchase event error (non-critical):", evErr.message);
      }
    }

    // Send purchase event to GA4 via Measurement Protocol (non-blocking)
    // Includes revenue, plan details, lead attribution, and quiz data.
    // NOTE: GA4 prohibits PII (email, phone, full name) — only non-identifying attributes are sent.
    try {
      const gaMeasurementId = Deno.env.get("GA4_MEASUREMENT_ID");
      const gaApiSecret = Deno.env.get("GA4_API_SECRET");
      if (gaMeasurementId && gaApiSecret) {
        const leadSource = matchedLead?.source || "checkout";
        const quizRec = matchedLead?.quiz_recommendation || "";
        const country = matchedLead?.country || "";
        const browserLang = matchedLead?.browser_language || "";
        const isPromo = plan === "promo";

        const gaRes = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: transactionId + ".stripe",
              user_properties: {
                plan_type: { value: plan },
                lead_source: { value: leadSource },
                country: { value: country },
                lifecycle_stage: { value: "customer" },
              },
              events: [{
                name: "purchase",
                params: {
                  transaction_id: transactionId,
                  value: amount,
                  revenue: amount,
                  currency: currency.toLowerCase(),
                  coupon: isPromo ? "promo_25_first_3_months" : "",
                  plan: planLabel,
                  plan_type: plan,
                  lead_source: leadSource,
                  quiz_recommendation: quizRec,
                  country: country,
                  browser_language: browserLang,
                  has_quiz_data: matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0 ? "true" : "false",
                  items: [{
                    item_id: plan,
                    item_name: planLabel,
                    item_category: plan,
                    item_variant: isPromo ? "promo" : "standard",
                    price: amount,
                    quantity: 1,
                  }],
                },
              }],
            }),
          }
        );
        if (gaRes.ok) {
          console.log(`GA4 purchase event sent: ${transactionId} | $${amount} ${currency} | ${planLabel} | source: ${leadSource}`);
        } else {
          console.warn("GA4 purchase event failed:", gaRes.status, await gaRes.text());
        }
      }
    } catch (gaErr) {
      console.warn("GA4 purchase event error (non-critical):", gaErr.message);
    }

    // Sync to Kit — direct API call (non-blocking)
    if (customerEmail) {
      try {
        const kitKey = Deno.env.get("API_Key_kit");
        if (kitKey) {
          const kitNameParts = (customerName || "").trim().split(" ");
          const kitFields = {
            last_name: kitNameParts.slice(1).join(" ") || "",
            phone_number: matchedLead?.phone || "",
            source: matchedLead?.source || "checkout",
            lifecycle_stage: "customer",
            purchase_plan: planLabel,
          };
          if (matchedLead?.quiz_recommendation) kitFields.quiz_recommendation = matchedLead.quiz_recommendation;
          if (matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0) {
            kitFields.quiz_answers = Object.entries(matchedLead.quiz_answers).map(([k, v]) => `${k}: ${v}`).join(", ");
          }

          const kitHeaders = { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey };

          let kitSubscriberId = null;
          const kitCreateRes = await fetch("https://api.kit.com/v4/subscribers", {
            method: "POST",
            headers: kitHeaders,
            body: JSON.stringify({ email_address: customerEmail, first_name: kitNameParts[0] || customerName || "", state: "active", fields: kitFields }),
          });
          if (kitCreateRes.ok) {
            kitSubscriberId = (await kitCreateRes.json())?.subscriber?.id;
            console.log("Kit subscriber updated (customer):", kitSubscriberId);
          } else {
            console.warn("Kit create failed:", kitCreateRes.status, await kitCreateRes.text());
          }

          try {
            const formsRes = await fetch("https://api.kit.com/v4/forms", { headers: kitHeaders });
            const formsData = await formsRes.json();
            const form = formsData?.forms?.[0];
            if (form) {
              const formSubRes = await fetch(`https://api.kit.com/v4/forms/${form.id}/subscribers`, {
                method: "POST",
                headers: kitHeaders,
                body: JSON.stringify({ email_address: customerEmail, first_name: kitNameParts[0] || customerName || "", fields: kitFields }),
              });
              if (formSubRes.ok && !kitSubscriberId) {
                kitSubscriberId = (await formSubRes.json())?.subscriber?.id;
              }
            }
          } catch (formErr) {
            console.warn("Kit form subscribe error:", formErr.message);
          }

          // Tag subscriber with plan tag
          if (kitSubscriberId) {
            const planTag = plan === "annual" ? "Annual" : "Monthly-Active";
            await tagKitSubscriber(kitKey, kitSubscriberId, [planTag]);
          }
        }
      } catch (kitErr) {
        console.warn("Kit customer sync failed (non-critical):", kitErr.message);
      }
    }

    return Response.json({ received: true, processed: true, customer: customerName, plan: planLabel });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});