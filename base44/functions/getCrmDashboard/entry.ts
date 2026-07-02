import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    // Only fetch leads + newsletter subscribers + email logs from our DB (website sources only)
    const [leads, subscribers, logs] = await Promise.all([
      base44.asServiceRole.entities.Lead.list('-created_date', 500),
      base44.asServiceRole.entities.NewsletterSubscriber.list('-created_date', 500),
      base44.asServiceRole.entities.EmailLog.list('-created_date', 500).catch(() => []),
    ]);

    // Build email log summary
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

    // Merge leads + newsletter subscribers into unified contacts
    const unifiedMap = new Map();

    function buildContact(email, name, phone, source, country, language, createdDate, leadStatus, quizRec, emailLog) {
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
        kit_id: null,
        kit_state: "",
        kit_lifecycle: "",
        kit_purchase_plan: "",
        hubspot_id: null,
        hubspot_lifecycle: "",
        hubspot_lead_status: "",
        lifecycle_stage: "",
        stripe_customer_id: null,
        is_paying_customer: leadStatus === "converted",
        is_churned: false,
        is_refunded: false,
        purchase_plan: "",
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
        emailLogMap.get(key)
      ));
    }

    for (const sub of subscribers) {
      if (!sub.email) continue;
      const key = sub.email.toLowerCase();
      if (unifiedMap.has(key)) continue;
      unifiedMap.set(key, buildContact(
        sub.email, "", "", "newsletter", "", "", sub.created_date, "new", "",
        emailLogMap.get(key)
      ));
    }

    const contacts = Array.from(unifiedMap.values());

    const stats = {
      total_contacts: contacts.length,
      paying_customers: contacts.filter(c => c.is_paying_customer).length,
      leads: contacts.filter(c => !c.is_paying_customer && !c.is_churned).length,
      churned: contacts.filter(c => c.is_churned).length,
      refunded: 0,
      in_kit: 0,
      in_hubspot: 0,
      in_stripe: 0,
      total_emails_sent: logs.filter(l => l.status === "sent").length,
    };

    return Response.json({ contacts, stats, kit_count: 0, hubspot_count: 0 });
  } catch (error) {
    console.error("getCrmDashboard error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});