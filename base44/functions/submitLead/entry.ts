import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, phone, email, source, quiz_recommendation } = await req.json();

    if (!full_name || !phone) {
      return Response.json({ error: 'Full name and phone are required' }, { status: 400 });
    }

    const isInnerCircle = source === 'inner_circle';

    // Save lead — this is the critical part, always must succeed
    const lead = await base44.asServiceRole.entities.Lead.create({
      full_name,
      phone,
      email: email || '',
      source: source || 'quiz',
      quiz_recommendation: quiz_recommendation || '',
      status: 'new'
    });

    console.log('Lead saved:', lead.id, '| source:', source);

    // Get notification emails
    let recipientEmails = [];
    try {
      const settings = await base44.asServiceRole.entities.LeadSettings.list();
      recipientEmails = settings?.[0]?.recipient_emails || [];
    } catch (e) {
      console.warn('Could not fetch LeadSettings:', e.message);
    }

    // Send confirmation email to user (non-blocking)
    if (email) {
      const userEmailBody = isInnerCircle ? `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Movement</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">Inner Circle</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:2px;text-transform:uppercase;">The Movement</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#F5F5F5;line-height:1.2;">Thank you, ${full_name}.</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#888;line-height:1.7;">
              We've received your request. One of our movement experts will reach out to you shortly to schedule a call.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #222;border-radius:12px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:11px;color:#00fff7;text-transform:uppercase;letter-spacing:2px;">What's next</p>
                  <p style="margin:0;font-size:15px;color:#F5F5F5;font-weight:600;">Look out for our call — we'll be in touch soon.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#444;">© 2026 The Movement by Roye Gold</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>` : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Movement</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">Confirmation</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:2px;text-transform:uppercase;">The Movement</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#F5F5F5;line-height:1.2;">Thank you, ${full_name}!</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.7;">
              We've received your details and will get back to you shortly.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #222;border-radius:12px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:11px;color:#00fff7;text-transform:uppercase;letter-spacing:2px;">Your Recommendation</p>
                  <p style="margin:0;font-size:17px;font-weight:700;color:#F5F5F5;line-height:1.3;">${quiz_recommendation || 'Start with the Foundation Track'}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#444;">© 2026 The Movement by Roye Gold</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        await await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: isInnerCircle ? 'Your Inner Circle Request — Kinetiqo' : 'Thank you for joining — Kinetiqo',
          from_name: 'The Movement - Roye Gold',
          body: userEmailBody
        });
      } catch (emailErr) {
        console.warn('User confirmation email failed (non-critical):', emailErr.message);
      }
    }

    // Notify admins (non-blocking)
    for (const adminEmail of recipientEmails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: isInnerCircle ? `Inner Circle inquiry — ${full_name}` : `New Lead — ${full_name}`,
          from_name: 'The Movement - Roye Gold',
          body: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:24px 40px;border-bottom:1px solid #2A2A2A;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:24px;font-weight:900;color:#00fff7;letter-spacing:4px;text-transform:uppercase;">KINETIQO</span>
            &nbsp;&nbsp;<span style="background:#00fff7;color:#0F0F0F;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;">${isInnerCircle ? 'Inner Circle' : 'New Lead'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 24px;">Lead Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">FULL NAME</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:600;">${full_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">PHONE</span>
                  <span style="color:#00fff7;font-size:16px;font-weight:600;">${phone}</span>
                </td>
              </tr>
              ${email ? `<tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">EMAIL</span>
                  <span style="color:#F5F5F5;font-size:16px;">${email}</span>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">SOURCE</span>
                  <span style="color:#F5F5F5;font-size:15px;">${source || 'quiz'}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2A2A2A;">
            <p style="color:#555;font-size:12px;margin:0;">Kinetiqo Admin · ${new Date().toLocaleString('en-US')}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        });
      } catch (adminEmailErr) {
        console.warn('Admin notification email failed (non-critical):', adminEmailErr.message);
      }
    }

    return Response.json({ success: true, lead_id: lead.id });
  } catch (error) {
    console.error('submitLead error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});