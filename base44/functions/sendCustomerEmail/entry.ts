import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  let body = {};
  let subject = '';
  try {
    const base44 = createClientFromRequest(req);

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    body = await req.json();
    const {
      type, email, name, amount, currency, planLabel, transactionId,
      paymentMethod, refundId, originalTransactionId, reason, chargeId,
      invoicePdfUrl, overrideRecipient,
    } = body;

    if (!email || !type) {
      return Response.json({ error: 'Missing required fields: type and email' }, { status: 400 });
    }

    // Check settings
    let receiptEnabled = true;
    let refundEnabled = true;
    let skoolWelcomeEnabled = true;
    try {
      const settings = await base44.asServiceRole.entities.LeadSettings.list();
      receiptEnabled = settings?.[0]?.receipt_emails_enabled !== false;
      refundEnabled = settings?.[0]?.refund_emails_enabled !== false;
      skoolWelcomeEnabled = settings?.[0]?.skool_welcome_email_enabled !== false;
    } catch (e) {
      console.warn("Settings check failed, defaulting to enabled:", e.message);
    }

    if (type === 'receipt' && !receiptEnabled) {
      console.log("Receipt emails disabled, skipping");
      return Response.json({ skipped: 'receipt_emails_disabled' });
    }
    if (type === 'refund' && !refundEnabled) {
      console.log("Refund emails disabled, skipping");
      return Response.json({ skipped: 'refund_emails_disabled' });
    }
    if (type === 'welcome_skool' && !skoolWelcomeEnabled) {
      console.log("Skool welcome email disabled, skipping");
      return Response.json({ skipped: 'skool_welcome_disabled' });
    }

    // For refunds, check for duplicates (prevents double-send when both admin panel and webhook trigger)
    if (type === 'refund' && chargeId) {
      try {
        const existing = await base44.asServiceRole.entities.EmailLog.filter({
          campaign_name: chargeId,
          template_name: 'refund',
          status: 'sent',
        });
        if (existing && existing.length > 0) {
          console.log(`Refund email already sent for charge ${chargeId}, skipping`);
          return Response.json({ skipped: 'duplicate_refund_email' });
        }
      } catch (e) {
        console.warn("Duplicate check failed:", e.message);
      }
    }

    const dateStr = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Jerusalem',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    let html;
    if (type === 'receipt') {
      subject = `Your Receipt — ${planLabel || 'Purchase'}`;
      html = buildReceiptHtml({
        customerName: name || 'Customer',
        planLabel: planLabel || 'Purchase',
        amount: Number(amount) || 0,
        currency: currency || 'USD',
        transactionId: transactionId || '—',
        paymentMethod: paymentMethod || 'Credit/Debit Card',
        dateStr,
        invoicePdfUrl: invoicePdfUrl || '',
      });
    } else if (type === 'refund') {
      subject = `Refund Confirmation — ${Number(amount).toFixed(2)} ${currency || 'USD'}`;
      html = buildRefundHtml({
        customerName: name || 'Customer',
        refundAmount: Number(amount) || 0,
        currency: currency || 'USD',
        dateStr,
        originalTransactionId: originalTransactionId || '—',
        refundId: refundId || '—',
        reason: reason || '',
        invoicePdfUrl: invoicePdfUrl || '',
      });
    } else if (type === 'welcome_skool') {
      subject = `Welcome to The Movement, ${name || 'there'}! Join the Community →`;
      html = buildWelcomeSkoolHtml({
        customerName: name || 'Customer',
        email: email,
        planLabel: planLabel || 'The Movement',
      });
    } else {
      return Response.json({ error: 'Invalid type. Use "receipt", "refund", or "welcome_skool".' }, { status: 400 });
    }

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const sendTo = overrideRecipient || email;
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `The Movement — Roye Gold <${fromEmail}>`,
        to: [sendTo],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      throw new Error(`Resend API error (${resendRes.status}): ${errText}`);
    }

    await base44.asServiceRole.entities.EmailLog.create({
      recipient_email: email,
      recipient_name: name || '',
      subject,
      template_name: type,
      campaign_name: chargeId || transactionId || '',
      status: 'sent',
      source: 'stripe',
    });

    console.log(`${type} email sent to ${email}`);
    return Response.json({ success: true, type, email });
  } catch (error) {
    console.error('sendCustomerEmail error:', error.message);

    // Try to log the failure — use the already-parsed body (req body can't be re-read)
    try {
      if (body.email) {
        await base44.asServiceRole.entities.EmailLog.create({
          recipient_email: body.email,
          recipient_name: body.name || '',
          subject: subject || (body.type === 'refund' ? 'Refund Confirmation' : body.type === 'welcome_skool' ? 'Welcome + Join Skool' : 'Receipt'),
          template_name: body.type || 'receipt',
          campaign_name: body.chargeId || body.transactionId || '',
          status: 'failed',
          source: 'stripe',
          error_message: error.message,
        });
      }
    } catch {}

    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildReceiptHtml(data) {
  const { customerName, planLabel, amount, currency, transactionId, paymentMethod, dateStr, invoicePdfUrl } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 24px 24px;text-align:center;border-bottom:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement — Roye Gold</p>
            <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">Payment Receipt</p>
            <p style="margin:10px 0 0;font-size:13px;color:#888;">Thank you for your purchase, ${escapeHtml(customerName)}!</p>
          </td>
        </tr>

        <!-- Transaction Details -->
        <tr>
          <td style="padding:24px 24px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Transaction Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">DATE</span>
                  <span style="color:#F5F5F5;font-size:15px;font-weight:600;">${dateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">PRODUCT / SERVICE</span>
                  <span style="color:#00fff7;font-size:15px;font-weight:700;">${escapeHtml(planLabel)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">AMOUNT PAID</span>
                  <span style="color:#F5F5F5;font-size:20px;font-weight:800;">$${amount.toFixed(2)} ${currency}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">PAYMENT METHOD</span>
                  <span style="color:#F5F5F5;font-size:14px;">${escapeHtml(paymentMethod)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">TRANSACTION ID</span>
                  <span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">${escapeHtml(transactionId)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${invoicePdfUrl ? `
        <!-- Invoice PDF Download -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
            <a href="${escapeHtml(invoicePdfUrl)}" target="_blank" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">📄 Download Invoice PDF</a>
            <p style="margin:10px 0 0;font-size:11px;color:#555;">Click the button above to download your official invoice</p>
          </td>
        </tr>` : ''}

        <!-- Seller Info (US receipt law requirement) -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
            <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Seller Information</p>
            <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
              <strong style="color:#F5F5F5;">The Movement — Roye Gold</strong><br/>
              Digital fitness &amp; movement training services<br/>
              Contact: move@royegold.com
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#444;line-height:1.6;">
              This receipt was issued automatically upon successful payment.<br/>
              Please retain this receipt for your records.<br/><br/>
              ${dateStr} · The Movement
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildRefundHtml(data) {
  const { customerName, refundAmount, currency, dateStr, originalTransactionId, refundId, reason, invoicePdfUrl } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:20px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 24px 24px;text-align:center;border-bottom:1px solid #222;">
            <p style="margin:0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:3px;">The Movement — Roye Gold</p>
            <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">Refund Confirmation</p>
            <p style="margin:10px 0 0;font-size:13px;color:#888;">Hi ${escapeHtml(customerName)}, your refund has been processed</p>
          </td>
        </tr>

        <!-- Refund Details -->
        <tr>
          <td style="padding:24px 24px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Refund Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REFUND DATE</span>
                  <span style="color:#F5F5F5;font-size:15px;font-weight:600;">${dateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">AMOUNT REFUNDED</span>
                  <span style="color:#00fff7;font-size:20px;font-weight:800;">$${refundAmount.toFixed(2)} ${currency}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">ORIGINAL TRANSACTION</span>
                  <span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">${escapeHtml(originalTransactionId)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REFUND ID</span>
                  <span style="color:#888;font-size:12px;font-family:monospace;word-break:break-all;">${escapeHtml(refundId)}</span>
                </td>
              </tr>
              ${reason ? `<tr>
                <td style="padding:9px 0;">
                  <span style="color:#666;font-size:11px;display:block;margin-bottom:2px;">REASON</span>
                  <span style="color:#F5F5F5;font-size:14px;">${escapeHtml(reason)}</span>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Refund Timeline Info -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
            <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
              Your refund of <strong style="color:#00fff7;">$${refundAmount.toFixed(2)} ${currency}</strong> has been processed and will appear on your original payment method within <strong style="color:#F5F5F5;">5-10 business days</strong>. The exact timeline depends on your bank or card issuer.
            </p>
          </td>
        </tr>

        ${invoicePdfUrl ? `
        <!-- Invoice PDF Download -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
            <a href="${escapeHtml(invoicePdfUrl)}" target="_blank" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">📄 Download Invoice PDF</a>
            <p style="margin:10px 0 0;font-size:11px;color:#555;">Click the button above to download your updated invoice</p>
          </td>
        </tr>` : ''}

        <!-- Seller Info -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Seller Information</p>
            <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
              <strong style="color:#F5F5F5;">The Movement — Roye Gold</strong><br/>
              Digital fitness &amp; movement training services<br/>
              Contact: move@royegold.com
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#444;line-height:1.6;">
              This refund confirmation was issued automatically.<br/>
              Please retain this for your records.<br/><br/>
              ${dateStr} · The Movement
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildWelcomeSkoolHtml(data) {
  const { customerName, email, planLabel } = data;
  const skoolUrl = Deno.env.get("SKOOL_COMMUNITY_URL") || "https://www.skool.com/move";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>body{margin:0;padding:0;}table{border-collapse:collapse;}@media only screen and (max-width:480px){.email-card{border-radius:14px!important;}.hero-pad{padding:32px 22px 12px!important;}.body-pad{padding:0 22px 28px!important;}.cta-pad{padding:0 22px 32px!important;}.hero-h1{font-size:26px!important;line-height:1.15!important;}.cta-btn{padding:15px 40px!important;font-size:15px!important;}}</style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr><td align="center">
      <table class="email-card" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border-radius:18px;border:1px solid #1a1a1a;overflow:hidden;">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:3px;font-weight:600;">The Movement</p>
          <p style="margin:5px 0 0;font-size:22px;font-weight:900;color:#00fff7;letter-spacing:1.5px;text-transform:uppercase;">Roye Gold</p>
        </td></tr>
        <tr><td class="hero-pad" style="padding:40px 32px 12px;">
          <p style="margin:0 0 18px;font-size:15px;color:#00fff7;line-height:1.5;font-weight:600;">You're officially in, ${escapeHtml(customerName)}.</p>
          <h1 class="hero-h1" style="margin:0 0 16px;font-size:31px;font-weight:900;color:#F5F5F5;line-height:1.12;text-transform:uppercase;letter-spacing:-0.5px;">Welcome to The Movement</h1>
          <p style="margin:0 0 14px;font-size:16px;color:#C8C8C8;line-height:1.6;">Thank you for your purchase of <strong style="color:#00fff7;">${escapeHtml(planLabel)}</strong>. Your journey to better movement starts now.</p>
          <p style="margin:0;font-size:15px;color:#888;line-height:1.6;">The next step? Join our private Skool community — where you'll get full access to training sessions, daily practice, challenges, and direct support from Roye Gold and the community.</p>
        </td></tr>
        <tr><td style="padding:0 32px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1515;border:1px solid rgba(0,255,247,0.15);border-radius:16px;">
            <tr><td style="padding:24px 22px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;color:#00fff7;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">&#127891; Your Private Community</p>
              <p style="margin:0;font-size:19px;font-weight:700;color:#F5F5F5;line-height:1.35;">Register on Skool with the same email you used to purchase</p>
              <p style="margin:8px 0 0;font-size:13px;color:#888;line-height:1.5;">${escapeHtml(email)}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="cta-pad" style="padding:0 32px 34px;" align="center">
          <a href="${escapeHtml(skoolUrl)}" target="_blank" class="cta-btn" style="display:inline-block;background:#00fff7;color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:100px;text-transform:uppercase;letter-spacing:1px;">Join the Community &rarr;</a>
          <p style="margin:12px 0 0;font-size:11px;color:#555;line-height:1.5;">Use the same email address to be recognized automatically</p>
        </td></tr>
        <tr><td class="body-pad" style="padding:0 32px 28px;text-align:center;">
          <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;font-weight:600;">What's waiting for you inside:</p>
          <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;text-align:center;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">240+ adaptive training sessions</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;text-align:center;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Daily practice &amp; challenges</span></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;text-align:center;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Strength, mobility, control &amp; longevity tracks</span></td></tr>
            <tr><td style="padding:8px 0;text-align:center;"><span style="color:#00fff7;font-size:13px;">&#10003;</span>&nbsp;&nbsp;<span style="color:#C8C8C8;font-size:13px;">Direct support from Roye Gold &amp; the community</span></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;color:#444;line-height:1.6;">
            Need help? Just reply to this email — we've got you.<br/>
            Contact: move@royegold.com
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#444;">&copy; 2026 The Movement by Roye Gold</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}