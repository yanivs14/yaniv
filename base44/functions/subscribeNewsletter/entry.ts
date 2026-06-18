import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Save to database
    await base44.asServiceRole.entities.NewsletterSubscriber.create({
      email: email.trim(),
      source: source || 'unknown'
    });

    // Sync to Kit.com
    const kitKey = Deno.env.get("KIT_API_KEY");
    if (kitKey) {
      const kitRes = await fetch("https://api.convertkit.com/v3/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: kitKey,
          email: email.trim(),
          fields: { source: source || 'newsletter' }
        })
      });
      const kitData = await kitRes.json();
      if (!kitRes.ok) {
        console.warn("Kit sync failed:", JSON.stringify(kitData));
      } else {
        console.log("Kit subscriber synced:", kitData?.subscriber?.id);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('subscribeNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});