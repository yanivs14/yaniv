import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_LABELS = {
  monthly: "Monthly — $35/month",
  annual: "Annual — $250/year",
  promo: "Promo — $25/month (first 3 months)",
};

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return Response.json({ error: "session_id required" }, { status: 400 });
    }
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer_details", "line_items", "subscription"],
    });

    // Extract purchase details
    const plan = session.metadata?.plan || "unknown";
    const planLabel = PLAN_LABELS[plan] || plan;
    const customerEmail = session.customer_details?.email || "";
    const customerName = session.customer_details?.name || customerEmail || "Unknown Customer";
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency?.toUpperCase() || "USD";
    const transactionId = session.id;

    // Try to match an existing lead by email to get quiz data
    let matchedLead = null;
    if (customerEmail) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ email: customerEmail });
        matchedLead = leads[0] || null;
      } catch (_) {}
    }

    // Get admin notification emails
    let recipientEmails = [];
    try {
      const settings = await base44.asServiceRole.entities.LeadSettings.list();
      recipientEmails = settings?.[0]?.recipient_emails || [];
    } catch (_) {}

    // Send admin notification email
    for (const adminEmail of recipientEmails) {
      try {
        const quizRows = matchedLead?.quiz_answers && Object.keys(matchedLead.quiz_answers).length > 0
          ? Object.entries(matchedLead.quiz_answers).map(([k, v]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">${k}</span>
                <span style="color:#00fff7;font-size:14px;font-weight:600;">${v}</span>
              </td>
            </tr>`).join('')
          : '';

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `💰 New Purchase — ${customerName} — ${planLabel}`,
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
                  <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#00fff7;letter-spacing:1px;text-transform:uppercase;">New Purchase 🎉</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:#22c55e;color:#0a0a0a;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;white-space:nowrap;">Paid</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Purchase Details -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Purchase Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PLAN</span>
                  <span style="color:#00fff7;font-size:16px;font-weight:700;">${planLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">AMOUNT PAID</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:700;">${amount.toFixed(2)} ${currency}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">TRANSACTION ID</span>
                  <span style="color:#F5F5F5;font-size:14px;font-family:monospace;">${transactionId}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Customer Info -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0 0 16px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Customer</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">FULL NAME</span>
                  <span style="color:#F5F5F5;font-size:16px;font-weight:700;">${customerName}</span>
                </td>
              </tr>
              ${customerEmail ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">EMAIL</span>
                  <span style="color:#00fff7;font-size:15px;font-weight:600;">${customerEmail}</span>
                </td>
              </tr>` : ''}
              ${matchedLead?.phone ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">PHONE</span>
                  <span style="color:#F5F5F5;font-size:15px;">${matchedLead.phone}</span>
                </td>
              </tr>` : ''}
              ${matchedLead?.country ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                  <span style="color:#666;font-size:12px;display:block;margin-bottom:3px;">LOCATION</span>
                  <span style="color:#F5F5F5;font-size:14px;">${matchedLead.country}${matchedLead.browser_language ? ' · ' + matchedLead.browser_language : ''}</span>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Quiz Recommendation -->
        ${matchedLead?.quiz_recommendation ? `<tr>
          <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
            <p style="margin:0 0 6px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">Quiz Recommendation</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#00fff7;">${matchedLead.quiz_recommendation}</p>
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
      } catch (_) {}
    }

    return Response.json({
      transaction_id: session.id,
      value: amount,
      currency,
    });
  } catch (error) {
    console.error("getCheckoutSession error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});