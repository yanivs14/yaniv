import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
    if (!hubToken) {
      return Response.json({ error: "HUBSPOT_PRIVATE_APP_TOKEN not set" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 30;
    const batchOffset = body.batch_offset || 0;

    // 1. Fetch all leads from our DB (paginate to get all)
    const allLeads = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.Lead.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allLeads.push(...batch);
      if (batch.length < 200) break;
      skip += 200;
    }
    // Deduplicate by email (keep most recent)
    const emailToLead = new Map();
    for (const l of allLeads) {
      if (!l.email) continue;
      const key = l.email.toLowerCase();
      if (!emailToLead.has(key)) emailToLead.set(key, l);
    }
    const uniqueLeads = Array.from(emailToLead.values());
    console.log(`DB: fetched ${allLeads.length} leads, ${uniqueLeads.length} unique emails`);

    // 2. Sync a batch — try create, if 409 then update (no need to pre-fetch all HubSpot contacts)
    const batch = uniqueLeads.slice(batchOffset, batchOffset + batchSize);
    console.log(`Syncing batch: ${batch.length} leads (offset ${batchOffset})`);

    if (batch.length === 0) {
      return Response.json({ success: true, message: "All leads synced", total_leads: allLeads.length, unique_emails: uniqueLeads.length, batch_synced: 0 });
    }

    // 3. Sync leads to HubSpot
    const results = { synced: 0, failed: 0, errors: [] };
    for (const lead of batch) {
      try {
        const nameParts = (lead.full_name || "").trim().split(" ");
        const originParts = [];
        if (lead.source) originParts.push(`Form: ${lead.source}`);
        if (lead.quiz_section) originParts.push(`Section: ${lead.quiz_section}`);
        if (lead.quiz_recommendation) originParts.push(`Recommendation: ${lead.quiz_recommendation}`);
        if (lead.quiz_answers && Object.keys(lead.quiz_answers).length > 0) {
          originParts.push(`Quiz: ${Object.entries(lead.quiz_answers).map(([k, v]) => `${k}: ${v}`).join(", ")}`);
        }

        const props = {
          email: lead.email,
          firstname: nameParts[0] || "",
          lastname: nameParts.slice(1).join(" ") || "",
          phone: lead.phone || "",
          lifecyclestage: lead.status === "converted" ? "customer" : "lead",
          hs_lead_status: lead.status === "converted" ? "CLOSED" : "NEW",
          message: originParts.length > 0 ? originParts.join(" | ") : undefined,
        };
        Object.keys(props).forEach(k => props[k] === undefined && delete props[k]);

        const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
          method: "POST",
          headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ properties: props }),
        });

        if (createRes.ok) {
          results.synced++;
          console.log(`Synced: ${lead.email}`);
        } else if (createRes.status === 409) {
          // Contact exists but wasn't in search results — update it
          const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
            method: "POST",
            headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: lead.email }] }] }),
          });
          const searchData = await searchRes.json();
          const contactId = searchData.results?.[0]?.id;
          if (contactId) {
            await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
              method: "PATCH",
              headers: { "Authorization": `Bearer ${hubToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ properties: props }),
            });
            results.synced++;
            console.log(`Updated (was 409): ${lead.email}`);
          }
        } else {
          const errText = await createRes.text();
          results.failed++;
          results.errors.push({ email: lead.email, status: createRes.status, error: errText.substring(0, 200) });
          console.warn(`Failed: ${lead.email} — ${createRes.status}`);
        }

        // Rate limit: HubSpot allows 100 req / 10 sec for private apps — small delay
        await new Promise(r => setTimeout(r, 150));
      } catch (e) {
        results.failed++;
        results.errors.push({ email: lead.email, error: e.message });
        console.warn(`Error syncing ${lead.email}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      total_leads: allLeads.length,
      unique_emails: uniqueLeads.length,
      batch_synced: results.synced,
      batch_failed: results.failed,
      batch_offset: batchOffset,
      remaining: Math.max(0, uniqueLeads.length - batchOffset - batchSize),
      errors: results.errors.slice(0, 20),
    });
  } catch (error) {
    console.error("backfillHubspotLeads error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});