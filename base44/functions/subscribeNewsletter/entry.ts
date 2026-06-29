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

    // Sync to Kit (v4 API) + tag with Newsletter
    const kitKey = Deno.env.get("API_Key_kit");
    if (kitKey) {
      const kitHeaders = { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey };
      let subscriberId = null;
      const kitRes = await fetch("https://api.kit.com/v4/subscribers", {
        method: "POST",
        headers: kitHeaders,
        body: JSON.stringify({
          email_address: email.trim(),
          state: "active",
          fields: { source: source || 'newsletter' }
        })
      });
      if (kitRes.ok) {
        subscriberId = (await kitRes.json())?.subscriber?.id;
        console.log("Kit newsletter subscriber synced:", subscriberId);
      } else {
        console.warn("Kit sync failed:", kitRes.status, await kitRes.text());
      }

      // Tag with Newsletter
      if (subscriberId) {
        try {
          const tagsRes = await fetch("https://api.kit.com/v4/tags", { headers: kitHeaders });
          const existingTags = (await tagsRes.json())?.tags || [];
          let tag = existingTags.find(t => t.name === "Newsletter");
          if (!tag) {
            const createRes = await fetch("https://api.kit.com/v4/tags", {
              method: "POST",
              headers: kitHeaders,
              body: JSON.stringify({ name: "Newsletter" }),
            });
            if (createRes.ok) tag = (await createRes.json())?.tag;
          }
          if (tag?.id) {
            await fetch(`https://api.kit.com/v4/subscribers/${subscriberId}/tags`, {
              method: "POST",
              headers: kitHeaders,
              body: JSON.stringify({ tag_id: tag.id }),
            });
            console.log("Kit tag applied: Newsletter");
          }
        } catch (tagErr) {
          console.warn("Kit tagging failed:", tagErr.message);
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('subscribeNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});