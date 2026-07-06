import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("calendly");
    if (!accessToken) {
      return Response.json({ error: 'Calendly not connected' }, { status: 400 });
    }

    // Get user URI
    const meRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData = await meRes.json();
    const userUri = meData.resource?.uri;

    if (!userUri) {
      return Response.json({ error: 'Could not fetch Calendly user' }, { status: 500 });
    }

    // Fetch events from 12 months ago to 30 days ahead (includes past/history)
    const now = new Date();
    const startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Paginate through all events
    let allEvents = [];
    let nextPageToken = null;
    let pageCount = 0;
    while (pageCount < 10) {
      let url = `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${encodeURIComponent(startTime.toISOString())}&max_start_time=${encodeURIComponent(endTime.toISOString())}&count=100`;
      if (nextPageToken) url += `&page_token=${encodeURIComponent(nextPageToken)}`;
      const evRes = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!evRes.ok) {
        console.warn(`Calendly events page ${pageCount} failed: ${evRes.status}`);
        break;
      }
      const evData = await evRes.json();
      allEvents = allEvents.concat(evData.collection || []);
      nextPageToken = evData.pagination?.next_page_token;
      if (!nextPageToken) break;
      pageCount++;
    }
    const events = allEvents;
    console.log(`Calendly: fetched ${events.length} events from ${startTime.toISOString().slice(0, 10)} to ${endTime.toISOString().slice(0, 10)}`);

    // For each event, fetch invitees and build email → meetings map
    const meetingsByEmail = {};

    for (const ev of events) {
      try {
        const eventUuid = ev.uuid || ev.uri?.split('/').pop();
        if (!eventUuid) {
          console.warn('Event without uuid/uri:', JSON.stringify(ev).substring(0, 200));
          continue;
        }
        const invRes = await fetch(
          `https://api.calendly.com/scheduled_events/${eventUuid}/invitees?count=10`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const invData = await invRes.json();
        const invitees = invData.collection || [];

        const startDate = new Date(ev.start_time);
        const formatted = startDate.toLocaleString('en-GB', {
          timeZone: 'Asia/Jerusalem',
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(',', '');

        const meetingInfo = {
          event_uuid: eventUuid,
          event_name: ev.name || 'Consultation Call',
          start_time: ev.start_time,
          end_time: ev.end_time,
          formatted_time: formatted,
          location: ev.location?.location || '',
          join_url: ev.location?.join_url || (ev.location?.location && ev.location.location.startsWith('http') ? ev.location.location.split(' (')[0] : ''),
          cancel_url: invitees[0]?.cancel_url || '',
          reschedule_url: invitees[0]?.reschedule_url || '',
        };

        for (const inv of invitees) {
          if (inv.email) {
            const key = inv.email.toLowerCase();
            if (!meetingsByEmail[key]) {
              meetingsByEmail[key] = [];
            }
            meetingsByEmail[key].push({
              ...meetingInfo,
              invitee_name: inv.name || '',
              invitee_email: inv.email,
              invitee_uuid: inv.uuid,
            });
          }
        }
      } catch (invErr) {
        console.warn(`Failed to fetch invitees for event ${ev.uuid}:`, invErr.message);
      }
    }

    // Sort each email's meetings by start time
    for (const key of Object.keys(meetingsByEmail)) {
      meetingsByEmail[key].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }

    return Response.json({
      meetingsByEmail,
      totalEvents: events.length,
      totalWithInvitees: Object.keys(meetingsByEmail).length,
    });
  } catch (error) {
    console.error("getCalendlyMeetings error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});