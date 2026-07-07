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

export function mergeSkoolIntoCrm(crmData, skoolData, dateRange) {
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
        is_inner_circle: c.is_inner_circle || /inner\s*circle/i.test(sd.skool_plan || ""),
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
      is_inner_circle: /inner\s*circle/i.test(sd.skool_plan || ""),
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
  crmData.stats.inner_circle = crmData.contacts.filter(c => c.is_inner_circle && c.is_paying_customer && !c.is_churned).length;

  // Skool financials are NOT merged into revenue — Stripe is the single source of truth for payments.
  // Skool data is used only for contact enrichment (member status, plan, IC identification).
  if (!crmData.financials) crmData.financials = {};
  crmData.financials.skool_active = skoolData.stats.active_members;
  crmData.financials.skool_churned = skoolData.stats.churned_members;

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
        is_inner_circle: c.is_inner_circle || /inner\s*circle/i.test(sd.plan || "") || (sd.total_paid >= 350 && !sd.is_recurring),
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
      is_inner_circle: /inner\s*circle/i.test(sd.plan || "") || (sd.total_paid >= 350 && !sd.is_recurring),
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
  crmData.stats.inner_circle = crmData.contacts.filter(c => c.is_inner_circle && c.is_paying_customer && !c.is_churned).length;

  // Stripe is the single source of truth for revenue — preserves skool_active/skool_churned from prior merge
  const prevSkoolActive = crmData.financials?.skool_active;
  const prevSkoolChurned = crmData.financials?.skool_churned;
  crmData.financials = { ...stripeData.financials };
  if (prevSkoolActive != null) crmData.financials.skool_active = prevSkoolActive;
  if (prevSkoolChurned != null) crmData.financials.skool_churned = prevSkoolChurned;

  return crmData;
}