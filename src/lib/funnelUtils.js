import { normalizeDate } from "@/components/admin/email/analytics/helpers";
import { categorizeSubscriptionPlan } from "@/lib/trendUtils";

export function computePeriodRevenue(financials, start, end) {
  let revenue = 0;
  const monthsCoveredByDaily = new Set();

  for (const [dayKey, dd] of Object.entries(financials.daily_data || {})) {
    const dayDate = new Date(dayKey + "T00:00:00");
    if (dayDate >= start && dayDate <= end) {
      revenue += dd.net || 0;
      monthsCoveredByDaily.add(dayKey.slice(0, 7));
    }
  }

  for (const [mk, md] of Object.entries(financials.monthly_data || {})) {
    const [y, m] = mk.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);
    if (monthStart <= end && monthEnd >= start && !monthsCoveredByDaily.has(mk)) {
      revenue += md.revenue || 0;
    }
  }

  return Math.round(revenue);
}

export function computeFunnelStages(contacts, financials, dateFrom, dateTo, pageFilter, offeringFilter) {
  const start = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T23:59:59");

  let filtered = contacts;
  if (pageFilter && pageFilter !== "all") {
    filtered = filtered.filter(c => c.source === pageFilter);
  }

  const leads = filtered.filter(c => {
    const d = normalizeDate(c.created_date);
    return d && d >= start && d <= end;
  });

  const quiz = leads.filter(c =>
    c.source === "quiz" || (c.quiz_answers && Object.keys(c.quiz_answers).length > 0)
  );

  const meetings = filtered.filter(c => {
    if (!c.meeting_scheduled) return false;
    const md = normalizeDate(c.meeting_date || c.created_date);
    return md && md >= start && md <= end;
  });

  let purchased = filtered.filter(c => {
    const d = normalizeDate(c.first_payment_date);
    return d && d >= start && d <= end;
  });

  if (offeringFilter && offeringFilter !== "all") {
    purchased = purchased.filter(c => categorizeSubscriptionPlan(c.purchase_plan) === offeringFilter);
  }

  const revenue = computePeriodRevenue(financials, start, end);

  return [
    {
      key: "leads",
      label: "Leads",
      value: leads.length,
      source: "CRM — Lead entity (created_date)",
      description: "All form submissions in period",
    },
    {
      key: "quiz",
      label: "Quiz Completed",
      value: quiz.length,
      source: "Quiz form submissions (source = quiz)",
      description: "Leads who completed the quiz",
    },
    {
      key: "meetings",
      label: "Meetings Booked",
      value: meetings.length,
      source: "Calendly (meeting_scheduled = true)",
      description: "Leads who booked a call",
    },
    {
      key: "purchased",
      label: "Purchased",
      value: purchased.length,
      source: "Stripe (first_payment_date in range)",
      description: "Leads who became paying customers",
    },
    {
      key: "revenue",
      label: "Revenue",
      value: revenue,
      source: "Stripe charges (daily + monthly data)",
      description: "Total revenue in period",
      isMoney: true,
    },
  ];
}

export function computeFunnelByPage(contacts, financials, dateFrom, dateTo) {
  const pages = ["quiz", "inner_circle", "newsletter"];
  return pages.map(page => {
    const stages = computeFunnelStages(contacts, financials, dateFrom, dateTo, page, "all");
    return {
      page,
      label: page === "quiz" ? "Quiz" : page === "inner_circle" ? "Inner Circle" : "Newsletter",
      leads: stages[0].value,
      quiz: stages[1].value,
      meetings: stages[2].value,
      purchased: stages[3].value,
      revenue: stages[4].value,
      conversionRate: stages[0].value > 0 ? (stages[3].value / stages[0].value) * 100 : 0,
    };
  });
}

export function computeFunnelByOffering(contacts, financials, dateFrom, dateTo) {
  const start = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T23:59:59");

  const offerings = ["monthly", "annual", "one_time", "inner_circle", "handstand", "other"];
  const labels = {
    monthly: "Monthly",
    annual: "Annual / Yearly",
    one_time: "One-Time",
    inner_circle: "Inner Circle",
    handstand: "Handstand",
    other: "Other",
  };

  return offerings.map(cat => {
    const customers = contacts.filter(c => {
      if (!c.is_paying_customer) return false;
      const d = normalizeDate(c.first_payment_date);
      return d && d >= start && d <= end && categorizeSubscriptionPlan(c.purchase_plan) === cat;
    });

    const revenue = customers.reduce((sum, c) => sum + (c.total_paid || 0), 0);

    return {
      key: cat,
      label: labels[cat],
      customers: customers.length,
      revenue: Math.round(revenue),
      arpu: customers.length > 0 ? revenue / customers.length : 0,
    };
  }).filter(o => o.customers > 0);
}