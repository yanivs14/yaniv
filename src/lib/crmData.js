import { base44 } from "@/api/base44Client";

export async function fetchCrmOnly() {
  const res = await base44.functions.invoke("getCrmDashboard", {});
  return res.data;
}

export async function fetchStripeOnly(dateRange) {
  const payload = {};
  if (dateRange) {
    payload.created_after = dateRange.created_after;
    payload.created_before = dateRange.created_before;
  }
  const res = await base44.functions.invoke("getStripeFinancials", payload);
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

  // Merge Skool financials — create a NEW object so React detects the change (useMemo)
  const oldFin = crmData.financials || {};
  const sf = skoolData.financials || {};
  const skoolRevenue = sf.total_revenue || 0;

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Build merged monthly data in a fresh object
  const combinedMonthly = {};
  for (const [key, val] of Object.entries(oldFin.monthly_data || {})) {
    combinedMonthly[key] = { revenue: val.revenue || 0, transactions: val.transactions || 0 };
  }
  let thisMonthRev = oldFin.this_month_revenue || 0;
  let thisMonthTx = oldFin.this_month_transactions || 0;
  let lastMonthRev = oldFin.last_month_revenue || 0;
  let lastMonthTx = oldFin.last_month_transactions || 0;
  for (const [key, val] of Object.entries(sf.monthly_data || {})) {
    if (!combinedMonthly[key]) combinedMonthly[key] = { revenue: 0, transactions: 0 };
    combinedMonthly[key].revenue += val.revenue || 0;
    combinedMonthly[key].transactions += val.transactions || 0;
    if (key === thisMonthKey) {
      thisMonthRev += val.revenue || 0;
      thisMonthTx += val.transactions || 0;
    } else if (key === lastMonthKey) {
      lastMonthRev += val.revenue || 0;
      lastMonthTx += val.transactions || 0;
    }
  }
  const sortedMonths = Object.entries(combinedMonthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const totalRev = (oldFin.total_revenue || 0) + skoolRevenue;
  crmData.financials = {
    ...oldFin,
    total_revenue: totalRev,
    skool_revenue: skoolRevenue,
    skool_active: skoolData.stats.active_members,
    skool_churned: skoolData.stats.churned_members,
    this_month_revenue: thisMonthRev,
    this_month_transactions: thisMonthTx,
    last_month_revenue: lastMonthRev,
    last_month_transactions: lastMonthTx,
    monthly_data: Object.fromEntries(sortedMonths),
    arpu: crmData.stats.paying_customers > 0 ? totalRev / crmData.stats.paying_customers : 0,
  };

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