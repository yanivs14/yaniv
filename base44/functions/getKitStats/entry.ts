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

    // 1) Fetch broadcasts list (metadata)
    const broadcastsRes = await fetch("https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50", { headers });
    const broadcastsData = broadcastsRes.ok ? await broadcastsRes.json() : { broadcasts: [] };
    const broadcastsMeta = broadcastsData?.broadcasts || [];

    // 2) Fetch broadcast STATS from the dedicated stats endpoint (paginated)
    const statsMap = new Map();
    try {
      let afterCursor = null;
      for (let page = 0; page < 10; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/broadcasts/stats?per_page=1000&after=${afterCursor}`
          : `https://api.kit.com/v4/broadcasts/stats?per_page=1000`;
        const statsRes = await fetch(url, { headers });
        if (!statsRes.ok) break;
        const statsData = await statsRes.json();
        for (const b of (statsData?.broadcasts || [])) {
          statsMap.set(b.id, b.stats || {});
        }
        if (!statsData?.pagination?.has_next_page) break;
        afterCursor = statsData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch broadcast stats:", e.message);
    }

    // 3) Merge: broadcasts list + stats
    const broadcasts = broadcastsMeta.map(b => {
      const sentAt = b.sent_at || b.send_at;
      const isSent = !!sentAt && new Date(sentAt) < new Date();
      const st = statsMap.get(b.id) || {};
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
          recipients: st.recipients || 0,
          opens: st.emails_opened || 0,
          open_rate: (st.open_rate || 0) / 100,
          clicks: st.total_clicks || 0,
          click_rate: (st.click_rate || 0) / 100,
          unsubscribes: st.unsubscribes || 0,
          total_clicks: st.total_clicks || 0,
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

    // 4) Fetch total subscriber count — paginate through all (BEFORE sequence calls to avoid rate limits)
    let subscriberCount = 0;
    try {
      let afterCursor = null;
      for (let page = 0; page < 50; page++) {
        const base = "https://api.kit.com/v4/subscribers?per_page=1000";
        const url = afterCursor ? `${base}&after=${afterCursor}` : base;
        const subRes = await fetch(url, { headers });
        if (!subRes.ok) { console.warn("subRes not ok:", subRes.status); break; }
        const subData = await subRes.json();
        const subs = subData?.subscribers || [];
        subscriberCount += subs.length;
        if (!subData?.pagination?.has_next_page || subs.length === 0) break;
        afterCursor = subData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch subscriber count:", e.message);
    }

    // 5) Fetch tags (paginated)
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

    // 6) Fetch sequences list
    const sequencesRes = await fetch("https://api.kit.com/v4/sequences?per_page=100", { headers });
    const sequencesData = sequencesRes.ok ? await sequencesRes.json() : { sequences: [] };
    const seqList = (sequencesData?.sequences || []).slice(0, 50);

    // 7) Fetch subscriber count per sequence (in parallel, capped at 50)
    const sequences = await Promise.all(seqList.map(async (s) => {
      let subCount = 0;
      try {
        const subRes = await fetch(
          `https://api.kit.com/v4/sequences/${s.id}/subscribers?per_page=500`,
          { headers }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          const subs = subData?.subscribers || [];
          subCount = subs.length;
          if (subs.length === 500 && subData?.pagination?.has_next_page) {
            let cursor = subData?.pagination?.end_cursor;
            while (cursor) {
              const nextRes = await fetch(
                `https://api.kit.com/v4/sequences/${s.id}/subscribers?per_page=500&after=${cursor}`,
                { headers }
              );
              if (!nextRes.ok) break;
              const nextData = await nextRes.json();
              const nextSubs = nextData?.subscribers || [];
              subCount += nextSubs.length;
              if (!nextData?.pagination?.has_next_page || nextSubs.length === 0) break;
              cursor = nextData?.pagination?.end_cursor;
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch subscribers for sequence ${s.id}:`, e.message);
      }
      return {
        id: s.id,
        name: s.name || "Untitled",
        created_at: s.created_at,
        subscribers: subCount,
        thumbnail_url: s.thumbnail_url || null,
      };
    }));

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
        total_sequences: sequencesData?.sequences?.length || 0,
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