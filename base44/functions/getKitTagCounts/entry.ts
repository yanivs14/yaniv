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

    // Parse optional date params from request body
    let createdAfter = null;
    let createdBefore = null;
    try {
      const body = await req.json();
      createdAfter = body?.created_after || null;
      createdBefore = body?.created_before || null;
    } catch (e) {
      // No body — return total counts
    }

    // Fetch all tags
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

    // Build date query suffix
    let dateQuery = "";
    if (createdAfter) dateQuery += `&created_after=${createdAfter}`;
    if (createdBefore) dateQuery += `&created_before=${createdBefore}`;

    // Fetch subscriber count per tag (in parallel)
    const tagsWithCounts = await Promise.all(tags.map(async (t) => {
      let count = 0;
      try {
        const res = await fetch(
          `https://api.kit.com/v4/tags/${t.id}/subscribers?include_total_count=true&per_page=1${dateQuery}`,
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

    // Fetch total subscriber count with same date filter
    let totalSubscribers = 0;
    try {
      const res = await fetch(
        `https://api.kit.com/v4/subscribers?include_total_count=true&per_page=1${dateQuery}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        totalSubscribers = data?.total_count || data?.pagination?.total_count || 0;
      }
    } catch (e) {
      console.warn("Failed to fetch total subscriber count:", e.message);
    }

    return Response.json({
      tags: tagsWithCounts,
      total_subscribers: totalSubscribers,
    });
  } catch (error) {
    console.error("getKitTagCounts error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});