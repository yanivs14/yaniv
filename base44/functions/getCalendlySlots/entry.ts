import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("calendly");

    // Get current user
    const meRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData = await meRes.json();
    const userUri = meData.resource?.uri;

    if (!userUri) {
      return Response.json({ error: "Could not get user URI" }, { status: 400 });
    }

    // Get event types
    const etRes = await fetch(`https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&active=true`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const etData = await etRes.json();
    const eventTypes = (etData.collection || []).filter(et => et.active);

    if (eventTypes.length === 0) {
      return Response.json({ slots: [], eventTypes: [] });
    }

    // Get available slots for next 14 days (split into two 7-day windows)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const week1Start = now.toISOString();
    const week1End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const week2End = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const allSlots = [];

    for (const et of eventTypes) {
      // Fetch slots for week 1
      const s1Res = await fetch(
        `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(et.uri)}&start_time=${encodeURIComponent(week1Start)}&end_time=${encodeURIComponent(week1End)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const s1Data = await s1Res.json();

      // Fetch slots for week 2
      const s2Res = await fetch(
        `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(et.uri)}&start_time=${encodeURIComponent(week1End)}&end_time=${encodeURIComponent(week2End)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const s2Data = await s2Res.json();

      const slots = [
        ...(s1Data.collection || []),
        ...(s2Data.collection || [])
      ].map(s => ({
        start_time: s.start_time,
        invitees_remaining: s.invitees_remaining,
        event_type_name: et.name,
        scheduling_url: et.scheduling_url,
        duration: et.duration
      }));

      allSlots.push(...slots);
    }

    // Sort by time
    allSlots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return Response.json({ slots: allSlots, eventTypes });
  } catch (error) {
    console.error("Calendly error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});