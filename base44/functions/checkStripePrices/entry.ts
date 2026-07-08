import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from "npm:stripe@14";

// All checkout price IDs used across the app — kept in sync with createCheckout,
// createHandstandCheckout, and createMovement7Checkout.
const ALL_PRICES = [
  { id: "price_1TZC114T8Uo6bhpdlJzK5jt4", label: "Membership — Monthly $35", source: "createCheckout", plan: "monthly" },
  { id: "price_1Tndsr4T8Uo6bhpd4wTA4Q8F", label: "Membership — Annual $250", source: "createCheckout", plan: "annual" },
  { id: "price_1Th6Ap4T8Uo6bhpdZQd9Idsx", label: "Membership — Promo", source: "createCheckout", plan: "promo" },
  { id: "price_1To1QR4T8Uo6bhpdQiRQf3F0", label: "Handstand Course", source: "createHandstandCheckout", plan: "handstand_course" },
  { id: "price_1TjKfZ4T8Uo6bhpdGD4MKCBW", label: "Movement7 Prep — Monthly", source: "createMovement7Checkout", plan: "monthly" },
  { id: "price_1TjKfZ4T8Uo6bhpdHWYJf0dw", label: "Movement7 Prep — Annual", source: "createMovement7Checkout", plan: "annual" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const results = [];

    for (const priceConfig of ALL_PRICES) {
      try {
        const price = await stripe.prices.retrieve(priceConfig.id, { expand: ["product"] });
        const product = price.product;
        const productActive = typeof product === "object" && product !== null ? product.active : true;
        const isHealthy = price.active && productActive;

        results.push({
          ...priceConfig,
          status: isHealthy ? "active" : "inactive",
          price_active: price.active,
          product_active: productActive,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring?.interval || null,
          product_name: typeof product === "object" && product !== null ? product.name : null,
          error: null,
        });
      } catch (error) {
        results.push({
          ...priceConfig,
          status: "error",
          price_active: false,
          product_active: false,
          unit_amount: null,
          currency: null,
          recurring: null,
          product_name: null,
          error: error.message,
        });
      }
    }

    const failedCount = results.filter(r => r.status !== "active").length;
    console.log(`Stripe price check: ${results.length - failedCount}/${results.length} active`);

    return Response.json({
      checked_at: new Date().toISOString(),
      total: results.length,
      active_count: results.length - failedCount,
      failed_count: failedCount,
      prices: results,
    });
  } catch (error) {
    console.error("Stripe price check failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});