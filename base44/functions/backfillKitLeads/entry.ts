import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const kitKey = Deno.env.get("API_Key_kit");
    if (!kitKey) return Response.json({ error: "Missing Kit API key" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batch_size || 30, 40);
    const batchOffset = body.batch_offset || 0;

    const headers = { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey };

    // 1. Fetch all leads + newsletter subscribers
    const [leads, subscribers] = await Promise.all([
      base44.asServiceRole.entities.Lead.list('-created_date', 500),
      base44.asServiceRole.entities.NewsletterSubscriber.list('-created_date', 500),
    ]);

    // 2. Build a deduplicated list of {email, name, phone, source, ...} 
    const emailMap = new Map();

    for (const lead of leads) {
      if (!lead.email) continue;
      const key = lead.email.toLowerCase().trim();
      if (!emailMap.has(key)) {
        emailMap.set(key, {
          email: lead.email,
          full_name: lead.full_name || "",
          phone: lead.phone || "",
          source: lead.source || "quiz",
          quiz_section: lead.quiz_section || "",
          quiz_recommendation: lead.quiz_recommendation || "",
          quiz_answers: lead.quiz_answers || {},
        });
      }
    }

    for (const sub of subscribers) {
      if (!sub.email) continue;
      const key = sub.email.toLowerCase().trim();
      if (!emailMap.has(key)) {
        emailMap.set(key, {
          email: sub.email,
          full_name: "",
          phone: "",
          source: sub.source || "newsletter",
          quiz_section: "",
          quiz_recommendation: "",
          quiz_answers: {},
        });
      }
    }

    const allEntries = [...emailMap.values()];
    const batch = allEntries.slice(batchOffset, batchOffset + batchSize);

    console.log(`Kit backfill: ${allEntries.length} unique emails, processing ${batch.length} (offset ${batchOffset})`);

    const results = { synced: 0, failed: 0, errors: [] };

    for (const entry of batch) {
      const { email, full_name, phone, source, quiz_section, quiz_recommendation, quiz_answers } = entry;

      const nameParts = (full_name || "").trim().split(" ");
      const firstName = nameParts[0] || "";

      const fields = {
        last_name: nameParts.slice(1).join(" ") || "",
        phone_number: phone || "",
        source: source || "quiz",
        lifecycle_stage: "lead",
      };
      if (quiz_section) fields.quiz_section = quiz_section;
      if (quiz_recommendation) fields.quiz_recommendation = quiz_recommendation;
      if (quiz_answers && Object.keys(quiz_answers).length > 0) {
        fields.quiz_answers = Object.entries(quiz_answers).map(([k, v]) => `${k}: ${v}`).join(", ");
      }

      try {
        let res;
        for (let attempt = 0; attempt < 3; attempt++) {
          res = await fetch("https://api.kit.com/v4/subscribers", {
            method: "POST",
            headers,
            body: JSON.stringify({ email_address: email, first_name: firstName, state: "active", fields }),
          });
          if (res.status !== 429) break;
          console.log(`429 for ${email}, retrying (attempt ${attempt + 1})...`);
          await sleep(3000);
        }

        if (res.ok) {
          results.synced++;
          console.log(`Synced: ${email}`);
        } else {
          const errText = await res.text();
          results.failed++;
          results.errors.push({ email, status: res.status, error: errText.slice(0, 200) });
          console.warn(`Failed: ${email} — ${res.status}`);
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ email, error: err.message });
        console.warn(`Error: ${email} — ${err.message}`);
      }

      await sleep(800); // 800ms delay to avoid 429
    }

    const remaining = Math.max(0, allEntries.length - (batchOffset + batchSize));

    return Response.json({
      success: true,
      total_emails: allEntries.length,
      batch_synced: results.synced,
      batch_failed: results.failed,
      batch_offset: batchOffset,
      remaining,
      errors: results.errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});