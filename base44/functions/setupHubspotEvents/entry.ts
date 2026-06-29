import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * One-time setup: creates all 5 custom behavioral event definitions in HubSpot
 * via the event-definitions API. Uses the exact internal name format that
 * trackEvent sends (pe{portalId}_{eventName}).
 *
 * Required HubSpot scope: behavioral_events.event_definitions.read_write
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
    if (!hubToken) {
      return Response.json({ error: "HUBSPOT_PRIVATE_APP_TOKEN not set" }, { status: 500 });
    }

    // Get the portal ID from the token
    const infoRes = await fetch("https://api.hubapi.com/integrations/v1/me", {
      headers: { Authorization: `Bearer ${hubToken}` },
    });
    if (!infoRes.ok) {
      return Response.json({ error: "Cannot fetch HubSpot account info", status: infoRes.status, detail: await infoRes.text() }, { status: 500 });
    }
    const info = await infoRes.json();
    const portalId = info.portalId;
    if (!portalId) {
      return Response.json({ error: "Cannot determine HubSpot portal ID" }, { status: 500 });
    }

    // HubSpot auto-prepends "pe{portalId}_" to the internal name.
    // So we define with just the short name, and the full name becomes pe{portalId}_{name}.
    const events = [
      { name: "page_view", label: "Page View", description: "User viewed a page on the site" },
      { name: "cta_clicked", label: "CTA Clicked", description: "User clicked a call-to-action button" },
      { name: "quiz_opened", label: "Quiz Opened", description: "User opened the movement quiz" },
      { name: "pricing_viewed", label: "Pricing Viewed", description: "User viewed the pricing section" },
      { name: "lead_capture", label: "Lead Capture", description: "User submitted their contact details" },
    ];

    const results = [];

    for (const ev of events) {
      const fullName = `pe${portalId}_${ev.name}`;
      // Check if the event definition already exists
      const checkRes = await fetch(`https://api.hubapi.com/events/v3/event-definitions/${fullName}`, {
        headers: { Authorization: `Bearer ${hubToken}` },
      });

      if (checkRes.ok) {
        results.push({ event: fullName, status: "already_exists" });
        continue;
      }

      // Create the event definition — HubSpot auto-prepends "pe{portalId}_"
      const createRes = await fetch("https://api.hubapi.com/events/v3/event-definitions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: ev.name,
          label: ev.label,
          description: ev.description,
          primaryObject: "CONTACT",
        }),
      });

      if (createRes.ok) {
        results.push({ event: fullName, status: "created" });
      } else {
        const errText = await createRes.text();
        results.push({ event: fullName, status: "failed", code: createRes.status, error: errText });
      }
    }

    return Response.json({ success: true, portalId, results });
  } catch (error) {
    console.error("setupHubspotEvents error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});