import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_LABELS = {
  monthly: "Monthly — $35/month",
  annual: "Annual — $250/year",
  promo: "Promo — $25/month (first 3 months)",
  handstand_course: "Handstand Course — $97 one-time",
};

function inferPlanFromPrice(price) {
  if (!price) return '';
  const amount = price.unit_amount ? price.unit_amount / 100 : 0;
  const interval = price.recurring?.interval;
  if (interval === 'month' && amount === 35) return 'Monthly — $35/month';
  if (interval === 'month' && amount === 25) return 'Promo — $25/month';
  if (interval === 'year' && amount === 250) return 'Annual — $250/year';
  if (interval === 'year' && Math.abs(amount - 239.88) < 0.15) return 'Annual — $239.88/year';
  if (interval === 'year' && amount === 240) return 'Annual — $240/year';
  if (interval === 'year' && amount === 160) return 'Yearly — $160';
  if (!interval && amount === 97) return 'Handstand Course — $97';
  if (!interval && amount === 350) return 'Inner Circle — $350';
  if (interval) return `${interval}ly — $${amount}`;
  return `One-time — $${amount}`;
}

function inferPlanFromCharge(charge) {
  if (charge.metadata?.plan) return PLAN_LABELS[charge.metadata.plan] || charge.metadata.plan;
  const desc = (charge.description || '').toLowerCase();
  if (desc.includes('handstand')) return 'Handstand Course — $97';
  if (desc.includes('inner circle') || desc.includes('final ic')) return 'Inner Circle — $350';
  if (desc.includes('annual') || desc.includes('yearly')) return 'Annual';
  if (desc.includes('monthly')) return 'Monthly — $35/month';
  if (desc.includes('promo')) return 'Promo — $25/month';
  return charge.description || 'One-time payment';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    // 1. Fetch leads + newsletter subscribers + email logs from our DB
    const [leads, subscribers, logs] = await Promise.all([
      base44.asServiceRole.entities.Lead.list('-created_date', 500),
      base44.asServiceRole.entities.NewsletterSubscriber.list('-created_date', 500),
      base44.asServiceRole.entities.EmailLog.list('-created_date', 500).catch(() => []),
    ]);

    const kitKey = Deno.env.get("API_Key_kit");
    const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    const kitMap = new Map();
    const hubMap = new Map();
    const stripeMap = new Map();
    const financials = {
      total_revenue: 0,
      total_refunded: 0,
      this_month_revenue: 0,
      last_month_revenue: 0,
      this_month_transactions: 0,
      last_month_transactions: 0,
      mrr: 0,
      monthly_data: {},
    };

    // 2. Run all three external API fetches IN PARALLEL
    await Promise.all([
      // --- Kit fetch ---
      (async () => {
        if (!kitKey) return;
        try {
          const kitHeaders = { "X-Kit-Api-Key": kitKey };
          let after = null;
          let pageCount = 0;
          while (pageCount < 20) {
            let url = "https://api.kit.com/v4/subscribers?per_page=100";
            if (after) url += `&after=${encodeURIComponent(after)}`;
            let res;
            for (let attempt = 0; attempt < 3; attempt++) {
              res = await fetch(url, { headers: kitHeaders });
              if (res.status !== 429) break;
              await new Promise(r => setTimeout(r, 2000));
            }
            if (!res.ok) { console.warn("Kit page", pageCount, "failed:", res.status); break; }
            const data = await res.json();
            const subs = data?.subscribers || [];
            if (subs.length === 0) break;
            for (const s of subs) {
              if (s.email_address) {
                kitMap.set(s.email_address.toLowerCase(), {
                  kit_id: s.id,
                  kit_state: s.state || "",
                  kit_fields: s.fields || {},
                  kit_created: s.created_at || "",
                });
              }
            }
            if (!data?.pagination?.has_next_page) break;
            after = data?.pagination?.end_cursor;
            if (!after) break;
            pageCount++;
          }
          console.log(`Kit: fetched ${kitMap.size} subscribers`);
        } catch (e) {
          console.warn("Kit fetch failed:", e.message);
        }
      })(),

      // --- HubSpot fetch ---
      (async () => {
        if (!hubToken) return;
        try {
          const leadEmails = [...new Set(leads.filter(l => l.email).map(l => l.email.toLowerCase()))];
          const props = ["email", "firstname", "lastname", "phone", "lifecyclestage", "hs_lead_status", "createdate"];
          for (let i = 0; i < leadEmails.length; i += 100) {
            const chunk = leadEmails.slice(i, i + 100);
            const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
              method: "POST",
              headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                limit: 100,
                properties: props,
                filterGroups: [{ filters: [{ propertyName: "email", operator: "IN", values: chunk }] }],
              }),
            });
            if (!res.ok) { console.warn("HubSpot search batch", i, "failed:", res.status); continue; }
            const data = await res.json();
            for (const c of (data?.results || [])) {
              const email = c.properties?.email;
              if (email) {
                hubMap.set(email.toLowerCase(), {
                  hubspot_id: c.id,
                  hubspot_lifecycle: c.properties?.lifecyclestage || "",
                  hubspot_lead_status: c.properties?.hs_lead_status || "",
                  hubspot_created: c.properties?.createdate || "",
                });
              }
            }
          }
          console.log(`HubSpot: found ${hubMap.size} matches for ${leadEmails.length} lead emails`);
        } catch (e) {
          console.warn("HubSpot fetch failed:", e.message);
        }
      })(),

      // --- Stripe fetch ---
      (async () => {
        if (!stripeKey) return;
        try {
          const stripe = new Stripe(stripeKey);

          const now = new Date();
          const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

          // 4a. List ALL subscriptions (active + canceled + trialing) with expanded customer
          let subHasMore = true;
          let subStartingAfter = null;
          let subPageCount = 0;
          while (subHasMore && subPageCount < 50) {
            const params = { limit: 100, status: 'all', expand: ['data.customer'] };
            if (subStartingAfter) params.starting_after = subStartingAfter;
            const subs = await stripe.subscriptions.list(params);

            for (const sub of subs.data) {
              const email = (sub.customer?.email || '').toLowerCase().trim();
              if (!email) continue;

              let data = stripeMap.get(email);
              if (!data) {
                data = {
                  stripe_customer_id: sub.customer?.id || null,
                  name: sub.customer?.name || '',
                  is_paying: false,
                  is_churned: false,
                  is_refunded: false,
                  plan: '',
                  subscription_status: '',
                  subscription_start: null,
                  subscription_canceled: null,
                  first_payment_date: null,
                  last_payment_date: null,
                  total_paid: 0,
                  total_refunded: 0,
                };
                stripeMap.set(email, data);
              }

              const isActive = ['active', 'trialing'].includes(sub.status);
              const isCanceled = sub.status === 'canceled';
              const price = sub.items?.data?.[0]?.price;
              const subPlan = sub.metadata?.plan ? (PLAN_LABELS[sub.metadata.plan] || sub.metadata.plan) : inferPlanFromPrice(price);

              if (isActive) {
                data.is_paying = true;
                data.is_churned = false;
                data.subscription_status = sub.status;
                data.subscription_start = sub.start_date ? new Date(sub.start_date * 1000).toISOString() : null;
                if (!data.plan) data.plan = subPlan;
                if (price?.recurring?.interval === 'month') {
                  financials.mrr += price.unit_amount / 100;
                } else if (price?.recurring?.interval === 'year') {
                  financials.mrr += (price.unit_amount / 100) / 12;
                }
              } else if (isCanceled && !data.is_paying) {
                data.is_churned = true;
                data.subscription_status = sub.status;
                data.subscription_start = sub.start_date ? new Date(sub.start_date * 1000).toISOString() : null;
                data.subscription_canceled = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;
                if (!data.plan) data.plan = subPlan;
              }
            }

            subHasMore = subs.has_more;
            if (subHasMore) subStartingAfter = subs.data[subs.data.length - 1].id;
            subPageCount++;
          }
          console.log(`Stripe: fetched subscriptions, ${stripeMap.size} contacts so far`);

          // 4b. List all charges (one-time payments, payment dates, refunds, revenue)
          let chargeHasMore = true;
          let chargeStartingAfter = null;
          let chargePageCount = 0;
          while (chargeHasMore && chargePageCount < 100) {
            const params = { limit: 100 };
            if (chargeStartingAfter) params.starting_after = chargeStartingAfter;
            const charges = await stripe.charges.list(params);

            for (const charge of charges.data) {
              if (!charge.paid) continue;

              const email = charge.billing_details?.email?.toLowerCase().trim();
              if (!email) continue;

              let data = stripeMap.get(email);
              if (!data) {
                data = {
                  stripe_customer_id: charge.customer || null,
                  name: charge.billing_details?.name || '',
                  is_paying: false,
                  is_churned: false,
                  is_refunded: false,
                  plan: '',
                  subscription_status: '',
                  subscription_start: null,
                  subscription_canceled: null,
                  first_payment_date: null,
                  last_payment_date: null,
                  total_paid: 0,
                  total_refunded: 0,
                };
                stripeMap.set(email, data);
              }

              const chargeDate = new Date(charge.created * 1000);
              const chargeMonthKey = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
              const netAmount = (charge.amount - charge.amount_refunded) / 100;

              data.total_paid += charge.amount / 100;
              financials.total_revenue += netAmount;

              if (charge.amount_refunded > 0) {
                data.total_refunded += charge.amount_refunded / 100;
                data.is_refunded = true;
                financials.total_refunded += charge.amount_refunded / 100;
              }

              if (!data.first_payment_date || chargeDate < new Date(data.first_payment_date)) {
                data.first_payment_date = chargeDate.toISOString();
              }
              if (!data.last_payment_date || chargeDate > new Date(data.last_payment_date)) {
                data.last_payment_date = chargeDate.toISOString();
              }

              if (!financials.monthly_data[chargeMonthKey]) {
                financials.monthly_data[chargeMonthKey] = { revenue: 0, transactions: 0 };
              }
              financials.monthly_data[chargeMonthKey].revenue += netAmount;
              financials.monthly_data[chargeMonthKey].transactions += 1;

              if (chargeMonthKey === thisMonthKey) {
                financials.this_month_revenue += netAmount;
                financials.this_month_transactions += 1;
              } else if (chargeMonthKey === lastMonthKey) {
                financials.last_month_revenue += netAmount;
                financials.last_month_transactions += 1;
              }

              if (!data.is_paying && !data.is_churned && netAmount > 0) {
                data.is_paying = true;
                if (!data.plan) data.plan = inferPlanFromCharge(charge);
              }
            }

            chargeHasMore = charges.has_more;
            if (chargeHasMore) chargeStartingAfter = charges.data[charges.data.length - 1].id;
            chargePageCount++;
          }
          console.log(`Stripe: processed charges, ${stripeMap.size} total contacts`);

          const sortedMonths = Object.entries(financials.monthly_data)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6);
          financials.monthly_data = Object.fromEntries(sortedMonths);
        } catch (e) {
          console.warn("Stripe fetch failed:", e.message);
        }
      })(),
    ]);

    // 3. Build email log summary
    const emailLogMap = new Map();
    for (const log of logs) {
      if (!log.recipient_email) continue;
      const key = log.recipient_email.toLowerCase();
      const existing = emailLogMap.get(key);
      if (existing) {
        existing.count += 1;
        if (log.status === "sent") existing.sent += 1;
        if (new Date(log.created_date) > new Date(existing.lastDate)) {
          existing.lastDate = log.created_date;
        }
      } else {
        emailLogMap.set(key, {
          count: 1,
          sent: log.status === "sent" ? 1 : 0,
          lastDate: log.created_date,
        });
      }
    }

    // 4. Merge everything into unified contacts
    const unifiedMap = new Map();

    function buildContact(email, name, phone, source, country, language, createdDate, leadStatus, quizRec, kitData, hubData, emailLog, stripeData) {
      const kitLifecycle = kitData?.kit_fields?.lifecycle_stage || "";
      const hubLifecycle = hubData?.hubspot_lifecycle || "";
      const lifecycle = hubLifecycle || kitLifecycle || "";
      const isCustomer = stripeData?.is_paying || (!stripeData && (lifecycle === "customer" || leadStatus === "converted"));
      const isChurned = stripeData?.is_churned || (!stripeData && lifecycle === "churned");
      return {
        email,
        name: name || stripeData?.name || "",
        phone: phone || "",
        source,
        country: country || "",
        language: language || "",
        created_date: createdDate,
        lead_status: leadStatus,
        quiz_recommendation: quizRec || "",
        kit_id: kitData?.kit_id || null,
        kit_state: kitData?.kit_state || "",
        kit_lifecycle: kitLifecycle,
        kit_purchase_plan: kitData?.kit_fields?.purchase_plan || "",
        hubspot_id: hubData?.hubspot_id || null,
        hubspot_lifecycle: hubLifecycle,
        hubspot_lead_status: hubData?.hubspot_lead_status || "",
        lifecycle_stage: lifecycle,
        stripe_customer_id: stripeData?.stripe_customer_id || null,
        is_paying_customer: isCustomer,
        is_churned: isChurned,
        is_refunded: stripeData?.is_refunded || false,
        purchase_plan: stripeData?.plan || kitData?.kit_fields?.purchase_plan || "",
        subscription_status: stripeData?.subscription_status || "",
        subscription_start: stripeData?.subscription_start || null,
        subscription_canceled: stripeData?.subscription_canceled || null,
        first_payment_date: stripeData?.first_payment_date || null,
        last_payment_date: stripeData?.last_payment_date || null,
        total_paid: stripeData?.total_paid || 0,
        total_refunded: stripeData?.total_refunded || 0,
        emails_sent: emailLog?.sent || 0,
        emails_total: emailLog?.count || 0,
        last_email_date: emailLog?.lastDate || null,
      };
    }

    for (const lead of leads) {
      if (!lead.email) continue;
      const key = lead.email.toLowerCase();
      unifiedMap.set(key, buildContact(
        lead.email, lead.full_name, lead.phone, lead.source || "quiz",
        lead.country, lead.browser_language, lead.created_date,
        lead.status || "new", lead.quiz_recommendation,
        kitMap.get(key), hubMap.get(key), emailLogMap.get(key), stripeMap.get(key)
      ));
    }

    for (const [key, kitData] of kitMap) {
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        key, kitData.kit_fields?.first_name || "", kitData.kit_fields?.phone_number || "",
        "kit", "", "", kitData.kit_created, "new", "",
        kitData, hubMap.get(key), emailLogMap.get(key), stripeMap.get(key)
      ));
    }

    for (const [key, hubData] of hubMap) {
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        key, "", "", "hubspot", "", "", hubData.hubspot_created, "new", "",
        null, hubData, emailLogMap.get(key), stripeMap.get(key)
      ));
    }

    for (const sub of subscribers) {
      if (!sub.email) continue;
      const key = sub.email.toLowerCase();
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        sub.email, "", "", "newsletter", "", "", sub.created_date, "new", "",
        null, null, emailLogMap.get(key), stripeMap.get(key)
      ));
    }

    for (const [key, stripeData] of stripeMap) {
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        key, stripeData.name || "", "", "stripe", "", "",
        stripeData.first_payment_date || stripeData.subscription_start || "",
        stripeData.is_paying ? "converted" : "new", "",
        null, null, null, stripeData
      ));
    }

    const contacts = Array.from(unifiedMap.values());

    const stats = {
      total_contacts: contacts.length,
      paying_customers: contacts.filter(c => c.is_paying_customer).length,
      leads: contacts.filter(c => !c.is_paying_customer && !c.is_churned).length,
      churned: contacts.filter(c => c.is_churned).length,
      refunded: contacts.filter(c => c.is_refunded).length,
      in_kit: contacts.filter(c => c.kit_id).length,
      in_hubspot: contacts.filter(c => c.hubspot_id).length,
      in_stripe: contacts.filter(c => c.stripe_customer_id).length,
      total_emails_sent: logs.filter(l => l.status === "sent").length,
    };

    const planBreakdown = {};
    for (const c of contacts) {
      if (c.is_paying_customer && c.purchase_plan) {
        planBreakdown[c.purchase_plan] = (planBreakdown[c.purchase_plan] || 0) + 1;
      }
    }
    financials.arpu = stats.paying_customers > 0 ? financials.total_revenue / stats.paying_customers : 0;
    financials.churn_rate = stats.paying_customers + stats.churned > 0
      ? (stats.churned / (stats.paying_customers + stats.churned)) * 100 : 0;
    financials.plan_breakdown = planBreakdown;

    return Response.json({ contacts, stats, financials, kit_count: kitMap.size, hubspot_count: hubMap.size, stripe_count: stripeMap.size });
  } catch (error) {
    console.error("getCrmDashboard error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});