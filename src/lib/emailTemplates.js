// Static preview HTML for all transactional & notification emails the system sends.
// Each template uses sample data so the admin can preview the visual design.

const SELLER_INFO = `
  <tr>
    <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
      <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Seller Information</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
        <strong style="color:#F5F5F5;">The Movement — Roye Gold</strong><br/>
        Digital fitness &amp; movement training services<br/>
        Contact: move@royegold.com
      </p>
    </td>
  </tr>`;

const FOOTER = (dateStr) => `
  <tr>
    <td style="padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#444;line-height:1.6;">
        This receipt was issued automatically upon successful payment.<br/>
        Please retain this receipt for your records.<br/><br/>
        ${dateStr} · The Movement
      </p>
    </td>
  </tr>`;

export const EMAIL_TEMPLATES = [
  {
    id: "receipt",
    name: "Payment Receipt",
    description: "Sent to customers automatically after a successful Stripe checkout",
    trigger: "checkout.session.completed",
    subject: "Your Receipt — Handstand Course — $97.00 one-time",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:32px 24px 24px;text-align:center;border-bottom:1px solid #222;">
          <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement — Roye Gold</p>
          <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">Payment Receipt</p>
          <p style="margin:10px 0 0;font-size:13px;color:#888;">Thank you for your purchase, John Doe!</p>
        </td></tr>
        <tr><td style="padding:24px 24px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Transaction Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">DATE</span><span style="color:#F5F5F5;font-size:15px;font-weight:600;">05/07/2026, 14:30</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">PRODUCT / SERVICE</span><span style="color:#00fff7;font-size:15px;font-weight:700;">Handstand Course — $97.00 one-time</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">AMOUNT PAID</span><span style="color:#F5F5F5;font-size:20px;font-weight:800;">$97.00 USD</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">PAYMENT METHOD</span><span style="color:#F5F5F5;font-size:14px;">Visa •••• 4242</span></td></tr>
            <tr><td style="padding:9px 0;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">TRANSACTION ID</span><span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">cs_test_a1b2c3d4e5f6g7h8i9j0</span></td></tr>
          </table>
        </td></tr>
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
            <a href="#" target="_blank" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">📄 Download Invoice PDF</a>
            <p style="margin:10px 0 0;font-size:11px;color:#555;">Click the button above to download your official invoice</p>
          </td>
        </tr>
        ${SELLER_INFO}
        ${FOOTER("05/07/2026, 14:30")}
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "refund",
    name: "Refund Confirmation",
    description: "Sent to customers when a Stripe refund is processed",
    trigger: "charge.refunded",
    subject: "Refund Confirmation — $35.00 USD",
    color: "text-amber-600",
    bg: "bg-amber-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:32px 24px 24px;text-align:center;border-bottom:1px solid #222;">
          <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement — Roye Gold</p>
          <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">Refund Confirmation</p>
          <p style="margin:10px 0 0;font-size:13px;color:#888;">Hi John Doe, your refund has been processed</p>
        </td></tr>
        <tr><td style="padding:24px 24px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Refund Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REFUND DATE</span><span style="color:#F5F5F5;font-size:15px;font-weight:600;">05/07/2026, 16:45</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">AMOUNT REFUNDED</span><span style="color:#00fff7;font-size:20px;font-weight:800;">$35.00 USD</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">ORIGINAL TRANSACTION</span><span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">pi_test_1a2b3c4d5e</span></td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REFUND ID</span><span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">re_test_9z8y7x6w5v</span></td></tr>
            <tr><td style="padding:9px 0;"><span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REASON</span><span style="color:#F5F5F5;font-size:14px;">requested_by_customer</span></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
          <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
            Your refund of <strong style="color:#00fff7;">$35.00 USD</strong> has been processed and will appear on your original payment method within <strong style="color:#F5F5F5;">5-10 business days</strong>. The exact timeline depends on your bank or card issuer.
          </p>
        </td></tr>
        <tr><td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
          <a href="#" target="_blank" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">📄 Download Invoice PDF</a>
          <p style="margin:10px 0 0;font-size:11px;color:#555;">Click the button above to download your updated invoice</p>
        </td></tr>
        <tr><td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Seller Information</p>
          <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
            <strong style="color:#F5F5F5;">The Movement — Roye Gold</strong><br/>
            Digital fitness &amp; movement training services<br/>
            Contact: move@royegold.com
          </p>
        </td></tr>
        <tr><td style="padding:20px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;line-height:1.6;">
            This refund confirmation was issued automatically.<br/>
            Please retain this for your records.<br/><br/>
            05/07/2026, 16:45 · The Movement
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "welcome_skool",
    name: "Welcome + Join Skool",
    description: "Sent to customers after purchase with a button to join the Skool community",
    trigger: "checkout.session.completed",
    subject: "Welcome to The Movement, John! Join the Community →",
    color: "text-purple-600",
    bg: "bg-purple-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;}table{border-collapse:collapse;}@media only screen and (max-width:480px){.email-card{border-radius:14px!important;}.hero-pad{padding:32px 22px 12px!important;}.body-pad{padding:0 22px 28px!important;}.cta-pad{padding:0 22px 32px!important;}.hero-h1{font-size:26px!important;line-height:1.15!important;}.cta-btn{padding:15px 40px!important;font-size:15px!important;}}</style></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr><td align="center">
      <table class="email-card" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:18px;border:1px solid #1a1a1a;overflow:hidden;">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:3px;font-weight:600;">The Movement</p>
          <p style="margin:5px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:1.5px;text-transform:uppercase;">Roye Gold</p>
        </td></tr>
        <tr><td class="hero-pad" style="padding:40px 32px 12px;">
          <p style="margin:0 0 18px;font-size:15px;color:#00fff7;line-height:1.5;font-weight:600;">You're officially in, John.</p>
          <h1 class="hero-h1" style="margin:0 0 16px;font-size:31px;font-weight:900;color:#F5F5F5;line-height:1.12;text-transform:uppercase;letter-spacing:-0.5px;">Welcome to The Movement</h1>
          <p style="margin:0 0 14px;font-size:16px;color:#C8C8C8;line-height:1.6;">Thank you for your purchase of <strong style="color:#00fff7;">The Movement Membership</strong>. Your journey to better movement starts now.</p>
          <p style="margin:0;font-size:15px;color:#888;line-height:1.6;">The next step? Join our private Skool community — where you'll get full access to training sessions, daily practice, challenges, and direct support from Roye Gold and the community.</p>
        </td></tr>
        <tr><td style="padding:0 32px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1515;border:1px solid rgba(0,255,247,0.15);border-radius:16px;">
            <tr><td style="padding:24px 22px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">🎓 Your Private Community</p>
              <p style="margin:0;font-size:19px;font-weight:700;color:#F5F5F5;line-height:1.35;">Register on Skool with the same email you used to purchase</p>
              <p style="margin:8px 0 0;font-size:13px;color:#888;line-height:1.5;">john@example.com</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="cta-pad" style="padding:0 32px 34px;" align="center">
          <a href="https://www.skool.com/the-movement-roye-gold" target="_blank" class="cta-btn" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Join the Community →</a>
          <p style="margin:12px 0 0;font-size:11px;color:#555;line-height:1.5;">Use the same email address to be recognized automatically</p>
        </td></tr>
        <tr><td class="body-pad" style="padding:0 32px 28px;">
          <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;font-weight:600;">What's waiting for you inside:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">240+ adaptive training sessions</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Daily practice &amp; challenges</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Strength, mobility, control &amp; longevity tracks</span></td></tr>
            <tr><td style="padding:8px 0;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Direct support from Roye Gold &amp; the community</span></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;color:#444;line-height:1.6;">
            Need help? Just reply to this email — we've got you.<br/>
            Contact: move@royegold.com
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#444;">© 2026 The Movement by Roye Gold</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    description: "Sent to customers after scheduling a Calendly call",
    trigger: "Calendly booking",
    subject: "Your Inner Circle Call is Confirmed — Monday, 15 July 2026",
    color: "text-teal-600",
    bg: "bg-teal-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <tr>
          <td style="background:#0F0F0F;padding:32px 40px;border-bottom:1px solid #2A2A2A;">
            <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:28px;font-weight:900;color:#00fff7;letter-spacing:4px;text-transform:uppercase;">THE MOVEMENT</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">Inner Circle</p>
            <h1 style="color:#F5F5F5;font-size:28px;font-weight:700;margin:0 0 16px;line-height:1.2;">You're all set, John!</h1>
            <p style="color:#888;font-size:15px;line-height:1.8;margin:0 0 24px;">
              Your call has been scheduled. One of our movement experts will be in touch to confirm all details.
            </p>
            <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:24px;">
              <p style="color:#00fff7;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Scheduled Call</p>
              <p style="color:#F5F5F5;font-size:20px;font-weight:700;margin:0 0 4px;">Monday, 15 July 2026</p>
              <p style="color:#C8C8C8;font-size:16px;margin:0;">10:00 · 30m</p>
            </div>
            <p style="color:#888;font-size:13px;line-height:1.7;margin:0;">
              If you need to reschedule or have any questions, simply reply to this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2A2A2A;">
            <p style="color:#555;font-size:12px;margin:0;">© 2026 The Movement by Roye Gold · Movement, restored.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "lead_inner_circle",
    name: "Lead Confirmation — Inner Circle",
    description: "Auto-reply sent to leads who submit the Inner Circle form",
    trigger: "Inner Circle form submit",
    subject: "Your Inner Circle Request — The Movement",
    color: "text-blue-600",
    bg: "bg-blue-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">Inner Circle</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:2px;text-transform:uppercase;">The Movement</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#F5F5F5;line-height:1.2;">Thank you, John Doe.</h1>
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
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #222;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#444;">© 2026 The Movement by Roye Gold</p>
            <a href="#" style="font-size:11px;color:#555;text-decoration:underline;">Unsubscribe from all emails</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "lead_promo",
    name: "Lead Promotion Email",
    description: "Auto-reply sent to quiz leads with a limited-time membership offer",
    trigger: "Quiz form submit",
    subject: "Start Training With Roye Gold - Now With Over 25% OFF",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;}table{border-collapse:collapse;}img{border:0;display:block;max-width:100%;height:auto;}a{text-decoration:none;}@media only screen and (max-width:480px){.email-card{border-radius:14px!important;border:1px solid #1a1a1a!important;}.hero-pad{padding:32px 22px 10px!important;}.promo-pad{padding:0 22px 24px!important;}.cta-pad{padding:0 22px 32px!important;}.pricing-pad{padding:26px 20px!important;}.pricing-section{padding:0 22px 32px!important;}.footer-pad{padding:18px 22px!important;}.hero-h1{font-size:26px!important;line-height:1.15!important;margin-bottom:12px!important;}.promo-text{font-size:17px!important;line-height:1.35!important;}.pricing-title{font-size:21px!important;margin-bottom:16px!important;}.pricing-price{font-size:42px!important;}.cta-btn{padding:15px 40px!important;font-size:15px!important;}}</style></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr><td align="center">
      <table class="email-card" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:18px;border:1px solid #1a1a1a;overflow:hidden;">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:3px;font-weight:600;">The Movement</p>
          <p style="margin:5px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:1.5px;text-transform:uppercase;">Roye Gold</p>
        </td></tr>
        <tr><td class="hero-pad" style="padding:40px 32px 10px;">
          <p style="margin:0 0 18px;font-size:15px;color:#00fff7;line-height:1.5;font-weight:600;">John — Roye Gold has unlocked a one-time offer for you: over 25% off your membership.</p>
          <h1 class="hero-h1" style="margin:0 0 16px;font-size:31px;font-weight:900;color:#F5F5F5;line-height:1.12;text-transform:uppercase;letter-spacing:-0.5px;">Fix Your Pull Up In 7 Days</h1>
          <p style="margin:0 0 14px;font-size:16px;color:#C8C8C8;line-height:1.6;">Not with more reps. Not with bands. With the one movement pattern your body has been missing.</p>
          <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">Arch Scap — the foundation of every pull, every hang, every strong back. Taught by Roye Gold. 10 min/day.</p>
        </td></tr>
        <tr><td class="promo-pad" style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1515;border:1px solid rgba(0,255,247,0.15);border-radius:16px;">
            <tr><td style="padding:24px 22px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">⏱ Limited Time Offer</p>
              <p class="promo-text" style="margin:0;font-size:19px;font-weight:700;color:#F5F5F5;line-height:1.35;">$25/mo for the first 3 months if you sign up in the next 24 hours!</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="cta-pad" style="padding:0 32px 34px;" align="center">
          <a href="#" class="cta-btn" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">START NOW</a>
        </td></tr>
        <tr><td class="pricing-section" style="padding:0 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1a1a;border:1px solid #1e3333;border-radius:16px;">
            <tr><td class="pricing-pad" style="padding:30px 24px;">
              <p style="margin:0 0 4px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2px;text-align:center;font-weight:600;">Membership</p>
              <p class="pricing-title" style="margin:0 0 18px;font-size:23px;font-weight:900;color:#F5F5F5;text-align:center;text-transform:uppercase;letter-spacing:-0.3px;">Join The Movement</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center">
                <span style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:9px;font-weight:700;padding:4px 12px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;">Limited Time Offer</span>
              </td></tr></table>
              <p style="margin:0;text-align:center;font-size:13px;color:#888;">Monthly</p>
              <p style="margin:4px 0 4px;text-align:center;">
                <span class="pricing-price" style="font-size:46px;font-weight:900;color:#F5F5F5;">$25</span>
                <span style="font-size:14px;color:#888;">/ month</span>
              </p>
              <p style="margin:0 0 18px;text-align:center;font-size:11px;color:#555;">First 3 months only - then $35/mo</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #1a2a2a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Personalized adaptive daily practice</span></td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #1a2a2a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Full Movement training library (240+ sessions)</span></td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #1a2a2a;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Strength, mobility, control &amp; longevity tracks</span></td></tr>
                <tr><td style="padding:8px 0;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Community access + challenges</span></td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;"><tr><td align="center">
                <a href="#" class="pricing-cta" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;">Begin Monthly</a>
              </td></tr></table>
              <p style="margin:12px 0 0;text-align:center;font-size:10px;color:#555;">Cancel anytime - No equipment needed</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="footer-pad" style="padding:20px 32px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;color:#444;">© 2026 The Movement by Roye Gold</p>
          <a href="#" style="font-size:11px;color:#555;text-decoration:underline;">Unsubscribe from all emails</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "admin_lead_notification",
    name: "Admin Lead Notification",
    description: "Sent to admins when a new lead submits a form",
    trigger: "On lead submit",
    subject: "🟢 New Lead — John Doe",
    color: "text-slate-700",
    bg: "bg-slate-100",
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #222;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement</p>
                <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">New Lead</p>
              </td>
              <td align="right">
                <span style="display:inline-block;background:#22c55e;color:#0a0a0a;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;white-space:nowrap;">Quiz Lead</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Contact Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">FULL NAME</span><span style="color:#F5F5F5;font-size:16px;font-weight:700;">John Doe</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PHONE</span><span style="color:#00fff7;font-size:16px;font-weight:600;">+1 (555) 123-4567</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">EMAIL</span><span style="color:#F5F5F5;font-size:15px;">john@example.com</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">SOURCE</span><span style="color:#F5F5F5;font-size:14px;">quiz · hero</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">COUNTRY</span><span style="color:#F5F5F5;font-size:14px;">United States</span></td></tr>
            <tr><td style="padding:10px 0;"><span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">BROWSER LANGUAGE</span><span style="color:#F5F5F5;font-size:14px;">en-US</span></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
          <p style="margin:0 0 6px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Recommendation</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#00fff7;">7-Day Movement Prep</p>
        </td></tr>
        <tr><td style="padding:16px 28px;">
          <p style="margin:0;font-size:11px;color:#444;">05/07/2026, 14:30 · The Movement Admin</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
];