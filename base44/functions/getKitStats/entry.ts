import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const kitKey = Deno.env.get("API_Key_kit");
    if (!kitKey) {
      return Response.json({ error: "Missing Kit API key" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitKey,
    };

    // Fetch broadcasts (with stats) — most recent first
    const broadcastsRes = await fetch("https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50", { headers });
    const broadcastsData = broadcastsRes.ok ? await broadcastsRes.json() : { broadcasts: [] };
    const broadcasts = (broadcastsData?.broadcasts || []).map(b => {
      const sentAt = b.sent_at || b.send_at;
      const isSent = !!sentAt && new Date(sentAt) < new Date();
      return {
        id: b.id,
        subject: b.subject || "(no subject)",
        description: b.description || "",
        created_at: b.created_at,
        send_at: b.send_at,
        sent_at: sentAt,
        is_sent: isSent,
        email_address: b.email_address || null,
        thumbnail_url: b.thumbnail_url || null,
        public: b.public || false,
        stats: {
          recipients: b.stats?.recipients || 0,
          opens: b.stats?.opens || 0,
          open_rate: b.stats?.open_rate || 0,
          clicks: b.stats?.clicks || 0,
          click_rate: b.stats?.click_rate || 0,
          unsubscribes: b.stats?.unsubscribes || 0,
          total_clicks: b.stats?.total_clicks || 0,
        },
      };
    });

    // Aggregate stats across sent broadcasts
    const aggregate = broadcasts.reduce((acc, b) => {
      if (!b.is_sent) return acc;
      acc.total_recipients += b.stats.recipients;
      acc.total_opens += b.stats.opens;
      acc.total_clicks += b.stats.clicks;
      acc.total_unsubscribes += b.stats.unsubscribes;
      acc.total_sent += 1;
      return acc;
    }, { total_recipients: 0, total_opens: 0, total_clicks: 0, total_unsubscribes: 0, total_sent: 0 });

    const avg_open_rate = aggregate.total_recipients > 0
      ? aggregate.total_opens / aggregate.total_recipients
      : 0;
    const avg_click_rate = aggregate.total_recipients > 0
      ? aggregate.total_clicks / aggregate.total_recipients
      : 0;

    // Fetch sequences (with subscriber counts)
    const sequencesRes = await fetch("https://api.kit.com/v4/sequences?per_page=50", { headers });
    const sequencesData = sequencesRes.ok ? await sequencesRes.json() : { sequences: [] };
    const sequences = (sequencesData?.sequences || []).map(s => ({
      id: s.id,
      name: s.name || "Untitled",
      created_at: s.created_at,
      subscribers: s.subscribers || 0,
      thumbnail_url: s.thumbnail_url || null,
    }));

    // Fetch subscriber count (Kit v4 uses cursor pagination, no total field — count first page)
    let subscriberCount = 0;
    try {
      const subRes = await fetch("https://api.kit.com/v4/subscribers?per_page=1000&sort_order=desc", { headers });
      if (subRes.ok) {
        const subData = await subRes.json();
        subscriberCount = (subData?.subscribers || []).length;
      }
    } catch (e) {
      console.warn("Failed to fetch subscriber count:", e.message);
    }

    // Fetch tags count
    let tagCount = 0;
    let tags = [];
    try {
      let afterCursor = null;
      for (let page = 0; page < 5; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/tags?per_page=1000&after=${afterCursor}`
          : `https://api.kit.com/v4/tags?per_page=1000`;
        const tagsRes = await fetch(url, { headers });
        if (!tagsRes.ok) break;
        const tagsData = await tagsRes.json();
        tags = tags.concat((tagsData?.tags || []).map(t => ({ id: t.id, name: t.name })));
        if (!tagsData?.pagination?.has_next_page) break;
        afterCursor = tagsData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
      tagCount = tags.length;
    } catch (e) {
      console.warn("Failed to fetch tags:", e.message);
    }

    return Response.json({
      summary: {
        total_subscribers: subscriberCount,
        total_broadcasts_sent: aggregate.total_sent,
        total_recipients: aggregate.total_recipients,
        total_opens: aggregate.total_opens,
        total_clicks: aggregate.total_clicks,
        total_unsubscribes: aggregate.total_unsubscribes,
        avg_open_rate,
        avg_click_rate,
        total_sequences: sequences.length,
        total_tags: tagCount,
      },
      broadcasts,
      sequences,
      tags: tags.slice(0, 50),
    });
  } catch (error) {
    console.error("getKitStats error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});