import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    const kitMap = new Map();
    const hubMap = new Map();

    // 2. Run Kit + HubSpot fetches IN PARALLEL
    await Promise.all([
      // --- Kit fetch (limit to 5 pages of 1000 = 5000 most recent) ---
      (async () => {
        if (!kitKey) return;
        try {
          const kitHeaders = { "X-Kit-Api-Key": kitKey };
          let after = null;
          let pageCount = 0;
          while (pageCount < 5) {
            let url = "https://api.kit.com/v4/subscribers?per_page=1000";
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

    // 4. Merge everything into unified contacts (WITHOUT Stripe — frontend merges separately)
    const unifiedMap = new Map();

    function buildContact(email, name, phone, source, country, language, createdDate, leadStatus, quizRec, kitData, hubData, emailLog) {
      const kitLifecycle = kitData?.kit_fields?.lifecycle_stage || "";
      const hubLifecycle = hubData?.hubspot_lifecycle || "";
      const lifecycle = hubLifecycle || kitLifecycle || "";
      // Without Stripe, use lifecycle/lead status as fallback
      const isCustomer = lifecycle === "customer" || leadStatus === "converted";
      const isChurned = lifecycle === "churned";
      return {
        email,
        name: name || "",
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
        stripe_customer_id: null,
        is_paying_customer: isCustomer,
        is_churned: isChurned,
        is_refunded: false,
        purchase_plan: kitData?.kit_fields?.purchase_plan || "",
        subscription_status: "",
        subscription_start: null,
        subscription_canceled: null,
        first_payment_date: null,
        last_payment_date: null,
        total_paid: 0,
        total_refunded: 0,
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
        kitMap.get(key), hubMap.get(key), emailLogMap.get(key)
      ));
    }

    for (const [key, kitData] of kitMap) {
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        key, kitData.kit_fields?.first_name || "", kitData.kit_fields?.phone_number || "",
        "kit", "", "", kitData.kit_created, "new", "",
        kitData, hubMap.get(key), emailLogMap.get(key)
      ));
    }

    for (const [key, hubData] of hubMap) {
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        key, "", "", "hubspot", "", "", hubData.hubspot_created, "new", "",
        null, hubData, emailLogMap.get(key)
      ));
    }

    for (const sub of subscribers) {
      if (!sub.email) continue;
      const key = sub.email.toLowerCase();
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        sub.email, "", "", "newsletter", "", "", sub.created_date, "new", "",
        null, null, emailLogMap.get(key)
      ));
    }

    const contacts = Array.from(unifiedMap.values());

    const stats = {
      total_contacts: contacts.length,
      paying_customers: contacts.filter(c => c.is_paying_customer).length,
      leads: contacts.filter(c => !c.is_paying_customer && !c.is_churned).length,
      churned: contacts.filter(c => c.is_churned).length,
      refunded: 0,
      in_kit: contacts.filter(c => c.kit_id).length,
      in_hubspot: contacts.filter(c => c.hubspot_id).length,
      in_stripe: 0,
      total_emails_sent: logs.filter(l => l.status === "sent").length,
    };

    return Response.json({ contacts, stats, kit_count: kitMap.size, hubspot_count: hubMap.size });
  } catch (error) {
    console.error("getCrmDashboard error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});