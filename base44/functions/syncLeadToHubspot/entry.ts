import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both: called directly (flat payload) OR via entity automation (body.data)
    const lead = body.data || body;

    const { full_name, email, phone, source, quiz_section, quiz_recommendation } = lead;

    if (!email) {
      console.log("No email found, skipping HubSpot sync. Lead:", JSON.stringify(lead));
      return Response.json({ skipped: true, reason: "no email" });
    }

    const token = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
    if (!token) {
      console.error("HUBSPOT_PRIVATE_APP_TOKEN is not set");
      return Response.json({ error: "Missing HubSpot token" }, { status: 500 });
    }

    const nameParts = (full_name || "").trim().split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    // Build a readable note about the lead's origin
    const originParts = [];
    if (source) originParts.push(`Form: ${source}`);
    if (quiz_section) originParts.push(`Section: ${quiz_section}`);
    if (quiz_recommendation) originParts.push(`Recommendation: ${quiz_recommendation}`);

    const properties = {
      email,
      firstname,
      lastname,
      phone: phone || "",
      hs_lead_status: "NEW",
      message: originParts.length > 0 ? originParts.join(" | ") : undefined,
    };

    // Remove undefined fields
    Object.keys(properties).forEach(k => properties[k] === undefined && delete properties[k]);

    // Try to create contact
    const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (createRes.ok) {
      const data = await createRes.json();
      console.log("HubSpot contact created:", data.id);
      return Response.json({ success: true, hubspot_id: data.id });
    }

    // If conflict (contact already exists), update by email
    if (createRes.status === 409) {
      const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
        }),
      });

      const searchData = await searchRes.json();
      const contactId = searchData.results?.[0]?.id;

      if (contactId) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        });
        console.log("HubSpot contact updated:", contactId);
        return Response.json({ success: true, hubspot_id: contactId, updated: true });
      }
    }

    const errorText = await createRes.text();
    console.error("HubSpot error:", createRes.status, errorText);
    return Response.json({ error: "HubSpot sync failed", details: errorText }, { status: 500 });

  } catch (error) {
    console.error("syncLeadToHubspot error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});