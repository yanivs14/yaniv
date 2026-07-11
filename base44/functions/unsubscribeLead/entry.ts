import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await req.json();
    const { lead_id, email } = body;

    let targetEmail = (email || "").toLowerCase().trim();
    let targetPhone = "";
    let targetName = "";

    // If lead_id provided, fetch the lead to get email/phone
    if (lead_id) {
      try {
        const lead = await base44.asServiceRole.entities.Lead.get(lead_id);
        if (lead) {
          targetEmail = (lead.email || targetEmail).toLowerCase().trim();
          targetPhone = lead.phone || "";
          targetName = lead.full_name || "";
        }
      } catch (e) {
        console.warn("Could not fetch lead by id:", e.message);
      }
    }

    if (!targetEmail && !lead_id) {
      return Response.json({ error: "lead_id or email is required" }, { status: 400 });
    }

    const results = {
      lead_deleted: false,
      newsletter_deleted: 0,
      email_logs_deleted: 0,
      kit_unsubscribed: false,
      hubspot_deleted: false,
      manychat_unsubscribed: false,
      email: targetEmail,
    };

    // 1. Delete Lead record(s) by email
    if (targetEmail) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ email: targetEmail });
        for (const l of leads) {
          await base44.asServiceRole.entities.Lead.delete(l.id);
          results.lead_deleted = true;
        }
        if (!targetName && leads.length > 0) targetName = leads[0].full_name || "";
      } catch (e) {
        console.warn("Lead deletion error:", e.message);
      }
    }

    // 2. Delete NewsletterSubscriber record(s) by email
    if (targetEmail) {
      try {
        const subs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email: targetEmail });
        for (const s of subs) {
          await base44.asServiceRole.entities.NewsletterSubscriber.delete(s.id);
          results.newsletter_deleted++;
        }
      } catch (e) {
        console.warn("NewsletterSubscriber deletion error:", e.message);
      }
    }

    // 3. Delete EmailLog record(s) by email
    if (targetEmail) {
      try {
        const logs = await base44.asServiceRole.entities.EmailLog.filter({ recipient_email: targetEmail });
        for (const l of logs) {
          await base44.asServiceRole.entities.EmailLog.delete(l.id);
          results.email_logs_deleted++;
        }
      } catch (e) {
        console.warn("EmailLog deletion error:", e.message);
      }
    }

    // 4. Unsubscribe from Kit.com (ConvertKit)
    if (targetEmail) {
      try {
        const kitKey = Deno.env.get("KIT_API_KEY");
        if (kitKey) {
          const kitRes = await fetch("https://api.convertkit.com/v3/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: kitKey, email: targetEmail }),
          });
          if (kitRes.ok) {
            results.kit_unsubscribed = true;
            console.log("Kit unsubscribe success for:", targetEmail);
          } else {
            const kitData = await kitRes.json().catch(() => ({}));
            console.warn("Kit unsubscribe failed:", kitRes.status, JSON.stringify(kitData));
          }
        }
      } catch (e) {
        console.warn("Kit unsubscribe error:", e.message);
      }
    }

    // 5. Delete from HubSpot
    if (targetEmail) {
      try {
        const token = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
        if (token) {
          // Search for contact by email
          const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: targetEmail }] }],
              properties: ["email"],
            }),
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const contactId = searchData.results?.[0]?.id;
            if (contactId) {
              const delRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
              });
              if (delRes.ok) {
                results.hubspot_deleted = true;
                console.log("HubSpot contact deleted:", contactId);
              } else {
                console.warn("HubSpot delete failed:", delRes.status);
              }
            }
          }
        }
      } catch (e) {
        console.warn("HubSpot deletion error:", e.message);
      }
    }

    // 6. ManyChat — opt out of SMS/email marketing
    if (targetEmail || targetPhone) {
      try {
        const manychatKey = Deno.env.get("MANYCHAT_API_KEY");
        if (manychatKey) {
          // ManyChat doesn't have a search-by-email/phone API, so we can't
          // directly unsubscribe without the subscriber ID. We log this as
          // a known limitation — the local data is already removed.
          console.log("ManyChat: subscriber ID not available, skipping API opt-out for:", targetEmail);
        }
      } catch (e) {
        console.warn("ManyChat opt-out error:", e.message);
      }
    }

    console.log(`Unsubscribe complete for ${targetName || targetEmail}:`, JSON.stringify(results));

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error("unsubscribeLead error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});