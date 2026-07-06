import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetYear = body.target_year;
    const yearBoundary = (targetYear && targetYear !== "all")
      ? new Date(parseInt(targetYear), 0, 1)
      : null;

    const kitKey = Deno.env.get("API_Key_kit");
    if (!kitKey) {
      return Response.json({ error: "Missing Kit API key" }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitKey,
    };

    // 1) Fetch broadcasts list (metadata) — paginated
    let broadcastsMeta = [];
    try {
      let afterCursor = null;
      for (let page = 0; page < 10; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50&after=${afterCursor}`
          : `https://api.kit.com/v4/broadcasts?sort_order=desc&per_page=50`;
        const res = await fetch(url, { headers });
        if (!res.ok) break;
        const data = await res.json();
        broadcastsMeta = broadcastsMeta.concat(data?.broadcasts || []);
        if (!data?.pagination?.has_next_page) break;
        afterCursor = data?.pagination?.end_cursor;
        if (!afterCursor) break;
        // Stop if oldest broadcast in this page is before the target year
        if (yearBoundary && data?.broadcasts?.length > 0) {
          const lastB = data.broadcasts[data.broadcasts.length - 1];
          const lastDate = new Date(lastB.sent_at || lastB.send_at || lastB.created_at);
          if (!isNaN(lastDate) && lastDate < yearBoundary) break;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch broadcasts:", e.message);
    }

    // 2) Fetch broadcast STATS — paginated
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
        // Stop early if we have stats for all broadcasts we need
        if (broadcastsMeta.length > 0) {
          const allFound = broadcastsMeta.every(b => statsMap.has(b.id));
          if (allFound) break;
        }
        if (!statsData?.pagination?.has_next_page) break;
        afterCursor = statsData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch broadcast stats:", e.message);
    }

    // 3) Merge broadcasts + stats
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

    // 4) Fetch total subscriber count (include_total_count, fallback to pagination)
    let subscriberCount = 0;
    try {
      const subRes = await fetch(
        "https://api.kit.com/v4/subscribers?include_total_count=true&per_page=1",
        { headers }
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        subscriberCount = subData?.total_count || subData?.pagination?.total_count || 0;
      }
    } catch (e) {
      console.warn("Failed to fetch subscriber count:", e.message);
    }
    // Fallback: paginate if include_total_count didn't work
    if (!subscriberCount) {
      try {
        let afterCursor = null;
        for (let page = 0; page < 50; page++) {
          const url = afterCursor
            ? `https://api.kit.com/v4/subscribers?per_page=1000&after=${afterCursor}`
            : "https://api.kit.com/v4/subscribers?per_page=1000";
          const subRes = await fetch(url, { headers });
          if (!subRes.ok) break;
          const subData = await subRes.json();
          const subs = subData?.subscribers || [];
          subscriberCount += subs.length;
          if (!subData?.pagination?.has_next_page || subs.length === 0) break;
          afterCursor = subData?.pagination?.end_cursor;
          if (!afterCursor) break;
        }
      } catch (e) {
        console.warn("Failed to paginate subscriber count:", e.message);
      }
    }

    // 5) Fetch tags (paginated)
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
    } catch (e) {
      console.warn("Failed to fetch tags:", e.message);
    }

    // 6) Fetch subscriber count per tag (in parallel)
    const tagsWithCounts = await Promise.all(tags.map(async (t) => {
      let count = 0;
      try {
        const res = await fetch(
          `https://api.kit.com/v4/tags/${t.id}/subscribers?include_total_count=true&per_page=1`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          count = data?.total_count || data?.pagination?.total_count || 0;
        }
      } catch (e) {
        console.warn(`Failed to fetch count for tag ${t.id}:`, e.message);
      }
      return { id: t.id, name: t.name, subscriber_count: count };
    }));

    // 7) Fetch sequences — per_page=1000, use subscriber_count from object
    let sequences = [];
    let totalSequences = 0;
    try {
      let afterCursor = null;
      for (let page = 0; page < 5; page++) {
        const url = afterCursor
          ? `https://api.kit.com/v4/sequences?per_page=1000&include_total_count=true&after=${afterCursor}`
          : `https://api.kit.com/v4/sequences?per_page=1000&include_total_count=true`;
        const seqRes = await fetch(url, { headers });
        if (!seqRes.ok) break;
        const seqData = await seqRes.json();
        if (page === 0) totalSequences = seqData?.total_count || seqData?.sequences?.length || 0;
        sequences = sequences.concat((seqData?.sequences || []).map(s => ({
          id: s.id,
          name: s.name || "Untitled",
          created_at: s.created_at,
          subscribers: s.subscriber_count || 0,
          thumbnail_url: s.thumbnail_url || null,
          email_count: s.email_count || 0,
          active: s.active !== false,
        })));
        if (!seqData?.pagination?.has_next_page) break;
        afterCursor = seqData?.pagination?.end_cursor;
        if (!afterCursor) break;
      }
    } catch (e) {
      console.warn("Failed to fetch sequences:", e.message);
    }

    // Aggregate broadcast stats
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
      ? aggregate.total_opens / aggregate.total_recipients : 0;
    const avg_click_rate = aggregate.total_recipients > 0
      ? aggregate.total_clicks / aggregate.total_recipients : 0;

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
        total_sequences: totalSequences || sequences.length,
        total_tags: tags.length,
      },
      broadcasts,
      sequences,
      tags: tagsWithCounts,
    });
  } catch (error) {
    console.error("getKitStats error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});