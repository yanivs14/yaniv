import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, phone, email, source, quiz_recommendation } = await req.json();

    if (!full_name || !phone) {
      return Response.json({ error: 'Full name and phone are required' }, { status: 400 });
    }

    // Save lead
    const lead = await base44.asServiceRole.entities.Lead.create({
      full_name, phone, email: email || '', source: source || 'quiz', quiz_recommendation: quiz_recommendation || ''
    });

    // Get notification emails
    const settings = await base44.asServiceRole.entities.LeadSettings.list();
    const recipientEmails = settings?.[0]?.recipient_emails || [];

    // Send confirmation to user
    if (email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'תודה שהצטרפת — Kinetiqo',
        from_name: 'Kinetiqo',
        body: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#0F0F0F;padding:32px 40px;border-bottom:1px solid #2A2A2A;text-align:right;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:28px;font-weight:900;color:#00fff7;letter-spacing:4px;text-transform:uppercase;">KINETIQO</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;text-align:right;">
            <p style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">הודעת אישור</p>
            <h1 style="color:#F5F5F5;font-size:32px;font-weight:700;margin:0 0 16px;line-height:1.2;">תודה, ${full_name} 🙌</h1>
            <p style="color:#888;font-size:15px;line-height:1.8;margin:0 0 32px;">קיבלנו את הפרטים שלך ונחזור אליך בהקדם.<br/>בינתיים — הגוף שלך ממתין לך.</p>
            <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:32px;">
              <p style="color:#00fff7;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">ההמלצה שלך</p>
              <p style="color:#F5F5F5;font-size:18px;font-weight:700;margin:0;">${quiz_recommendation || 'Foundation Track'}</p>
            </div>
            <a href="#" style="display:inline-block;background:#00fff7;color:#0F0F0F;font-weight:700;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none;letter-spacing:1px;">התחל לזוז →</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2A2A2A;text-align:right;">
            <p style="color:#555;font-size:12px;margin:0;">© 2026 Kinetiqo by Roye Gold · Movement, restored.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      });
    }

    // Notify admins
    for (const adminEmail of recipientEmails) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `ליד חדש — ${full_name}`,
        from_name: 'Kinetiqo Leads',
        body: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:24px 40px;border-bottom:1px solid #2A2A2A;text-align:right;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:24px;font-weight:900;color:#00fff7;letter-spacing:4px;text-transform:uppercase;">KINETIQO</span>
              <span style="margin-right:12px;background:#00fff7;color:#0F0F0F;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;">ליד חדש</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:right;">
            <p style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 24px;">פרטי הליד</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">שם מלא</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:600;">${full_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">טלפון</span>
                  <span style="color:#00fff7;font-size:16px;font-weight:600;">${phone}</span>
                </td>
              </tr>
              ${email ? `<tr>
                <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">אימייל</span>
                  <span style="color:#F5F5F5;font-size:16px;">${email}</span>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0;">
                  <span style="color:#555;font-size:12px;display:block;margin-bottom:4px;">המלצה מהשאלון</span>
                  <span style="color:#F5F5F5;font-size:15px;">${quiz_recommendation || '—'}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2A2A2A;text-align:right;">
            <p style="color:#555;font-size:12px;margin:0;">Kinetiqo Admin · ${new Date().toLocaleString('he-IL')}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      });
    }

    return Response.json({ success: true, lead_id: lead.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});