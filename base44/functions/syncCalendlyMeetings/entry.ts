import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("calendly");
    if (!accessToken) {
      return Response.json({ error: 'Calendly not connected' }, { status: 400 });
    }

    // Get Calendly user URI
    const meRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meData = await meRes.json();
    const userUri = meData.resource?.uri;
    if (!userUri) {
      return Response.json({ error: 'Could not fetch Calendly user' }, { status: 500 });
    }

    // Get admin notification emails
    let adminEmails = [];
    try {
      const settings = await base44.asServiceRole.entities.LeadSettings.list();
      adminEmails = settings?.[0]?.recipient_emails || [];
    } catch (e) {
      console.warn('Could not fetch LeadSettings:', e.message);
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const pastTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days back for cancellations

    // Fetch active events (upcoming)
    const activeRes = await fetch(
      `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${encodeURIComponent(now.toISOString())}&max_start_time=${encodeURIComponent(endTime.toISOString())}&count=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const activeData = await activeRes.json();
    const activeEvents = activeData.collection || [];

    // Fetch canceled events (recently cancelled, last 7 days)
    const canceledRes = await fetch(
      `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=canceled&min_start_time=${encodeURIComponent(pastTime.toISOString())}&max_start_time=${encodeURIComponent(endTime.toISOString())}&count=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const canceledData = await canceledRes.json();
    const canceledEvents = canceledData.collection || [];

    // Load all existing tracking records
    const existingTracking = await base44.asServiceRole.entities.CalendlyTracking.list('-created_date', 500);
    const trackingMap = {};
    for (const t of existingTracking) {
      trackingMap[t.event_uuid] = t;
    }

    const newBookings = [];
    const newCancellations = [];
    const allMeetingsByEmail = {};

    // Process active events — detect new bookings
    for (const ev of activeEvents) {
      const eventUuid = ev.uuid || ev.uri?.split('/').pop();
      if (!eventUuid) continue;

      try {
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

        for (const inv of invitees) {
          if (!inv.email) continue;
          const emailKey = inv.email.toLowerCase();

          // Build meetings map for CRM update
          if (!allMeetingsByEmail[emailKey]) allMeetingsByEmail[emailKey] = [];
          allMeetingsByEmail[emailKey].push({
            event_name: ev.name || 'Consultation Call',
            start_time: ev.start_time,
            formatted_time: formatted,
          });

          const existing = trackingMap[eventUuid];
          if (!existing) {
            // New booking!
            const tracking = await base44.asServiceRole.entities.CalendlyTracking.create({
              event_uuid: eventUuid,
              invitee_email: emailKey,
              invitee_name: inv.name || '',
              event_name: ev.name || 'Consultation Call',
              start_time: ev.start_time,
              formatted_time: formatted,
              status: 'booked',
              admin_notified: false,
            });
            trackingMap[eventUuid] = tracking;

            newBookings.push({
              email: emailKey,
              name: inv.name || '',
              event_name: ev.name || 'Consultation Call',
              formatted_time: formatted,
              start_time: ev.start_time,
            });
          }
        }
      } catch (invErr) {
        console.warn(`Failed to fetch invitees for event ${eventUuid}:`, invErr.message);
      }
    }

    // Process canceled events — detect new cancellations
    for (const ev of canceledEvents) {
      const eventUuid = ev.uuid || ev.uri?.split('/').pop();
      if (!eventUuid) continue;

      try {
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

        for (const inv of invitees) {
          if (!inv.email) continue;
          const emailKey = inv.email.toLowerCase();

          const existing = trackingMap[eventUuid];
          if (existing && existing.status === 'booked') {
            // Was booked, now cancelled
            await base44.asServiceRole.entities.CalendlyTracking.update(existing.id, {
              status: 'cancelled',
              admin_notified: false,
            });

            newCancellations.push({
              email: emailKey,
              name: inv.name || existing.invitee_name || '',
              event_name: ev.name || existing.event_name || 'Consultation Call',
              formatted_time: formatted,
            });
          }
        }
      } catch (invErr) {
        console.warn(`Failed to fetch invitees for canceled event ${eventUuid}:`, invErr.message);
      }
    }

    // Update CRM leads for new bookings
    let leadsUpdated = 0;
    for (const booking of newBookings) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ email: booking.email });
        if (leads.length > 0) {
          await base44.asServiceRole.entities.Lead.update(leads[0].id, {
            meeting_scheduled: true,
            meeting_date: booking.start_time,
            meeting_name: booking.event_name,
          });
          leadsUpdated++;
        }
      } catch (e) {
        console.warn(`Failed to update lead for ${booking.email}:`, e.message);
      }
    }

    // Update CRM leads for cancellations (clear meeting_scheduled if no more upcoming meetings)
    for (const cancellation of newCancellations) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ email: cancellation.email });
        if (leads.length > 0) {
          // Check if there are other upcoming meetings for this email
          const remainingMeetings = allMeetingsByEmail[cancellation.email] || [];
          if (remainingMeetings.length === 0) {
            await base44.asServiceRole.entities.Lead.update(leads[0].id, {
              meeting_scheduled: false,
              meeting_date: null,
              meeting_name: null,
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to update lead for cancellation ${cancellation.email}:`, e.message);
      }
    }

    // Send admin emails for new bookings
    let emailsSent = 0;
    if (adminEmails.length > 0) {
      for (const booking of newBookings) {
        try {
          const body = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:24px 32px;border-bottom:1px solid #2A2A2A;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:24px;font-weight:900;color:#00fff7;letter-spacing:3px;text-transform:uppercase;">New Meeting Booked</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Calendly Booking</p>
            <h1 style="color:#F5F5F5;font-size:24px;font-weight:700;margin:0 0 20px;">${booking.name || 'A new client'} scheduled a call</h1>
            <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="color:#00fff7;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Client Name</p>
              <p style="color:#F5F5F5;font-size:18px;font-weight:600;margin:0 0 12px;">${booking.name || '—'}</p>
              <p style="color:#00fff7;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Email</p>
              <p style="color:#C8C8C8;font-size:14px;margin:0 0 12px;">${booking.email}</p>
              <p style="color:#00fff7;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Meeting Type</p>
              <p style="color:#C8C8C8;font-size:14px;margin:0 0 12px;">${booking.event_name}</p>
              <p style="color:#00fff7;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Scheduled For</p>
              <p style="color:#F5F5F5;font-size:16px;font-weight:600;margin:0;">${booking.formatted_time}</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

          await base44.asServiceRole.functions.invoke('sendGmail', {
            to: adminEmails.join(','),
            subject: `📅 New Meeting Booked — ${booking.name || booking.email}`,
            html: body,
            from_name: 'The Movement'
          });
          emailsSent++;
        } catch (e) {
          console.error(`Failed to send booking email for ${booking.email}:`, e.message);
        }
      }

      // Send admin emails for cancellations
      for (const cancellation of newCancellations) {
        try {
          const body = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:24px 32px;border-bottom:1px solid #2A2A2A;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:24px;font-weight:900;color:#ef4444;letter-spacing:3px;text-transform:uppercase;">Meeting Cancelled</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Calendly Cancellation</p>
            <h1 style="color:#F5F5F5;font-size:24px;font-weight:700;margin:0 0 20px;">${cancellation.name || 'A client'} cancelled their call</h1>
            <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="color:#ef4444;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Client Name</p>
              <p style="color:#F5F5F5;font-size:18px;font-weight:600;margin:0 0 12px;">${cancellation.name || '—'}</p>
              <p style="color:#ef4444;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Email</p>
              <p style="color:#C8C8C8;font-size:14px;margin:0 0 12px;">${cancellation.email}</p>
              <p style="color:#ef4444;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Was Scheduled For</p>
              <p style="color:#F5F5F5;font-size:16px;font-weight:600;margin:0;">${cancellation.formatted_time}</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

          await base44.asServiceRole.functions.invoke('sendGmail', {
            to: adminEmails.join(','),
            subject: `❌ Meeting Cancelled — ${cancellation.name || cancellation.email}`,
            html: body,
            from_name: 'The Movement'
          });
          emailsSent++;
        } catch (e) {
          console.error(`Failed to send cancellation email for ${cancellation.email}:`, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      active_events: activeEvents.length,
      canceled_events: canceledEvents.length,
      new_bookings: newBookings.length,
      new_cancellations: newCancellations.length,
      leads_updated: leadsUpdated,
      admin_emails_sent: emailsSent,
    });
  } catch (error) {
    console.error('syncCalendlyMeetings error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});