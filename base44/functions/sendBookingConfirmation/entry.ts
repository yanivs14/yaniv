import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, email, slot_date, slot_time, duration } = await req.json();

    if (!email || !full_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    const safeName = escapeHtml(full_name);
    const safeDate = escapeHtml(slot_date);
    const safeTime = escapeHtml(slot_time);

    const durationText = duration ? ` · ${duration}m` : '';

    const body = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:32px 40px;border-bottom:1px solid #2A2A2A;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:28px;font-weight:900;color:#00fff7;letter-spacing:4px;text-transform:uppercase;">KINETIQO</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">Inner Circle</p>
            <h1 style="color:#F5F5F5;font-size:28px;font-weight:700;margin:0 0 16px;line-height:1.2;">You're all set, ${safeName}!</h1>
            <p style="color:#888;font-size:15px;line-height:1.8;margin:0 0 24px;">
              Your call has been scheduled. One of our movement experts will be in touch to confirm all details.
            </p>
            <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:24px;">
              <p style="color:#00fff7;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Scheduled Call</p>
              <p style="color:#F5F5F5;font-size:20px;font-weight:700;margin:0 0 4px;">${safeDate}</p>
              <p style="color:#C8C8C8;font-size:16px;margin:0;">${safeTime}${durationText}</p>
            </div>
            <p style="color:#888;font-size:13px;line-height:1.7;margin:0;">
              If you need to reschedule or have any questions, simply reply to this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2A2A2A;">
            <p style="color:#555;font-size:12px;margin:0;">© 2026 Kinetiqo by Roye Gold · Movement, restored.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Your Inner Circle Call is Confirmed — ${slot_date}`,
      from_name: 'Kinetiqo',
      body
    });

    console.log(`Booking confirmation sent to ${email} for ${slot_date} ${slot_time}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('sendBookingConfirmation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});