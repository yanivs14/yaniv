import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const kitKey = Deno.env.get("API_Key_kit");
    if (!kitKey) {
      return Response.json({ error: "Missing Kit API key" }, { status: 500 });
    }

    const v4Headers = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitKey,
    };

    // 1. Find subscriber by email (v4)
    let subscriber = null;
    try {
      const subRes = await fetch(
        `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}&include=tags,attribution`,
        { headers: v4Headers }
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        subscriber = subData?.subscribers?.[0] || null;
      }
    } catch (e) {
      console.warn("Failed to find subscriber:", e.message);
    }

    if (!subscriber) {
      return Response.json({ found: false, email });
    }

    // 2. Fetch all sequences (v4)
    let sequences = [];
    try {
      let afterCursor = null;
      for (let page = 0; page < 5; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/sequences?per_page=1000&after=${afterCursor}`
          : `https://api.kit.com/v4/sequences?per_page=1000`;
        const seqRes = await fetch(url, { headers: v4Headers });
        if (!seqRes.ok) break;
        const seqData = await seqRes.json();
        sequences = sequences.concat(seqData?.sequences || []);
        if (!seqData?.pagination?.has_next_page) break;
        afterCursor = seqData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch sequences:", e.message);
    }

    // 3. For each sequence, check if subscriber is subscribed (v3 API)
    // v3 endpoint: GET /v3/sequences/{id}/subscriptions — returns all subscriptions
    // We check the first few pages to find our subscriber
    const subscriptionChecks = sequences.map(async (seq) => {
      try {
        // Check up to 3 pages (v3 uses page-based pagination)
        for (let pageNum = 1; pageNum <= 3; pageNum++) {
          const subUrl = `https://api.convertkit.com/v3/sequences/${seq.id}/subscriptions?api_key=${kitKey}&sort_order=desc&per_page=500&page=${pageNum}`;
          const subRes = await fetch(subUrl);
          if (!subRes.ok) return null;
          const subData = await subRes.json();
          const subs = subData?.subscriptions || [];
          if (subs.length === 0) return null;
          const found = subs.find(s => s.subscriber_id === subscriber.id);
          if (found) {
            return {
              sequence_id: seq.id,
              sequence_name: seq.name,
              subscribed_at: found.created_at,
              state: found.state,
            };
          }
          if (subs.length < 500) return null; // no more pages
        }
        return null;
      } catch (e) {
        return null;
      }
    });
    const subscribedSequences = (await Promise.all(subscriptionChecks)).filter(Boolean);

    // 4. For each subscribed sequence, fetch emails (v4)
    const sequencesWithEmails = await Promise.all(subscribedSequences.map(async (sub) => {
      try {
        const emailsRes = await fetch(
          `https://api.kit.com/v4/sequences/${sub.sequence_id}/emails`,
          { headers: v4Headers }
        );
        if (!emailsRes.ok) return { ...sub, emails: [] };
        const emailsData = await emailsRes.json();
        return {
          ...sub,
          emails: (emailsData?.emails || []).map(e => ({
            id: e.id,
            subject: e.subject || "(no subject)",
            preview_text: e.preview_text || "",
            position: e.position,
            published: e.published,
            delay_value: e.delay_value,
            delay_unit: e.delay_unit,
          })),
        };
      } catch (e) {
        return { ...sub, emails: [] };
      }
    }));

    // 5. Fetch all sent broadcasts (v4)
    let broadcasts = [];
    try {
      let afterCursor = null;
      for (let page = 0; page < 10; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50&after=${afterCursor}`
          : `https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50`;
        const bRes = await fetch(url, { headers: v4Headers });
        if (!bRes.ok) break;
        const bData = await bRes.json();
        const sentBroadcasts = (bData?.broadcasts || []).filter(b => {
          const sentAt = b.sent_at || b.send_at;
          return sentAt && new Date(sentAt) < new Date();
        }).map(b => ({
          id: b.id,
          subject: b.subject || "(no subject)",
          sent_at: b.sent_at || b.send_at,
        }));
        broadcasts = broadcasts.concat(sentBroadcasts);
        if (!bData?.pagination?.has_next_page) break;
        afterCursor = bData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch broadcasts:", e.message);
    }

    return Response.json({
      found: true,
      subscriber: {
        id: subscriber.id,
        email_address: subscriber.email_address,
        first_name: subscriber.first_name,
        state: subscriber.state,
        created_at: subscriber.created_at,
        tags: subscriber.tags || [],
      },
      subscribed_sequences: sequencesWithEmails,
      broadcasts,
    });
  } catch (error) {
    console.error("getKitSubscriberEmails error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});