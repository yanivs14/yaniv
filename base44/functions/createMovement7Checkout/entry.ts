import Stripe from "npm:stripe@14";

const PRICE_IDS = {
  monthly: "price_1TjKfZ4T8Uo6bhpdGD4MKCBW",
  annual:  "price_1TjKfZ4T8Uo6bhpdHWYJf0dw",
};

Deno.serve(async (req) => {
  try {
    const { plan } = await req.json();

    if (!plan || !PRICE_IDS[plan]) {
      return Response.json({ error: "Invalid plan. Use 'monthly' or 'annual'." }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const origin = req.headers.get("origin") || "https://your-app.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${origin}/MOVEMENT7PREP?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/MOVEMENT7PREP?checkout=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
        source: "movement7prep",
      },
    });

    console.log("Movement7 checkout session created:", session.id, "plan:", plan);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Movement7 checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});