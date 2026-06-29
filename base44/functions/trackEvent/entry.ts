import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Forwards behavioral events to HubSpot (events/v3/send API).
 * Only fires when an email is present (known contact).
 * Called from the client analytics module for: page_view, cta_clicked,
 * pricing_viewed, quiz_opened, lead_capture.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event_name, email, idempotency_key, ...params } = body;

    if (!email || !event_name) {
      return Response.json({ skipped: true });
    }

    const hubToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
    if (!hubToken) {
      return Response.json({ skipped: true, reason: "no_hubspot_token" });
    }

    // Build properties — filter out empty values and non-string types
    const properties = Object.entries(params)
      .filter(([k, v]) => k !== "email" && v !== "" && v != null && k !== "event")
      .map(([k, v]) => ({ name: k, value: String(v) }));

    const hubspotEventName = `pe.${event_name}`;

    const res = await fetch("https://api.hubapi.com/events/v3/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        eventName: hubspotEventName,
        occurredAt: new Date().toISOString(),
        properties,
        objectId: undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`HubSpot event ${event_name} failed:`, res.status, errText);
      return Response.json({ skipped: true, reason: "hubspot_error", status: res.status });
    }

    return Response.json({ success: true, event: event_name });
  } catch (error) {
    console.error("trackEvent error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});