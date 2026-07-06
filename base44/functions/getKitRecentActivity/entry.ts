import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const kitV4Key = Deno.env.get("API_Key_kit");
    const kitV3Secret = Deno.env.get("API_Secret_kit") || kitV4Key;
    if (!kitV4Key) {
      return Response.json({ error: "Missing Kit API key" }, { status: 500 });
    }

    const v4Headers = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitV4Key,
    };

    // 1. Fetch all sequences (v4)
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

    // 2. For each sequence with subscribers, fetch recent subscriptions + emails
    const activeSequences = sequences.filter(s => (s.subscriber_count || 0) > 0);

    const sequenceData = await Promise.all(activeSequences.map(async (seq) => {
      try {
        // Fetch recent subscriptions (v3, sorted desc by created_at)
        const subRes = await fetch(
          `https://api.convertkit.com/v3/sequences/${seq.id}/subscriptions?api_secret=${kitV3Secret}&sort_order=desc&per_page=100&page=1`
        );
        let recentSubs = [];
        if (subRes.ok) {
          const subData = await subRes.json();
          recentSubs = subData?.subscriptions || [];
        }

        // Fetch sequence emails (v4)
        const emailsRes = await fetch(
          `https://api.kit.com/v4/sequences/${seq.id}/emails`,
          { headers: v4Headers }
        );
        let emails = [];
        if (emailsRes.ok) {
          const emailsData = await emailsRes.json();
          emails = (emailsData?.emails || []).filter(e => e.published);
        }

        return { sequence_id: seq.id, sequence_name: seq.name, recentSubs, emails };
      } catch (e) {
        return null;
      }
    }));

    // 3. Build all email delivery events — each is a specific person receiving a specific email
    const events = [];
    const now = new Date();
    for (const seq of sequenceData.filter(Boolean)) {
      for (const sub of seq.recentSubs) {
        let subDateStr = sub.created_at;
        if (!subDateStr) continue;
        if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(subDateStr)) subDateStr = subDateStr + "Z";
        const subDate = new Date(subDateStr);
        if (isNaN(subDate)) continue;

        const subscriber = sub.subscriber || {};
        for (const email of seq.emails) {
          let estimatedDate = new Date(subDate);
          if (email.delay_value && email.delay_unit) {
            if (email.delay_unit === "days") {
              estimatedDate.setDate(estimatedDate.getDate() + email.delay_value);
            } else if (email.delay_unit === "hours") {
              estimatedDate.setHours(estimatedDate.getHours() + email.delay_value);
            } else if (email.delay_unit === "weeks") {
              estimatedDate.setDate(estimatedDate.getDate() + (email.delay_value * 7));
            } else if (email.delay_unit === "months") {
              estimatedDate.setMonth(estimatedDate.getMonth() + email.delay_value);
            }
          }

          // Only include emails that would have been sent by now
          if (estimatedDate <= now) {
            events.push({
              subscriber_email: subscriber.email_address || "—",
              subscriber_name: subscriber.first_name || "",
              email_subject: email.subject || "(no subject)",
              sequence_name: seq.sequence_name,
              position: email.position,
              sent_date: estimatedDate.toISOString(),
            });
          }
        }
      }
    }

    // Sort by date desc, take 15
    events.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));
    const top15 = events.slice(0, 15);

    return Response.json({ recent_activity: top15 });
  } catch (error) {
    console.error("getKitRecentActivity error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});