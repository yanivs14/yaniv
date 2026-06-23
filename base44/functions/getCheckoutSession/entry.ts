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

    return Response.json({
      transaction_id: session.id,
      value: amount,
      currency,
      plan,
      plan_label: planLabel,
      customer_name: customerName,
      customer_email: customerEmail,
    });
  } catch (error) {
    console.error("getCheckoutSession error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});