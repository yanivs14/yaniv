import { base44 } from "@/api/base44Client";

export async function fetchCrmOnly() {
  const res = await base44.functions.invoke("getCrmDashboard", {});
  return res.data;
}

export async function fetchStripeOnly() {
  const res = await base44.functions.invoke("getStripeFinancials", {});
  return res.data;
}

export async function fetchSkoolUploads() {
  const res = await base44.functions.invoke("manageSkoolUpload", { action: "load" });
  return res.data?.uploads || [];
}

export async function saveSkoolUpload(fileName, data) {
  const res = await base44.functions.invoke("manageSkoolUpload", { action: "save", file_name: fileName, data });
  return res.data?.upload;
}

export async function restoreSkoolUpload() {
  const res = await base44.functions.invoke("manageSkoolUpload", { action: "restore" });
  return res.data;
}

export async function activateSkoolUpload(uploadId) {
  const res = await base44.functions.invoke("manageSkoolUpload", { action: "activate", upload_id: uploadId });
  return res.data?.upload;
}

export function mergeSkoolIntoCrm(crmData, skoolData) {
  if (!skoolData?.skoolMap) return crmData;

  const existingEmails = new Set(crmData.contacts.map(c => c.email.toLowerCase()));

  crmData.contacts = crmData.contacts.map(c => {
    const sd = skoolData.skoolMap[c.email.toLowerCase()];
    if (sd) {
      return {
        ...c,
        skool_member: true,
        is_paying_customer: c.is_paying_customer || sd.is_paying,
        is_churned: c.is_churned || sd.is_churned,
        purchase_plan: c.purchase_plan || sd.skool_plan || "",
      };
    }
    return c;
  });

  for (const [email, sd] of Object.entries(skoolData.skoolMap)) {
    if (existingEmails.has(email)) continue;
    const contact = {
      email,
      name: sd.skool_name || "",
      source: "skool",
      is_paying_customer: sd.is_paying,
      is_churned: sd.is_churned,
      purchase_plan: sd.skool_plan || "",
      created_date: sd.skool_joined || null,
    };
    for (const k of Object.keys(contact)) {
      if (!contact[k]) delete contact[k];
    }
    crmData.contacts.push(contact);
  }

  crmData.stats.paying_customers = crmData.contacts.filter(c => c.is_paying_customer).length;
  crmData.stats.leads = crmData.contacts.filter(c => !c.is_paying_customer && !c.is_churned).length;
  crmData.stats.churned = crmData.contacts.filter(c => c.is_churned).length;
  crmData.stats.total_contacts = crmData.contacts.length;
  crmData.stats.in_skool = Object.keys(skoolData.skoolMap).length;

  // Merge Skool financials INTO the main financials so all cards reflect combined data
  if (!crmData.financials) crmData.financials = {};
  const sf = skoolData.financials || {};
  const skoolRevenue = sf.total_revenue || 0;

  crmData.financials.total_revenue = (crmData.financials.total_revenue || 0) + skoolRevenue;
  crmData.financials.skool_revenue = skoolRevenue;
  crmData.financials.skool_active = skoolData.stats.active_members;
  crmData.financials.skool_churned = skoolData.stats.churned_members;

  // Merge monthly data
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const combinedMonthly = { ...(crmData.financials.monthly_data || {}) };
  for (const [key, val] of Object.entries(sf.monthly_data || {})) {
    if (!combinedMonthly[key]) combinedMonthly[key] = { revenue: 0, transactions: 0 };
    combinedMonthly[key].revenue += val.revenue || 0;
    combinedMonthly[key].transactions += val.transactions || 0;
    if (key === thisMonthKey) {
      crmData.financials.this_month_revenue = (crmData.financials.this_month_revenue || 0) + (val.revenue || 0);
      crmData.financials.this_month_transactions = (crmData.financials.this_month_transactions || 0) + (val.transactions || 0);
    } else if (key === lastMonthKey) {
      crmData.financials.last_month_revenue = (crmData.financials.last_month_revenue || 0) + (val.revenue || 0);
      crmData.financials.last_month_transactions = (crmData.financials.last_month_transactions || 0) + (val.transactions || 0);
    }
  }
  // Sort and keep last 6 months
  const sortedMonths = Object.entries(combinedMonthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);
  crmData.financials.monthly_data = Object.fromEntries(sortedMonths);

  // Recalculate ARPU with combined customers
  crmData.financials.arpu = crmData.stats.paying_customers > 0
    ? crmData.financials.total_revenue / crmData.stats.paying_customers
    : 0;

  return crmData;
}

export function mergeStripeIntoCrm(crmData, stripeData) {
  if (!stripeData?.stripeMap) return crmData;

  // 1. Enrich existing contacts with Stripe data
  const existingEmails = new Set(crmData.contacts.map(c => c.email.toLowerCase()));

  crmData.contacts = crmData.contacts.map(c => {
    const sd = stripeData.stripeMap[c.email.toLowerCase()];
    if (sd) {
      return {
        ...c,
        stripe_customer_id: sd.stripe_customer_id,
        is_paying_customer: sd.is_paying,
        is_churned: sd.is_churned,
        is_refunded: sd.is_refunded,
        is_recurring: sd.is_recurring || false,
        purchase_plan: sd.plan || c.purchase_plan || "",
        subscription_status: sd.subscription_status || "",
        subscription_canceled: sd.subscription_canceled || null,
        first_payment_date: sd.first_payment_date || null,
        last_payment_date: sd.last_payment_date || null,
        total_paid: sd.total_paid || 0,
        total_refunded: sd.total_refunded || 0,
        payment_months: sd.payment_months || [],
      };
    }
    return c;
  });

  // 2. Add Stripe-only customers (not in our lead/newsletter DB)
  for (const [email, sd] of Object.entries(stripeData.stripeMap)) {
    if (existingEmails.has(email)) continue;
    const contact = {
      email,
      name: sd.name || "",
      source: "stripe",
      stripe_customer_id: sd.stripe_customer_id,
      is_paying_customer: sd.is_paying,
      is_churned: sd.is_churned,
      is_refunded: sd.is_refunded,
      is_recurring: sd.is_recurring || false,
      purchase_plan: sd.plan || "",
      subscription_status: sd.subscription_status || "",
      subscription_canceled: sd.subscription_canceled || null,
      first_payment_date: sd.first_payment_date || null,
      last_payment_date: sd.last_payment_date || null,
      total_paid: sd.total_paid || 0,
      total_refunded: sd.total_refunded || 0,
      payment_months: sd.payment_months || [],
      created_date: sd.first_payment_date || sd.subscription_start || null,
    };
    // Remove falsy values
    for (const k of Object.keys(contact)) {
      if (!contact[k]) delete contact[k];
    }
    crmData.contacts.push(contact);
  }

  crmData.stats.paying_customers = crmData.contacts.filter(c => c.is_paying_customer).length;
  crmData.stats.leads = crmData.contacts.filter(c => !c.is_paying_customer && !c.is_churned).length;
  crmData.stats.churned = crmData.contacts.filter(c => c.is_churned).length;
  crmData.stats.refunded = crmData.contacts.filter(c => c.is_refunded).length;
  crmData.stats.in_stripe = crmData.contacts.filter(c => c.stripe_customer_id).length;
  crmData.stats.total_contacts = crmData.contacts.length;
  crmData.financials = stripeData.financials;

  return crmData;
}