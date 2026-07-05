import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_LABELS = {
  monthly: "Monthly — $35/month",
  annual: "Annual — $250/year",
  promo: "Promo — $25/month (first 3 months)",
  handstand_course: "Handstand Course — $97 one-time",
};

function inferPlanFromPrice(price) {
  if (!price) return '';
  const amount = price.unit_amount ? price.unit_amount / 100 : 0;
  const interval = price.recurring?.interval;
  if (interval === 'month' && amount === 35) return 'Monthly — $35/month';
  if (interval === 'month' && amount === 25) return 'Promo — $25/month';
  if (interval === 'year' && amount === 250) return 'Annual — $250/year';
  if (interval === 'year' && Math.abs(amount - 239.88) < 0.15) return 'Annual — $239.88/year';
  if (interval === 'year' && amount === 240) return 'Annual — $240/year';
  if (interval === 'year' && amount === 160) return 'Yearly — $160';
  if (!interval && amount === 97) return 'Handstand Course — $97';
  if (!interval && amount === 350) return 'Inner Circle — $350';
  if (interval) return `${interval}ly — $${amount}`;
  return `One-time — $${amount}`;
}

function inferPlanFromCharge(charge) {
  if (charge.metadata?.plan) return PLAN_LABELS[charge.metadata.plan] || charge.metadata.plan;
  const desc = (charge.description || '').toLowerCase();
  if (desc.includes('handstand')) return 'Handstand Course — $97';
  if (desc.includes('inner circle') || desc.includes('final ic')) return 'Inner Circle — $350';
  if (desc.includes('annual') || desc.includes('yearly')) return 'Annual';
  if (desc.includes('monthly')) return 'Monthly — $35/month';
  if (desc.includes('promo')) return 'Promo — $25/month';
  return charge.description || 'One-time payment';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeMap = {};
    const financials = {
      total_revenue: 0,
      total_refunded: 0,
      this_month_revenue: 0,
      last_month_revenue: 0,
      this_month_transactions: 0,
      last_month_transactions: 0,
      mrr: 0,
      monthly_data: {},
    };

    if (!stripeKey) {
      return Response.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // 1. List ALL subscriptions (active + canceled + trialing) with expanded customer
    let subHasMore = true;
    let subStartingAfter = null;
    let subPageCount = 0;
    while (subHasMore && subPageCount < 50) {
      const params = { limit: 100, status: 'all', expand: ['data.customer'] };
      if (subStartingAfter) params.starting_after = subStartingAfter;
      const subs = await stripe.subscriptions.list(params);

      for (const sub of subs.data) {
        const email = (sub.customer?.email || '').toLowerCase().trim();
        if (!email) continue;

        let data = stripeMap[email];
        if (!data) {
          data = {
            stripe_customer_id: sub.customer?.id || null,
            name: sub.customer?.name || '',
            is_paying: false,
            is_churned: false,
            is_refunded: false,
            is_recurring: false,
            plan: '',
            subscription_status: '',
            subscription_start: null,
            subscription_canceled: null,
            first_payment_date: null,
            last_payment_date: null,
            total_paid: 0,
            total_refunded: 0,
            payment_months: [],
          };
          stripeMap[email] = data;
        }

        const isActive = ['active', 'trialing'].includes(sub.status);
        const isCanceled = sub.status === 'canceled';
        const price = sub.items?.data?.[0]?.price;
        const subPlan = sub.metadata?.plan ? (PLAN_LABELS[sub.metadata.plan] || sub.metadata.plan) : inferPlanFromPrice(price);

        if (isActive) {
          data.is_paying = true;
          data.is_churned = false;
          data.is_recurring = true;
          data.subscription_status = sub.status;
          data.subscription_start = sub.start_date ? new Date(sub.start_date * 1000).toISOString() : null;
          if (!data.plan) data.plan = subPlan;
          if (price?.recurring?.interval === 'month') {
            financials.mrr += price.unit_amount / 100;
          } else if (price?.recurring?.interval === 'year') {
            financials.mrr += (price.unit_amount / 100) / 12;
          }
        } else if (isCanceled && !data.is_paying) {
          data.is_churned = true;
          data.is_recurring = price?.recurring?.interval === 'month';
          data.subscription_status = sub.status;
          data.subscription_start = sub.start_date ? new Date(sub.start_date * 1000).toISOString() : null;
          data.subscription_canceled = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;
          if (!data.plan) data.plan = subPlan;
        }
      }

      subHasMore = subs.has_more;
      if (subHasMore) subStartingAfter = subs.data[subs.data.length - 1].id;
      subPageCount++;
    }
    console.log(`Stripe: fetched subscriptions, ${Object.keys(stripeMap).length} contacts so far`);

    // 2. List charges from last 24 months (payment dates, refunds, revenue)
    const twoYearsAgo = Math.floor((Date.now() - 730 * 24 * 60 * 60 * 1000) / 1000);
    let chargeHasMore = true;
    let chargeStartingAfter = null;
    let chargePageCount = 0;
    while (chargeHasMore && chargePageCount < 50) {
      const params = { limit: 100, created: { gte: twoYearsAgo } };
      if (chargeStartingAfter) params.starting_after = chargeStartingAfter;
      const charges = await stripe.charges.list(params);

      for (const charge of charges.data) {
        if (!charge.paid) continue;

        const email = charge.billing_details?.email?.toLowerCase().trim();
        if (!email) continue;

        let data = stripeMap[email];
        if (!data) {
          data = {
            stripe_customer_id: charge.customer || null,
            name: charge.billing_details?.name || '',
            is_paying: false,
            is_churned: false,
            is_refunded: false,
            is_recurring: false,
            plan: '',
            subscription_status: '',
            subscription_start: null,
            subscription_canceled: null,
            first_payment_date: null,
            last_payment_date: null,
            total_paid: 0,
            total_refunded: 0,
            payment_months: [],
          };
          stripeMap[email] = data;
        }

        const chargeDate = new Date(charge.created * 1000);
        const chargeMonthKey = `${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}`;
        const netAmount = (charge.amount - charge.amount_refunded) / 100;

        data.total_paid += charge.amount / 100;
        financials.total_revenue += netAmount;

        if (!data.payment_months.includes(chargeMonthKey)) {
          data.payment_months.push(chargeMonthKey);
        }

        if (charge.amount_refunded > 0) {
          data.total_refunded += charge.amount_refunded / 100;
          data.is_refunded = true;
          financials.total_refunded += charge.amount_refunded / 100;
        }

        if (!data.first_payment_date || chargeDate < new Date(data.first_payment_date)) {
          data.first_payment_date = chargeDate.toISOString();
        }
        if (!data.last_payment_date || chargeDate > new Date(data.last_payment_date)) {
          data.last_payment_date = chargeDate.toISOString();
        }

        if (!financials.monthly_data[chargeMonthKey]) {
          financials.monthly_data[chargeMonthKey] = { revenue: 0, transactions: 0 };
        }
        financials.monthly_data[chargeMonthKey].revenue += netAmount;
        financials.monthly_data[chargeMonthKey].transactions += 1;

        if (chargeMonthKey === thisMonthKey) {
          financials.this_month_revenue += netAmount;
          financials.this_month_transactions += 1;
        } else if (chargeMonthKey === lastMonthKey) {
          financials.last_month_revenue += netAmount;
          financials.last_month_transactions += 1;
        }

        if (!data.is_paying && !data.is_churned && netAmount > 0) {
          data.is_paying = true;
          if (!data.plan) data.plan = inferPlanFromCharge(charge);
        }
      }

      chargeHasMore = charges.has_more;
      if (chargeHasMore) chargeStartingAfter = charges.data[charges.data.length - 1].id;
      chargePageCount++;
    }
    console.log(`Stripe: processed charges, ${Object.keys(stripeMap).length} total contacts`);

    const sortedMonths = Object.entries(financials.monthly_data)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    financials.monthly_data = Object.fromEntries(sortedMonths);

    // Compute stats
    const allContacts = Object.values(stripeMap);
    const stats = {
      paying_customers: allContacts.filter(c => c.is_paying).length,
      churned: allContacts.filter(c => c.is_churned).length,
      refunded: allContacts.filter(c => c.is_refunded).length,
      in_stripe: allContacts.length,
    };

    // Plan breakdown + ARPU
    const planBreakdown = {};
    for (const c of allContacts) {
      if (c.is_paying && c.plan) {
        planBreakdown[c.plan] = (planBreakdown[c.plan] || 0) + 1;
      }
    }
    financials.arpu = stats.paying_customers > 0 ? financials.total_revenue / stats.paying_customers : 0;
    financials.churn_rate = stats.paying_customers + stats.churned > 0
      ? (stats.churned / (stats.paying_customers + stats.churned)) * 100 : 0;
    financials.plan_breakdown = planBreakdown;

    return Response.json({ stripeMap, financials, stats });
  } catch (error) {
    console.error("getStripeFinancials error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});