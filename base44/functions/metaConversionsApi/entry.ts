/**
 * Meta Conversions API — server-side event forwarding to Facebook.
 * Receives event data from the frontend (PageView, AddToCart) or from
 * stripeWebhook (Purchase, Subscribe), hashes PII with SHA-256, and
 * sends to the Meta Graph API.
 *
 * Deduplication: when the same event_id is used for both the browser
 * Pixel event and the CAPI event, Meta counts them as a single event.
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      action_source,
      user_data = {},
      custom_data = {},
    } = body;

    const pixelId = Deno.env.get("META_PIXEL_ID");
    const accessToken = Deno.env.get("META_ACCESS_TOKEN");

    if (!pixelId || !accessToken) {
      return Response.json({ skipped: true, reason: "missing_meta_credentials" });
    }

    if (!event_name) {
      return Response.json({ error: "event_name required" }, { status: 400 });
    }

    // SHA-256 hash for PII fields (Meta requires hashed values)
    const hash = async (value) => {
      if (!value) return null;
      const normalized = String(value).trim().toLowerCase();
      const encoded = new TextEncoder().encode(normalized);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    const hashedUserData = {};
    if (user_data.em) hashedUserData.em = [await hash(user_data.em)];
    if (user_data.ph) hashedUserData.ph = [await hash(user_data.ph)];
    if (user_data.fn) hashedUserData.fn = [await hash(user_data.fn)];
    if (user_data.ln) hashedUserData.ln = [await hash(user_data.ln)];
    if (user_data.fbp) hashedUserData.fbp = user_data.fbp;
    if (user_data.fbc) hashedUserData.fbc = user_data.fbc;
    if (user_data.client_user_agent) hashedUserData.client_user_agent = user_data.client_user_agent;

    const eventPayload = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      action_source: action_source || "website",
      event_source_url: event_source_url || "",
      user_data: hashedUserData,
      custom_data,
    };
    if (event_id) eventPayload.event_id = event_id;

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [eventPayload] }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Meta CAPI ${event_name} failed:`, res.status, errText);
      return Response.json({ skipped: true, reason: "meta_error", status: res.status, detail: errText });
    }

    const data = await res.json();
    console.log(`Meta CAPI ${event_name} sent: event_id=${event_id || "none"} | fb_trace_id=${data?.fbtrace_id || ""}`);
    return Response.json({ success: true, event: event_name, event_id });
  } catch (error) {
    console.error("Meta CAPI error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});