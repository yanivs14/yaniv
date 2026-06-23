import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DEFAULT_PRICING_FEATURES = [
  "Personalized adaptive daily practice",
  "Full Movement training library (240+ sessions)",
  "Strength, mobility, control & longevity tracks",
  "Community access + challenges",
];

function buildPromotionEmail(firstName, promoContent, pricingFeatures, promoUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>The Movement — Roye Gold</title>
  <style>
    body { margin:0; padding:0; }
    table { border-collapse:collapse; }
    img { border:0; display:block; max-width:100%; height:auto; }
    a { text-decoration:none; }
    @media only screen and (max-width: 480px) {
      .email-card { border-radius:14px !important; border:1px solid #1a1a1a !important; }
      .hero-pad { padding:32px 22px 10px !important; }
      .video-pad { padding:18px 22px 22px !important; }
      .promo-pad { padding:0 22px 24px !important; }
      .cta-pad { padding:0 22px 32px !important; }
      .pricing-pad { padding:26px 20px !important; }
      .pricing-section { padding:0 22px 32px !important; }
      .footer-pad { padding:18px 22px !important; }
      .hero-h1 { font-size:26px !important; line-height:1.15 !important; margin-bottom:12px !important; }
      .hero-sub { font-size:15px !important; line-height:1.6 !important; margin-bottom:12px !important; }
      .hero-desc { font-size:13px !important; line-height:1.6 !important; }
      .promo-text { font-size:17px !important; line-height:1.35 !important; }
      .pricing-title { font-size:21px !important; margin-bottom:16px !important; }
      .pricing-price { font-size:42px !important; }
      .cta-btn { padding:15px 40px !important; font-size:15px !important; }
      .pricing-cta { padding:13px 34px !important; font-size:13px !important; }
      .header-pad { padding:24px 22px !important; }
      .outer-pad { padding:16px 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table class="outer-pad" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr><td align="center">
      <table class="email-card" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:18px;border:1px solid #1a1a1a;overflow:hidden;">
        <tr>
          <td class="header-pad" style="padding:28px 32px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:3px;font-weight:600;">The Movement</p>
            <p style="margin:5px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:1.5px;text-transform:uppercase;">Roye Gold</p>
          </td>
        </tr>
        <tr>
          <td class="hero-pad" style="padding:40px 32px 10px;">
            <p style="margin:0 0 18px;font-size:15px;color:#00fff7;line-height:1.5;font-weight:600;">${firstName} — Roye Gold has unlocked a one-time offer for you: over 25% off your membership.</p>
            <h1 class="hero-h1" style="margin:0 0 16px;font-size:31px;font-weight:900;color:#F5F5F5;line-height:1.12;text-transform:uppercase;letter-spacing:-0.5px;">${promoContent.headline || 'Fix Your Pull Up In 7 Days'}</h1>
            <p class="hero-sub" style="margin:0 0 14px;font-size:16px;color:#C8C8C8;line-height:1.6;">${promoContent.subtitle || 'Not with more reps. Not with bands. With the one movement pattern your body has been missing.'}</p>
            <p class="hero-desc" style="margin:0;font-size:13px;color:#888;line-height:1.6;">${promoContent.description || 'Arch Scap — the foundation of every pull, every hang, every strong back. Taught by Roye Gold. 10 min/day.'}</p>
          </td>
        </tr>
        ${promoContent.videoPosterUrl ? `
        <tr>
          <td class="video-pad" style="padding:26px 32px 30px;">
            <a href="${promoUrl}" target="_blank" style="display:block;text-decoration:none;">
              <img src="${promoContent.videoPosterUrl}" alt="Watch the demo" style="display:block;width:100%;max-width:496px;border-radius:14px;border:1px solid #1e3333;" />
            </a>
          </td>
        </tr>` : ''}
        <tr>
          <td class="promo-pad" style="padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1515;border:1px solid rgba(0,255,247,0.15);border-radius:16px;">
              <tr>
                <td style="padding:24px 22px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">⏱ Limited Time Offer</p>
                  <p class="promo-text" style="margin:0;font-size:19px;font-weight:700;color:#F5F5F5;line-height:1.35;">${promoContent.promoText || '$25/mo for the first 3 months if you sign up in the next 24 hours!'}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="cta-pad" style="padding:0 32px 34px;" align="center">
            <a href="${promoUrl}" target="_blank" class="cta-btn" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">${promoContent.ctaText || 'START NOW'}</a>
          </td>
        </tr>
        <tr>
          <td class="pricing-section" style="padding:0 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1a1a;border:1px solid #1e3333;border-radius:16px;">
              <tr>
                <td class="pricing-pad" style="padding:30px 24px;">
                  <p style="margin:0 0 4px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2px;text-align:center;font-weight:600;">${promoContent.pricingEyebrow || 'Membership'}</p>
                  <p class="pricing-title" style="margin:0 0 18px;font-size:23px;font-weight:900;color:#F5F5F5;text-align:center;text-transform:uppercase;letter-spacing:-0.3px;">${promoContent.pricingTitle || 'Join The Movement'}</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                    <tr><td align="center">
                      <span style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:9px;font-weight:700;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;">${promoContent.pricingBadge || 'Limited Time Offer'}</span>
                    </td></tr>
                  </table>
                  <p style="margin:0;text-align:center;font-size:13px;color:#888;">${promoContent.pricingPlanName || 'Monthly'}</p>
                  <p style="margin:4px 0 4px;text-align:center;">
                    <span class="pricing-price" style="font-size:46px;font-weight:900;color:#F5F5F5;">${promoContent.pricingPrice || '$25'}</span>
                    <span style="font-size:14px;color:#888;">${promoContent.pricingPeriod || '/ month'}</span>
                  </p>
                  <p style="margin:0 0 18px;text-align:center;font-size:11px;color:#555;">${promoContent.pricingPriceNote || 'First 3 months only - then $35/mo'}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${pricingFeatures.map(f => `<tr><td style="padding:8px 0;border-bottom:1px solid #1a2a2a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">${f}</span></td></tr>`).join('')}
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                    <tr><td align="center">
                      <a href="${promoUrl}" target="_blank" class="pricing-cta" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;">${promoContent.pricingCta || 'Begin Monthly'}</a>
                    </td></tr>
                  </table>
                  <p style="margin:12px 0 0;text-align:center;font-size:10px;color:#555;">${promoContent.pricingFooter || 'Cancel anytime - No equipment needed'}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer-pad" style="padding:20px 32px;border-top:1px solid #1a1a1a;">
            <p style="margin:0;font-size:11px;color:#444;text-align:center;">© 2026 The Movement by Roye Gold</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const { recipients, templateType, subject, body, campaignName } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: 'No recipients provided' }, { status: 400 });
    }

    // Fetch promotion content if needed
    let promoContent = {};
    let pricingFeatures = [...DEFAULT_PRICING_FEATURES];
    let promoUrl = 'https://themovement.royegold.com/promotion';
    if (templateType === 'promotion') {
      try {
        const origin = req.headers.get('origin');
        if (origin) promoUrl = `${origin}/promotion`;
        const promoRecords = await base44.asServiceRole.entities.PromotionPageContent.filter({ page_key: 'promotion' });
        if (promoRecords.length > 0) {
          const raw = promoRecords[0].data;
          promoContent = raw?.data && raw?.page_key ? raw.data : raw;
          if (promoContent.pricingFeatures?.length) pricingFeatures = promoContent.pricingFeatures;
        }
      } catch (e) {
        console.warn('Could not fetch promotion content:', e.message);
      }
    }

    const results = { sent: 0, failed: 0, total: recipients.length, details: [] };

    for (const r of recipients) {
      if (!r.email) { results.failed++; continue; }
      const firstName = (r.name || '').trim().split(' ')[0] || 'there';
      let emailSubject, emailBody;

      if (templateType === 'promotion') {
        emailSubject = 'Start Train With Roye Gold - Now With Over 25% OFF';
        emailBody = buildPromotionEmail(firstName, promoContent, pricingFeatures, promoUrl);
      } else {
        emailSubject = subject || 'The Movement — Roye Gold';
        emailBody = (body || '').replace(/\{\{name\}\}/gi, firstName);
      }

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject: emailSubject,
          from_name: 'The Movement - Roye Gold',
          body: emailBody,
        });

        try {
          await base44.asServiceRole.entities.EmailLog.create({
            recipient_email: r.email,
            recipient_name: r.name || '',
            subject: emailSubject,
            template_name: templateType,
            campaign_name: campaignName || '',
            status: 'sent',
            source: r.source || '',
            country: r.country || '',
            language: r.language || '',
            error_message: '',
          });
        } catch (logErr) {
          console.warn('Failed to create EmailLog (sent):', logErr.message);
        }
        results.sent++;
      } catch (err) {
        try {
          await base44.asServiceRole.entities.EmailLog.create({
            recipient_email: r.email,
            recipient_name: r.name || '',
            subject: emailSubject,
            template_name: templateType,
            campaign_name: campaignName || '',
            status: 'failed',
            source: r.source || '',
            country: r.country || '',
            language: r.language || '',
            error_message: (err.message || 'Unknown error').slice(0, 500),
          });
        } catch (logErr) {
          console.warn('Failed to create EmailLog (failed):', logErr.message);
        }
        results.failed++;
        results.details.push({ email: r.email, error: err.message });
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error('sendBulkEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});