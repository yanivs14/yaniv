import { normalizeDate } from "@/components/admin/email/analytics/helpers";

export const INTERVALS = [
  { key: "daily", label: "DoD", fullLabel: "Day over Day" },
  { key: "weekly", label: "WoW", fullLabel: "Week over Week" },
  { key: "monthly", label: "MoM", fullLabel: "Month over Month" },
  { key: "yearly", label: "YoY", fullLabel: "Year over Year" },
];

export const PRODUCT_LABELS = {
  monthly: "Monthly Subs",
  annual: "Annual Subs",
  one_time: "One-Time Payments",
  inner_circle: "Inner Circle",
  handstand: "Handstand Course",
  other: "Other",
};

export const PRODUCT_COLORS = {
  monthly: "#0d9488",
  annual: "#f59e0b",
  one_time: "#6366f1",
  inner_circle: "#8b5cf6",
  handstand: "#ec4899",
  other: "#94a3b8",
};

function getPlanMonthlyMrr(contact) {
  const plan = (contact.purchase_plan || "").toLowerCase();
  const match = plan.match(/\$(\d+(?:\.\d+)?)/);
  const amount = match ? parseFloat(match[1]) : 0;
  if (plan.includes("year") || plan.includes("annual")) return amount / 12;
  if (plan.includes("month") || plan.includes("promo") || plan.includes("special") || plan.includes("returning")) return amount;
  return 0;
}

export function generatePeriods(dateFrom, dateTo, interval) {
  const periods = [];
  const start = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T23:59:59");
  if (interval === "daily") {
    const d = new Date(start);
    while (d <= end) {
      periods.push({ key: d.toISOString().slice(0, 10), start: new Date(d), end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59) });
      d.setDate(d.getDate() + 1);
    }
  } else if (interval === "weekly") {
    const d = new Date(start);
    const day = d.getDay();
    if (day !== 1) d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    while (d <= end) {
      const we = new Date(d);
      we.setDate(we.getDate() + 6);
      periods.push({ key: d.toISOString().slice(0, 10), start: new Date(d), end: new Date(we.getFullYear(), we.getMonth(), we.getDate(), 23, 59, 59) });
      d.setDate(d.getDate() + 7);
    }
  } else if (interval === "monthly") {
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      periods.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, start: new Date(d), end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    const d = new Date(start.getFullYear(), 0, 1);
    while (d <= end) {
      periods.push({ key: String(d.getFullYear()), start: new Date(d), end: new Date(d.getFullYear(), 11, 31, 23, 59, 59) });
      d.setFullYear(d.getFullYear() + 1);
    }
  }
  return periods;
}

export function formatPeriodLabel(key, interval) {
  if (interval === "daily" || interval === "weekly") {
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (interval === "monthly") {
    const [y, m] = key.split("-");
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return key;
}

export function aggregateRevenue(dailyData, monthlyData, periods, interval) {
  if (interval === "monthly" || interval === "yearly") {
    return periods.map(p => {
      let gross = 0, net = 0, refunds = 0, transactions = 0;
      for (const [mk, md] of Object.entries(monthlyData || {})) {
        const matches = interval === "monthly" ? mk === p.key : mk.startsWith(p.key);
        if (matches) {
          gross += md.gross || md.revenue || 0;
          net += md.revenue || 0;
          refunds += md.refunds || 0;
          transactions += md.transactions || 0;
        }
      }
      return { period: p.key, label: formatPeriodLabel(p.key, interval), gross, net, refunds, transactions };
    });
  }
  return periods.map(p => {
    let gross = 0, net = 0, refunds = 0, transactions = 0;
    for (const [dayKey, dd] of Object.entries(dailyData || {})) {
      const dayDate = new Date(dayKey + "T00:00:00");
      if (dayDate >= p.start && dayDate <= p.end) {
        gross += dd.gross || 0;
        net += dd.net || 0;
        refunds += dd.refunds || 0;
        transactions += dd.transactions || 0;
      }
    }
    return { period: p.key, label: formatPeriodLabel(p.key, interval), gross, net, refunds, transactions };
  });
}

export function computeUserMetrics(contacts, periods, interval) {
  const customerDates = contacts
    .map(c => ({ join: normalizeDate(c.first_payment_date), churn: normalizeDate(c.subscription_canceled) }))
    .filter(cd => cd.join);
  return periods.map(p => {
    const newSignups = customerDates.filter(cd => cd.join >= p.start && cd.join <= p.end).length;
    const churned = customerDates.filter(cd => cd.churn && cd.churn >= p.start && cd.churn <= p.end).length;
    const active = customerDates.filter(cd => cd.join <= p.end && (!cd.churn || cd.churn > p.end)).length;
    return { period: p.key, label: formatPeriodLabel(p.key, interval), new: newSignups, churned, active, net: newSignups - churned };
  });
}

export function computeMrrTrend(contacts, periods, interval) {
  const customerData = contacts
    .map(c => ({ join: normalizeDate(c.first_payment_date), churn: normalizeDate(c.subscription_canceled), mrr: getPlanMonthlyMrr(c) }))
    .filter(cd => cd.join && cd.mrr > 0);
  return periods.map(p => {
    const mrr = customerData.filter(cd => cd.join <= p.end && (!cd.churn || cd.churn > p.end)).reduce((sum, cd) => sum + cd.mrr, 0);
    return { period: p.key, label: formatPeriodLabel(p.key, interval), mrr: Math.round(mrr) };
  });
}

export function getComparisonRange(dateFrom, dateTo) {
  const start = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T23:59:59");
  const duration = end - start + 1;
  const compEnd = new Date(start - 1);
  const compStart = new Date(compEnd - duration + 1);
  return { from: compStart.toISOString().slice(0, 10), to: compEnd.toISOString().slice(0, 10) };
}

export function pctChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// ============ Subscription Plan Analytics ============

export const SUB_PLAN_CATEGORIES = {
  monthly: { label: "Monthly", short: "Monthly", color: "#0d9488" },
  annual: { label: "Annual / Yearly", short: "Annual", color: "#f59e0b" },
  one_time: { label: "One-Time", short: "One-Time", color: "#6366f1" },
  inner_circle: { label: "Inner Circle", short: "IC", color: "#8b5cf6" },
  handstand: { label: "Handstand", short: "Handstand", color: "#ec4899" },
  other: { label: "Other", short: "Other", color: "#94a3b8" },
};

export function categorizeSubscriptionPlan(planStr) {
  const lower = (planStr || "").toLowerCase();
  if (lower.includes("inner circle")) return "inner_circle";
  if (lower.includes("handstand")) return "handstand";
  if (lower.includes("year") || lower.includes("annual")) return "annual";
  if (lower.includes("month") || lower.includes("promo") || lower.includes("special") || lower.includes("returning") || lower.includes("movement")) return "monthly";
  if (lower.includes("one-time") || lower.includes("one_time")) return "one_time";
  return "other";
}

export function getPlanPrice(planStr) {
  const match = (planStr || "").match(/\$(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

export function isAnnualBilling(planStr) {
  const lower = (planStr || "").toLowerCase();
  return lower.includes("year") || lower.includes("annual");
}

export function computePlanUserTrend(contacts, periods, interval) {
  const planData = contacts
    .map(c => ({
      join: normalizeDate(c.first_payment_date),
      churn: normalizeDate(c.subscription_canceled),
      plan: categorizeSubscriptionPlan(c.purchase_plan),
    }))
    .filter(cd => cd.join);

  const cats = Object.keys(SUB_PLAN_CATEGORIES);

  return periods.map(p => {
    const result = { period: p.key, label: formatPeriodLabel(p.key, interval) };
    for (const cat of cats) {
      const inCat = planData.filter(cd => cd.plan === cat);
      result[`${cat}_active`] = inCat.filter(cd => cd.join <= p.end && (!cd.churn || cd.churn > p.end)).length;
      result[`${cat}_new`] = inCat.filter(cd => cd.join >= p.start && cd.join <= p.end).length;
      result[`${cat}_churned`] = inCat.filter(cd => cd.churn && cd.churn >= p.start && cd.churn <= p.end).length;
    }
    result.total_active = planData.filter(cd => cd.join <= p.end && (!cd.churn || cd.churn > p.end)).length;
    result.total_new = planData.filter(cd => cd.join >= p.start && cd.join <= p.end).length;
    result.total_churned = planData.filter(cd => cd.churn && cd.churn >= p.start && cd.churn <= p.end).length;
    return result;
  });
}

export function computePlanRevenueTrend(dailyData, productMonthly, periods, interval) {
  const cats = Object.keys(SUB_PLAN_CATEGORIES);

  return periods.map(p => {
    const result = { period: p.key, label: formatPeriodLabel(p.key, interval) };
    let total = 0;
    for (const cat of cats) {
      let rev = 0;
      if (interval === "monthly" || interval === "yearly") {
        const months = productMonthly?.[cat] || {};
        for (const [mk, md] of Object.entries(months)) {
          const matches = interval === "monthly" ? mk === p.key : mk.startsWith(p.key);
          if (matches) rev += md.net || 0;
        }
      } else {
        for (const [dayKey, dd] of Object.entries(dailyData || {})) {
          const dayDate = new Date(dayKey + "T00:00:00");
          if (dayDate >= p.start && dayDate <= p.end) {
            rev += dd.products?.[cat]?.net || 0;
          }
        }
      }
      result[`${cat}_revenue`] = Math.round(rev);
      total += rev;
    }
    result.total_revenue = Math.round(total);
    return result;
  });
}