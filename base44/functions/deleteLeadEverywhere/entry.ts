import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { lead_id, email } = await req.json();

    if (!lead_id && !email) {
      return Response.json({ error: 'lead_id or email required' }, { status: 400 });
    }

    // Find the lead
    let lead = null;
    if (lead_id) {
      try {
        lead = await base44.asServiceRole.entities.Lead.get(lead_id);
      } catch (e) {
        console.log('Lead not found by ID, trying by email');
      }
    }
    if (!lead && email) {
      const leads = await base44.asServiceRole.entities.Lead.filter({ email });
      lead = leads?.[0] || null;
    }

    const targetEmail = lead?.email || email || '';
    const targetName = lead?.full_name || '';

    const results = { lead: false, emailLogs: false, newsletter: false, kit: false, hubspot: false };

    // 1. Delete Lead record(s)
    if (lead) {
      try {
        await base44.asServiceRole.entities.Lead.delete(lead.id);
        results.lead = true;
      } catch (e) {
        console.warn('Failed to delete lead:', e.message);
      }
    }
    // Also delete any duplicate leads with same email
    if (targetEmail) {
      try {
        const dupLeads = await base44.asServiceRole.entities.Lead.filter({ email: targetEmail });
        for (const dl of dupLeads) {
          try { await base44.asServiceRole.entities.Lead.delete(dl.id); } catch {}
        }
      } catch (e) {
        console.warn('Failed to delete duplicate leads:', e.message);
      }
    }

    // 2. Delete EmailLog records
    if (targetEmail) {
      try {
        await base44.asServiceRole.entities.EmailLog.deleteMany({ recipient_email: targetEmail });
        results.emailLogs = true;
      } catch (e) {
        console.warn('Failed to delete email logs:', e.message);
      }
    }

    // 3. Delete NewsletterSubscriber records
    if (targetEmail) {
      try {
        await base44.asServiceRole.entities.NewsletterSubscriber.deleteMany({ email: targetEmail });
        results.newsletter = true;
      } catch (e) {
        console.warn('Failed to delete newsletter subscribers:', e.message);
      }
    }

    // 4. Unsubscribe from Kit / ConvertKit
    if (targetEmail) {
      try {
        const kitKey = Deno.env.get("KIT_API_KEY");
        if (kitKey) {
          const unsubRes = await fetch("https://api.convertkit.com/v3/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: kitKey, email: targetEmail }),
          });
          if (unsubRes.ok) results.kit = true;
        }
      } catch (e) {
        console.warn('Kit unsubscribe failed:', e.message);
      }
    }

    // 5. Delete from HubSpot CRM
    if (targetEmail) {
      try {
        const hubspotToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
        if (hubspotToken) {
          const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hubspotToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              filterGroups: [{
                filters: [{
                  propertyName: "email",
                  operator: "EQ",
                  value: targetEmail
                }]
              }]
            })
          });
          const searchData = await searchRes.json();
          const contactId = searchData?.results?.[0]?.id;
          if (contactId) {
            const delRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${hubspotToken}` }
            });
            if (delRes.ok) results.hubspot = true;
          }
        }
      } catch (e) {
        console.warn('HubSpot deletion failed:', e.message);
      }
    }

    console.log(`Lead deleted everywhere: ${targetName} (${targetEmail})`, results);

    return Response.json({
      success: true,
      name: targetName,
      email: targetEmail,
      results
    });
  } catch (error) {
    console.error('deleteLeadEverywhere error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});