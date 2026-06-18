import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { full_name, email, phone, source, quiz_recommendation } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const token = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");

    const nameParts = (full_name || "").trim().split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    const properties = {
      email,
      firstname,
      lastname,
      phone: phone || "",
      lead_source: source || "website",
    };

    if (quiz_recommendation) {
      properties.hs_lead_status = quiz_recommendation;
    }

    // Try to create contact, if exists update it
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