import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return Response.json({ error: "session_id required" }, { status: 400 });
    }
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return Response.json({
      transaction_id: session.id,
      value: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() || "USD",
    });
  } catch (error) {
    console.error("getCheckoutSession error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});