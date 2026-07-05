import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    // Fetch all automation-related data in parallel
    const [calendlyTracking, skoolUploads, emailLogs, leadSettings] = await Promise.all([
      base44.asServiceRole.entities.CalendlyTracking.list('-created_date', 30).catch(() => []),
      base44.asServiceRole.entities.SkoolUpload.list('-created_date', 10).catch(() => []),
      base44.asServiceRole.entities.EmailLog.list('-created_date', 30).catch(() => []),
      base44.asServiceRole.entities.LeadSettings.list().catch(() => []),
    ]);

    // Try to fetch recent Stripe events for webhook activity
    let stripeEvents = [];
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      try {
        const res = await fetch("https://api.stripe.com/v1/events?limit=20", {
          headers: { Authorization: `Bearer ${stripeKey}` }
        });
        const data = await res.json();
        stripeEvents = (data.data || []).map(ev => ({
          id: ev.id,
          type: ev.type,
          created: ev.created,
          livemode: ev.livemode,
        }));
      } catch (e) {
        console.warn("Failed to fetch Stripe events:", e.message);
      }
    }

    return Response.json({
      calendly_tracking: calendlyTracking,
      skool_uploads: skoolUploads,
      email_logs: emailLogs,
      lead_settings: leadSettings?.[0] || null,
      stripe_events: stripeEvents,
    });
  } catch (error) {
    console.error('getAutomationsData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});