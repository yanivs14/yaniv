import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const body = await req.json();
    const { action } = body;

    // --- Get customer details (subscriptions + payments) ---
    if (action === 'get_details') {
      const { customer_email, customer_id } = body;

      let customerId = customer_id;
      let customer = null;

      if (!customerId && customer_email) {
        const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
        if (customers.data.length === 0) {
          return Response.json({ error: 'Customer not found in Stripe' }, { status: 404 });
        }
        customerId = customers.data[0].id;
        customer = customers.data[0];
      } else if (customerId) {
        customer = await stripe.customers.retrieve(customerId);
      }

      if (!customerId || !customer) {
        return Response.json({ error: 'No customer found' }, { status: 404 });
      }

      // Get subscriptions
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
      const subDetails = subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        plan: sub.items?.data?.[0]?.price?.nickname || sub.items?.data?.[0]?.price?.id || 'Unknown',
        amount: sub.items?.data?.[0]?.price?.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 0,
        currency: (sub.items?.data?.[0]?.price?.currency || 'usd').toUpperCase(),
        interval: sub.items?.data?.[0]?.price?.recurring?.interval || '',
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        canceled_at: sub.canceled_at,
        created: sub.created,
      }));

      // Get charges
      const charges = await stripe.charges.list({ customer: customerId, limit: 10 });
      const chargeDetails = charges.data
        .filter(ch => ch.paid)
        .map(ch => ({
          id: ch.id,
          payment_intent_id: ch.payment_intent,
          amount: ch.amount / 100,
          currency: ch.currency.toUpperCase(),
          refunded: ch.refunded,
          amount_refunded: ch.amount_refunded / 100,
          created: ch.created,
          description: ch.description || '',
        }));

      return Response.json({
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          created: customer.created,
        },
        subscriptions: subDetails,
        charges: chargeDetails,
      });
    }

    // --- Cancel subscription ---
    if (action === 'cancel_subscription') {
      const { subscription_id } = body;
      if (!subscription_id) return Response.json({ error: 'subscription_id required' }, { status: 400 });

      const canceled = await stripe.subscriptions.cancel(subscription_id);
      console.log(`Subscription canceled: ${subscription_id} by admin ${user.email}`);

      return Response.json({
        success: true,
        subscription: {
          id: canceled.id,
          status: canceled.status,
          canceled_at: canceled.canceled_at,
        },
      });
    }

    // --- Refund payment ---
    if (action === 'refund_payment') {
      const { payment_intent_id, charge_id, amount } = body;
      if (!payment_intent_id && !charge_id) {
        return Response.json({ error: 'payment_intent_id or charge_id required' }, { status: 400 });
      }

      const refundParams = {};
      if (payment_intent_id) refundParams.payment_intent = payment_intent_id;
      if (charge_id) refundParams.charge = charge_id;
      if (amount && amount > 0) refundParams.amount = Math.round(amount * 100);

      const refund = await stripe.refunds.create(refundParams);
      console.log(`Refund created: ${refund.id} | $${(refund.amount / 100).toFixed(2)} | by admin ${user.email}`);

      // Send refund email to customer
      try {
        const charge = await stripe.charges.retrieve(refund.charge);
        let customerEmail = "";
        let customerName = "Customer";
        if (charge.customer) {
          const customer = await stripe.customers.retrieve(charge.customer);
          customerEmail = customer?.email || "";
          customerName = customer?.name || customer?.email || "Customer";
        }
        if (!customerEmail) customerEmail = charge.billing_details?.email || "";

        if (customerEmail) {
          await base44.functions.invoke("sendCustomerEmail", {
            type: "refund",
            email: customerEmail,
            name: customerName,
            amount: refund.amount / 100,
            currency: refund.currency.toUpperCase(),
            originalTransactionId: charge.payment_intent || charge.id,
            refundId: refund.id,
            reason: refund.reason || "",
            chargeId: charge.id,
          });
        }
      } catch (e) {
        console.warn("Failed to send refund email:", e.message);
      }

      return Response.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          currency: refund.currency.toUpperCase(),
          status: refund.status,
        },
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('manageStripeSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});