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

      // Tag with Newsletter — correct Kit v4 endpoint: POST /v4/tags/{tag_id}/subscribers/{subscriber_id}
      if (subscriberId) {
        try {
          let allTags = [];
          let afterCursor = null;
          for (let page = 0; page < 10; page++) {
            const url = afterCursor
              ? `https://api.kit.com/v4/tags?per_page=1000&after=${afterCursor}`
              : `https://api.kit.com/v4/tags?per_page=1000`;
            const tagsRes = await fetch(url, { headers: kitHeaders });
            if (!tagsRes.ok) break;
            const tagsData = await tagsRes.json();
            allTags = allTags.concat(tagsData?.tags || []);
            if (!tagsData?.pagination?.has_next_page) break;
            afterCursor = tagsData?.pagination?.end_cursor;
            if (!afterCursor) break;
          }
          let tag = allTags.find(t => t.name === "Newsletter");
          if (!tag) {
            const createRes = await fetch("https://api.kit.com/v4/tags", {
              method: "POST",
              headers: kitHeaders,
              body: JSON.stringify({ name: "Newsletter" }),
            });
            if (createRes.ok) tag = (await createRes.json())?.tag;
          }
          if (tag?.id) {
            const tagRes = await fetch(`https://api.kit.com/v4/tags/${tag.id}/subscribers/${subscriberId}`, {
              method: "POST",
              headers: kitHeaders,
              body: JSON.stringify({}),
            });
            if (tagRes.ok) {
              console.log("Kit tag applied: Newsletter → subscriber", subscriberId);
            } else {
              console.warn("Kit tag FAILED: Newsletter → subscriber", subscriberId, `[${tagRes.status}]`);
            }
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