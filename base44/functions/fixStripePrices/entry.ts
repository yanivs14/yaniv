import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const results = [];

    // 1. Handstand Course — price is archived, cannot be reactivated.
    //    Create a new price on the same product.
    const HANDSTAND_OLD_PRICE = "price_1To1QR4T8Uo6bhpdQiRQf3F0";
    try {
      const oldPrice = await stripe.prices.retrieve(HANDSTAND_OLD_PRICE);
      const newPrice = await stripe.prices.create({
        unit_amount: oldPrice.unit_amount,
        currency: oldPrice.currency,
        product: oldPrice.product,
        nickname: "Handstand Course",
      });
      results.push({
        label: "Handstand Course",
        action: "created_new_price",
        old_price_id: HANDSTAND_OLD_PRICE,
        new_price_id: newPrice.id,
        amount: `$${(newPrice.unit_amount / 100).toFixed(2)}`,
      });
    } catch (error) {
      results.push({ label: "Handstand Course", action: "error", error: error.message });
    }

    // 2 & 3. Movement7 Prep — prices are fine but products are inactive.
    //         Reactivate the products.
    const MOVEMENT7_PRICES = [
      { id: "price_1TjKfZ4T8Uo6bhpdGD4MKCBW", label: "Movement7 Prep — Monthly" },
      { id: "price_1TjKfZ4T8Uo6bhpdHWYJf0dw", label: "Movement7 Prep — Annual" },
    ];

    for (const { id, label } of MOVEMENT7_PRICES) {
      try {
        const price = await stripe.prices.retrieve(id, { expand: ["product"] });
        const product = price.product;
        if (typeof product === "object" && product !== null && !product.active) {
          const reactivated = await stripe.products.update(product.id, { active: true });
          results.push({
            label,
            action: "reactivated_product",
            product_id: product.id,
            product_name: reactivated.name,
          });
        } else {
          results.push({ label, action: "already_active" });
        }
      } catch (error) {
        results.push({ label, action: "error", error: error.message });
      }
    }

    console.log("Stripe fix results:", JSON.stringify(results));
    return Response.json({ results });
  } catch (error) {
    console.error("Fix failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});