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

    const headers = { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey };

    // Emails that failed with 429 in the first run — retry these only
    const failedEmails = [
      "pradyumnashetty94@gmail.com",
      "murto1@hotmail.com",
      "samarthjm@icloud.com",
      "idoherer709@gmail.com",
      "johnnyfrachey91@gmail.com",
      "almogdvir11@gmail.com",
      "vbenoit88@gmail.com",
      "christophedugat@yahoo.fr",
      "carmen.zumsteg@gmail.com",
      "delignyyohann@gmail.com",
      "corneliusfunctionalfitness@gmail.com",
      "Jayallen1@gmail.com",
      "diegohabib29@gmail.com",
      "jayallen1@gmail.com",
      "flaviocavellar@gmail.com",
      "ustagnin@gmail.com",
      "test@test.com",
      "callmeeaxyx@gmail.com",
      "gauravkumar98018@gmail.com",
      "arturo380@gmail.com",
      "jesseoost@gmail.com",
    ];

    // Fetch matching leads
    const allLeads = await base44.asServiceRole.entities.Lead.list('-created_date', 500, 0);
    const toRetry = allLeads.filter(l => failedEmails.includes(l.email));

    console.log(`Retrying ${toRetry.length} leads with rate limiting`);

    const results = { synced: 0, errors: 0, details: [] };

    for (const lead of toRetry) {
      const { full_name, email, phone, source, quiz_section, quiz_recommendation, quiz_answers } = lead;

      const nameParts = (full_name || "").trim().split(" ");
      const firstName = nameParts[0] || full_name || "";

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
        const createRes = await fetch("https://api.kit.com/v4/subscribers", {
          method: "POST",
          headers,
          body: JSON.stringify({ email_address: email, first_name: firstName, state: "active", fields }),
        });
        if (createRes.ok) {
          results.synced++;
        } else {
          results.errors++;
          results.details.push({ email, error: `create ${createRes.status}` });
        }
      } catch (err) {
        results.errors++;
        results.details.push({ email, error: err.message });
      }
      await sleep(600); // 600ms delay between calls to avoid 429
    }

    return Response.json({ retried: toRetry.length, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});