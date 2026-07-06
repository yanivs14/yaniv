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
    if (monthlyMap[key]) monthlyMap[key].mrr = Math.round(val.revenue || 0);
  }

  for (const key of months) {
    const [y, m] = key.split("-").map(Number);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);
    monthlyMap[key].activeMembers = customerDates.filter(cd => cd.join <= monthEnd && (!cd.churn || cd.churn > monthEnd)).length;
  }

  return months.map(key => ({ key, month: monthLabel(key), mrr: monthlyMap[key].mrr, activeMembers: monthlyMap[key].activeMembers }));
}