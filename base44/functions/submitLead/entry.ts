import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, phone, email, source, quiz_section, quiz_recommendation, quiz_answers, browser_language, country } = await req.json();

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
      quiz_section: quiz_section || '',
      quiz_recommendation: quiz_recommendation || '',
      quiz_answers: quiz_answers || {},
      browser_language: browser_language || '',
      country: country || '',
      status: 'new'
    });

    console.log('Lead saved:', lead.id, '| source:', source);

    // Fetch promotion page content for the user email
    let promoContent = {};
    let pricingFeatures = [
      "Personalized adaptive daily practice",
      "Full Movement training library (240+ sessions)",
      "Strength, mobility, control & longevity tracks",
      "Community access + challenges",
    ];
    const promoUrl = "https://themovement.royegold.com/promotion";
    try {
      const promoRecords = await base44.asServiceRole.entities.PromotionPageContent.filter({ page_key: "promotion" });
      if (promoRecords.length > 0) {
        const raw = promoRecords[0].data;
        promoContent = raw?.data && raw?.page_key ? raw.data : raw;
        if (promoContent.pricingFeatures?.length) pricingFeatures = promoContent.pricingFeatures;
      }
    } catch (e) {
      console.warn('Could not fetch promotion content:', e.message);
    }

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
      .quiz-pad { padding:0 22px 24px !important; }
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

        <!-- Header -->
        <tr>
          <td class="header-pad" style="padding:28px 32px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:3px;font-weight:600;">The Movement</p>
            <p style="margin:5px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:1.5px;text-transform:uppercase;">Roye Gold</p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td class="hero-pad" style="padding:40px 32px 10px;">
            <p style="margin:0 0 18px;font-size:15px;color:#00fff7;line-height:1.5;font-weight:600;">${full_name.split(' ')[0]} — Roye Gold has unlocked a one-time offer for you: over 25% off your membership.</p>
            <h1 class="hero-h1" style="margin:0 0 16px;font-size:31px;font-weight:900;color:#F5F5F5;line-height:1.12;text-transform:uppercase;letter-spacing:-0.5px;">${promoContent.headline || 'Fix Your Pull Up In 7 Days'}</h1>
            <p class="hero-sub" style="margin:0 0 14px;font-size:16px;color:#C8C8C8;line-height:1.6;">${promoContent.subtitle || 'Not with more reps. Not with bands. With the one movement pattern your body has been missing.'}</p>
            <p class="hero-desc" style="margin:0;font-size:13px;color:#888;line-height:1.6;">${promoContent.description || 'Arch Scap — the foundation of every pull, every hang, every strong back. Taught by Roye Gold. 10 min/day.'}</p>
          </td>
        </tr>

        <!-- Video Poster -->
        ${promoContent.videoPosterUrl ? `
        <tr>
          <td class="video-pad" style="padding:26px 32px 30px;">
            <a href="${promoUrl}" target="_blank" style="display:block;text-decoration:none;">
              <img src="${promoContent.videoPosterUrl}" alt="Watch the demo" style="display:block;width:100%;max-width:496px;border-radius:14px;border:1px solid #1e3333;" />
            </a>
          </td>
        </tr>` : ''}

        <!-- Promo Banner -->
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

        <!-- CTA Button -->
        <tr>
          <td class="cta-pad" style="padding:0 32px 34px;" align="center">
            <a href="${promoUrl}" target="_blank" class="cta-btn" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">${promoContent.ctaText || 'START NOW'}</a>
          </td>
        </tr>

        <!-- Pricing -->
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

        <!-- Quiz Recommendation -->
        ${quiz_recommendation ? `
        <tr>
          <td class="quiz-pad" style="padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;">
              <tr>
                <td style="padding:18px 22px;">
                  <p style="margin:0 0 5px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Quiz Recommendation</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#F5F5F5;">${quiz_recommendation}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Footer -->
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

      try {
        await await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: isInnerCircle ? 'Your Inner Circle Request — Kinetiqo' : 'Start Train With Roye Gold - Now With Over 25% OFF',
          from_name: 'The Movement - Roye Gold',
          body: userEmailBody
        });
      } catch (emailErr) {
        console.warn('User confirmation email failed (non-critical):', emailErr.message);
      }
    }

    // Build quiz answers rows
    const quizLabels = {
      pain: "Where do you feel the most tension?",
      lifestyle: "How much of your day do you spend sitting?",
      goal: "What's your primary movement goal?",
      experience: "What's your current movement experience?"
    };
    const quizRows = quiz_answers && Object.keys(quiz_answers).length > 0
      ? Object.entries(quiz_answers).map(([k, v]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
            <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">${quizLabels[k] || k}</span>
            <span style="color:#00fff7;font-size:14px;font-weight:600;">${v}</span>
          </td>
        </tr>`).join('')
      : '';

    // Notify admins (non-blocking)
    for (const adminEmail of recipientEmails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: isInnerCircle ? `🔵 Inner Circle — ${full_name}` : `🟢 New Lead — ${full_name}`,
          from_name: 'The Movement - Roye Gold',
          body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #222;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">${isInnerCircle ? 'Inner Circle Inquiry' : 'New Lead'}</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:${isInnerCircle ? '#00fff7' : '#22c55e'};color:#0a0a0a;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;white-space:nowrap;">${isInnerCircle ? 'Inner Circle' : 'Quiz Lead'}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contact Info -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Contact Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">FULL NAME</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:700;">${full_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PHONE</span>
                  <span style="color:#00fff7;font-size:16px;font-weight:600;">${phone}</span>
                </td>
              </tr>
              ${email ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">EMAIL</span>
                  <span style="color:#F5F5F5;font-size:15px;">${email}</span>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">SOURCE</span>
                  <span style="color:#F5F5F5;font-size:14px;">${source || 'quiz'}${quiz_section ? ' · ' + quiz_section : ''}</span>
                </td>
              </tr>
              ${country || browser_language ? `<tr>
                <td style="padding:10px 0;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">LOCATION / LANGUAGE</span>
                  <span style="color:#F5F5F5;font-size:14px;">${country || '—'}${browser_language ? ' · ' + browser_language : ''}</span>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Recommendation -->
        ${quiz_recommendation ? `<tr>
          <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
            <p style="margin:0 0 6px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Recommendation</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#00fff7;">${quiz_recommendation}</p>
          </td>
        </tr>` : ''}

        <!-- Quiz Answers -->
        ${quizRows ? `<tr>
          <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Answers</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${quizRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;">
            <p style="margin:0;font-size:11px;color:#444;">${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jerusalem', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })} · The Movement Admin</p>
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

    // Sync to ManyChat (all sources with phone or email — non-blocking)
    if (phone || email) {
      try {
        const manychatKey = Deno.env.get("MANYCHAT_API_KEY");
        if (manychatKey) {
          const nameParts = (full_name || "").trim().split(" ");
          const mcPayload = {
            first_name: nameParts[0] || full_name,
            last_name: nameParts.slice(1).join(" ") || "",
            has_opt_in_sms: true,
            has_opt_in_email: !!email,
            custom_fields: [
              { field_name: "source", value: source || "quiz" },
            ],
          };
          if (phone) mcPayload.phone = phone;
          if (email) mcPayload.email = email;

          const mcRes = await fetch("https://api.manychat.com/fb/subscriber/createSubscriber", {
            method: "POST",
            headers: { "Authorization": `Bearer ${manychatKey}`, "Content-Type": "application/json" },
            body: JSON.stringify(mcPayload),
          });
          const mcData = await mcRes.json();
          if (!mcRes.ok) {
            console.warn("ManyChat sync failed:", JSON.stringify(mcData));
          } else {
            console.log("ManyChat subscriber synced:", mcData?.data?.id);
          }
        }
      } catch (mcErr) {
        console.warn("ManyChat sync error (non-critical):", mcErr.message);
      }
    }

    // Sync to Kit.com (all sources with email — non-blocking)
    if (email) {
      try {
        const kitKey = Deno.env.get("KIT_API_KEY");
        if (kitKey) {
          const nameParts = (full_name || "").trim().split(" ");
          const kitPayload = {
            api_key: kitKey,
            email,
            first_name: nameParts[0] || full_name,
            fields: {
              last_name: nameParts.slice(1).join(" ") || "",
              phone: phone || "",
              source: source || "quiz",
            },
          };

          const kitRes = await fetch("https://api.convertkit.com/v3/subscribers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kitPayload),
          });
          const kitData = await kitRes.json();
          if (!kitRes.ok) {
            console.warn("Kit sync failed:", JSON.stringify(kitData));
          } else {
            console.log("Kit subscriber synced:", kitData?.subscriber?.id);
          }
        }
      } catch (kitErr) {
        console.warn("Kit sync error (non-critical):", kitErr.message);
      }
    }

    return Response.json({ success: true, lead_id: lead.id });
  } catch (error) {
    console.error('submitLead error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});