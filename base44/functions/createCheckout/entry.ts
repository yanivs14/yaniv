import Stripe from "npm:stripe@14";

const PRICE_IDS = {
  monthly: "price_1TSPB74T8Uo6bhpdgcMdQoKk",
  annual: "price_1TSPB74T8Uo6bhpduFNzRk8o",
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
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
      },
    });

    console.log("Checkout session created:", session.id, "plan:", plan);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});