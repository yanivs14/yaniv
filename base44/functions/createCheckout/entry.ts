import Stripe from "npm:stripe@14";

const PRICE_IDS = {
  monthly: "price_1TSPB74T8Uo6bhpdgcMdQoKk",
  annual: "price_1Tndsr4T8Uo6bhpd4wTA4Q8F",
  promo: "price_1Th6Ap4T8Uo6bhpdZQd9Idsx",
};

Deno.serve(async (req) => {
  try {
    const { plan, ga_client_id } = await req.json();

    if (!plan || !PRICE_IDS[plan]) {
      return Response.json({ error: "Invalid plan. Use 'monthly', 'annual', or 'promo'." }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const origin = req.headers.get("origin") || "https://your-app.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?checkout=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
        ga_client_id: ga_client_id || "",
      },
    });

    console.log("Checkout session created:", session.id, "plan:", plan);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});