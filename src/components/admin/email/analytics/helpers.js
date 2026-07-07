export function formatMoney(n, decimals = 0) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`;
}

export function normalizeDate(dateStr) {
  if (!dateStr) return null;
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  return isNaN(d) ? null : d;
}

export function isToday(dateStr) {
  const d = normalizeDate(dateStr);
  if (!d) return false;
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function isThisMonth(dateStr) {
  const d = normalizeDate(dateStr);
  if (!d) return false;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function categorizePlan(planStr) {
  const lower = (planStr || "").toLowerCase();
  if (lower.includes("year") || lower.includes("annual")) return "annual";
  if (lower.includes("month") || lower.includes("promo") || lower.includes("special")) return "monthly";
  return "untagged";
}

const PLAN_PRICES = {
  monthly: 35,
  annual: 250 / 12,
  untagged: 97,
};

export function computeMonthlyTrend(contacts, financials) {
  const customerDates = contacts
    .map(c => ({ join: normalizeDate(c.first_payment_date), churn: normalizeDate(c.subscription_canceled) }))
    .filter(cd => cd.join);

  const monthlyMap = {};
  const startDate = new Date(2024, 6, 1);
  const now = new Date();
  const months = [];
  let d = new Date(startDate);
  while (d <= now) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
    monthlyMap[key] = { mrr: 0, activeMembers: 0 };
    d.setMonth(d.getMonth() + 1);
  }

  for (const [key, val] of Object.entries(financials.monthly_data || {})) {
    if (monthlyMap[key]) monthlyMap[key].mrr = Math.round(val.mrr || val.revenue || 0);
  }

  for (const key of months) {
    const [y, m] = key.split("-").map(Number);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);
    const histData = financials.monthly_data?.[key];
    if (histData?.is_historical && histData.active_members != null) {
      monthlyMap[key].activeMembers = histData.active_members;
    } else {
      monthlyMap[key].activeMembers = customerDates.filter(cd => cd.join <= monthEnd && (!cd.churn || cd.churn > monthEnd)).length;
    }
  }

  return months.map(key => ({ key, month: monthLabel(key), mrr: monthlyMap[key].mrr, activeMembers: monthlyMap[key].activeMembers }));
}

export function computeFullTrend(contacts, financials) {
  const customerDates = contacts
    .map(c => ({
      join: normalizeDate(c.first_payment_date),
      churn: normalizeDate(c.subscription_canceled),
      plan: categorizePlan(c.purchase_plan),
      totalRefunded: c.total_refunded || 0,
    }))
    .filter(cd => cd.join);

  const monthlyMap = {};
  const startDate = new Date(2024, 6, 1);
  const now = new Date();
  const months = [];
  let d = new Date(startDate);
  while (d <= now) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
    monthlyMap[key] = {
      mrr: 0,
      activeMembers: 0,
      newSignups: 0,
      cancellations: 0,
      revenue: 0,
      refunds: 0,
      mrrMonthly: 0,
      mrrAnnual: 0,
      mrrUntagged: 0,
    };
    d.setMonth(d.getMonth() + 1);
  }

  for (const [key, val] of Object.entries(financials.monthly_data || {})) {
    if (monthlyMap[key]) {
      monthlyMap[key].revenue = Math.round(val.revenue || 0);
      monthlyMap[key].mrr = Math.round(val.mrr || val.revenue || 0);
    }
  }

  for (const key of months) {
    const [y, m] = key.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);

    const histData = financials.monthly_data?.[key];

    const activeThisMonth = histData?.is_historical
      ? customerDates.filter(cd => cd.join <= monthEnd && (!cd.churn || cd.churn > monthEnd))
      : customerDates.filter(cd => cd.join <= monthEnd && (!cd.churn || cd.churn > monthEnd));

    if (histData?.is_historical) {
      // Use authoritative data from the Excel report for historical months
      monthlyMap[key].activeMembers = histData.active_members || 0;
      monthlyMap[key].newSignups = histData.new_signups || 0;
      monthlyMap[key].cancellations = histData.churned || 0;
    } else {
      monthlyMap[key].activeMembers = activeThisMonth.length;

      monthlyMap[key].newSignups = customerDates.filter(cd =>
        cd.join >= monthStart && cd.join <= monthEnd
      ).length;

      monthlyMap[key].cancellations = customerDates.filter(cd =>
        cd.churn && cd.churn >= monthStart && cd.churn <= monthEnd
      ).length;
    }

    const activeAtStart = customerDates.filter(cd => cd.join < monthStart && (!cd.churn || cd.churn >= monthStart)).length;
    monthlyMap[key].cancellationRate = activeAtStart > 0 ? (monthlyMap[key].cancellations / activeAtStart) * 100 : 0;

    const byType = { monthly: 0, annual: 0, untagged: 0 };
    for (const cd of activeThisMonth) {
      byType[cd.plan] = (byType[cd.plan] || 0) + 1;
    }
    monthlyMap[key].mrrMonthly = Math.round(byType.monthly * PLAN_PRICES.monthly);
    monthlyMap[key].mrrAnnual = Math.round(byType.annual * PLAN_PRICES.annual);
    monthlyMap[key].mrrUntagged = Math.round(byType.untagged * PLAN_PRICES.untagged);
  }

  return months.map(key => ({
    key,
    month: monthLabel(key),
    ...monthlyMap[key],
    netCashFlow: monthlyMap[key].revenue - monthlyMap[key].refunds,
  }));
}