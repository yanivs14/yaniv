import { base44 } from "@/api/base44Client";

export async function fetchCrmOnly() {
  const res = await base44.functions.invoke("getCrmDashboard", {});
  return res.data;
}

export async function fetchStripeOnly() {
  const res = await base44.functions.invoke("getStripeFinancials", {});
  return res.data;
}

export function mergeStripeIntoCrm(crmData, stripeData) {
  if (!stripeData?.stripeMap) return crmData;

  for (const c of crmData.contacts) {
    const sd = stripeData.stripeMap[c.email.toLowerCase()];
    if (sd) {
      c.stripe_customer_id = sd.stripe_customer_id;
      c.is_paying_customer = sd.is_paying;
      c.is_churned = sd.is_churned;
      c.is_refunded = sd.is_refunded;
      c.purchase_plan = sd.plan || c.purchase_plan || "";
      c.subscription_status = sd.subscription_status || "";
      c.subscription_start = sd.subscription_start || null;
      c.subscription_canceled = sd.subscription_canceled || null;
      c.first_payment_date = sd.first_payment_date || null;
      c.last_payment_date = sd.last_payment_date || null;
      c.total_paid = sd.total_paid || 0;
      c.total_refunded = sd.total_refunded || 0;
    }
  }

  crmData.stats.paying_customers = crmData.contacts.filter(c => c.is_paying_customer).length;
  crmData.stats.leads = crmData.contacts.filter(c => !c.is_paying_customer && !c.is_churned).length;
  crmData.stats.churned = crmData.contacts.filter(c => c.is_churned).length;
  crmData.stats.refunded = crmData.contacts.filter(c => c.is_refunded).length;
  crmData.stats.in_stripe = crmData.contacts.filter(c => c.stripe_customer_id).length;
  crmData.financials = stripeData.financials;

  return crmData;
}