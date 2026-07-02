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

  crmData.contacts = crmData.contacts.map(c => {
    const sd = stripeData.stripeMap[c.email.toLowerCase()];
    if (sd) {
      return {
        ...c,
        stripe_customer_id: sd.stripe_customer_id,
        is_paying_customer: sd.is_paying,
        is_churned: sd.is_churned,
        is_refunded: sd.is_refunded,
        purchase_plan: sd.plan || c.purchase_plan || "",
        subscription_status: sd.subscription_status || "",
        subscription_start: sd.subscription_start || null,
        subscription_canceled: sd.subscription_canceled || null,
        first_payment_date: sd.first_payment_date || null,
        last_payment_date: sd.last_payment_date || null,
        total_paid: sd.total_paid || 0,
        total_refunded: sd.total_refunded || 0,
      };
    }
    return c;
  });

  crmData.stats.paying_customers = crmData.contacts.filter(c => c.is_paying_customer).length;
  crmData.stats.leads = crmData.contacts.filter(c => !c.is_paying_customer && !c.is_churned).length;
  crmData.stats.churned = crmData.contacts.filter(c => c.is_churned).length;
  crmData.stats.refunded = crmData.contacts.filter(c => c.is_refunded).length;
  crmData.stats.in_stripe = crmData.contacts.filter(c => c.stripe_customer_id).length;
  crmData.financials = stripeData.financials;

  return crmData;
}