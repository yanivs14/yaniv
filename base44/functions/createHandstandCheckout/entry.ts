import Stripe from "npm:stripe@14";

const HANDSTAND_PRICE_ID = "price_1Tr1EW4T8Uo6bhpdyQUUaqg9";
const HANDSTAND_4_LIFE_PRICE_ID = "price_1Tusrh4T8Uo6bhpd43Ou2Huv";

Deno.serve(async (req) => {
  try {
    const { ga_client_id, plan: requestedPlan } = await req.json().catch(() => ({}));
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const origin = req.headers.get("origin") || "https://themovement.royegold.com";
    const isHandstand4Life = requestedPlan === "handstand_4_life";
    const priceId = isHandstand4Life ? HANDSTAND_4_LIFE_PRICE_ID : HANDSTAND_PRICE_ID;
    const plan = isHandstand4Life ? "handstand_4_life" : "handstand_course";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/handstand-course`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan,
        source: "handstand_landing",
        ga_client_id: ga_client_id || "",
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Handstand checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});