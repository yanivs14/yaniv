import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import * as XLSX from 'npm:xlsx@0.18.5';

const MONTH_MAP = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

function parseMonthLabel(label) {
  if (!label) return null;
  const str = String(label).trim();
  const match = str.match(/^(\w{3})-(\d{2})$/);
  if (!match) return null;
  const [, mon, yr] = match;
  const monthNum = MONTH_MAP[mon];
  if (!monthNum) return null;
  return `20${yr}-${monthNum}`;
}

function normalizeHeader(h) {
  return String(h || '').replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function findColIndex(headers, patterns) {
  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeader(headers[i]);
    for (const p of patterns) {
      if (h.includes(p)) return i;
    }
  }
  return -1;
}

function num(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch {}
    const fileName = body.file_name || 'Financial Report';

    // Load active report
    if (body.action === 'load') {
      const reports = await base44.asServiceRole.entities.FinancialReport.filter({ is_active: true });
      return Response.json({ report: reports[0] || null });
    }

    const fileUrl = body.file_url;
    if (!fileUrl) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Fetch the Excel file
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    // --- Parse "Business Overview (All)" sheet ---
    const overviewSheetName = workbook.SheetNames.find(n => n.includes('Business Overview'));
    if (!overviewSheetName) {
      return Response.json({ error: 'Sheet "Business Overview" not found. Available: ' + workbook.SheetNames.join(', ') }, { status: 400 });
    }

    const overviewSheet = workbook.Sheets[overviewSheetName];
    const overviewRows = XLSX.utils.sheet_to_json(overviewSheet, { header: 1, raw: true });

    if (overviewRows.length < 2) {
      return Response.json({ error: 'No data rows in Business Overview' }, { status: 400 });
    }

    const headers = overviewRows[0];

    const colMonth = findColIndex(headers, ['month']);
    const colNewUsers = findColIndex(headers, ['new users joined']);
    const colCumulative = findColIndex(headers, ['cumulative total']);
    const colActive = findColIndex(headers, ['active (skl']);
    const colChurn = findColIndex(headers, ['churn (skl']);
    const colBanned = findColIndex(headers, ['banned (skl']);
    const colCancel = findColIndex(headers, ['cancel (skl']);
    const colMonthlySubs = findColIndex(headers, ['monthly subscription']);
    const colAnnualSubs = findColIndex(headers, ['annual subs']);
    const colTotalRevenue = findColIndex(headers, ['total revenue (skl']);
    const colActiveRevenue = findColIndex(headers, ['active users revenue']);
    const colChurnRevenue = findColIndex(headers, ['churn revenue']);
    const colMonthlyPlanRev = findColIndex(headers, ['monthly plan revenue']);
    const colAnnualPlanRev = findColIndex(headers, ['annual plan revenue']);
    const colArpuAll = findColIndex(headers, ['arpu per user']);
    const colArpuActive = findColIndex(headers, ['arpu active']);
    const colCumulativeRevenue = findColIndex(headers, ['cumulative revenue']);
    const colICRevenue = findColIndex(headers, ['ic revenue']);

    // --- Parse MRR sheet (COMBINED MRR or MRR Analysis) ---
    const mrrSheetName = workbook.SheetNames.find(n => n.includes('COMBINED MRR')) ||
                         workbook.SheetNames.find(n => n === 'MRR Analysis');
    let mrrMap = {};
    if (mrrSheetName) {
      const mrrSheet = workbook.Sheets[mrrSheetName];
      const mrrRows = XLSX.utils.sheet_to_json(mrrSheet, { header: 1, raw: true });
      if (mrrRows.length >= 2) {
        const mrrHeaders = mrrRows[0];
        const mrrMonthCol = findColIndex(mrrHeaders, ['month']);
        const mrrCol = findColIndex(mrrHeaders, ['mrr ($)']);
        const mrrMonthlyPlanRevCol = findColIndex(mrrHeaders, ['monthly plan rev']);
        const mrrAnnualPlanRevCol = findColIndex(mrrHeaders, ['annual plan rev']);
        const mrrMonthlySubCountCol = findColIndex(mrrHeaders, ['monthly sub count']);
        const mrrAnnualSubCountCol = findColIndex(mrrHeaders, ['annual sub count']);

        for (let i = 1; i < mrrRows.length; i++) {
          const row = mrrRows[i];
          const monthKey = parseMonthLabel(row[mrrMonthCol]);
          if (!monthKey) continue;
          mrrMap[monthKey] = {
            mrr: num(row[mrrCol]),
            monthly_plan_revenue: num(row[mrrMonthlyPlanRevCol]),
            annual_plan_revenue: num(row[mrrAnnualPlanRevCol]),
            monthly_sub_count: num(row[mrrMonthlySubCountCol]),
            annual_sub_count: num(row[mrrAnnualSubCountCol]),
          };
        }
      }
    }

    // --- Build monthly data ---
    const monthly = {};
    let successCount = 0;

    for (let i = 1; i < overviewRows.length; i++) {
      const row = overviewRows[i];
      const monthKey = parseMonthLabel(row[colMonth]);
      if (!monthKey) continue;

      const mrrData = mrrMap[monthKey] || {};

      monthly[monthKey] = {
        revenue: num(row[colTotalRevenue]),
        active_members: num(row[colActive]),
        new_signups: num(row[colNewUsers]),
        cumulative_total: num(row[colCumulative]),
        churned: num(row[colChurn]),
        banned: num(row[colBanned]),
        cancelled: num(row[colCancel]),
        monthly_subs: num(row[colMonthlySubs]),
        annual_subs: num(row[colAnnualSubs]),
        active_revenue: num(row[colActiveRevenue]),
        churn_revenue: num(row[colChurnRevenue]),
        monthly_plan_revenue: mrrData.monthly_plan_revenue || num(row[colMonthlyPlanRev]),
        annual_plan_revenue: mrrData.annual_plan_revenue || num(row[colAnnualPlanRev]),
        mrr: mrrData.mrr || 0,
        monthly_sub_count: mrrData.monthly_sub_count || num(row[colMonthlySubs]),
        annual_sub_count: mrrData.annual_sub_count || num(row[colAnnualSubs]),
        arpu_all: num(row[colArpuAll]),
        arpu_active: num(row[colArpuActive]),
        cumulative_revenue: num(row[colCumulativeRevenue]),
        ic_revenue: num(row[colICRevenue]),
      };
      successCount++;
    }

    if (successCount === 0) {
      return Response.json({ error: 'No valid month rows parsed' }, { status: 400 });
    }

    // --- Parse "Costs & Expenses (Past)" sheet for detailed line items ---
    const expensesSheetName = workbook.SheetNames.find(n => n.includes('Costs & Expenses (Past)') || n.includes('Costs & Expenses Past'));
    let expenses = { categories: {}, monthly: {}, line_items: [] };
    if (expensesSheetName) {
      const expSheet = workbook.Sheets[expensesSheetName];
      const expRows = XLSX.utils.sheet_to_json(expSheet, { header: 1, raw: true });
      if (expRows.length >= 2) {
        const expHeaders = expRows[0];
        // Find month columns (col 3 onward, until TOTAL)
        const monthCols = [];
        for (let c = 3; c < expHeaders.length; c++) {
          const mk = parseMonthLabel(expHeaders[c]);
          if (mk) monthCols.push({ col: c, monthKey: mk });
        }

        const USD_RATE = 0.727;

        for (let i = 1; i < expRows.length; i++) {
          const row = expRows[i];
          const rawCategory = String(row[0] || '').replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
          const tool = String(row[1] || '').replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
          // Skip subtotal / total rows — they double-count the category above
          if (/sub\s*-?\s*total|subtotal|^total$/i.test(rawCategory)) continue;
          if (!rawCategory && !tool) continue;

          const category = rawCategory;
          const lineItem = { category, tool, monthly: {}, total_usd: 0 };

          for (const { col, monthKey } of monthCols) {
            const cadVal = num(row[col]);
            const usdVal = Math.round(cadVal * USD_RATE * 100) / 100;
            if (usdVal !== 0) {
              lineItem.monthly[monthKey] = usdVal;
              lineItem.total_usd += usdVal;

              if (!expenses.categories[category]) {
                expenses.categories[category] = { total_usd: 0, monthly: {}, line_items: [] };
              }
              expenses.categories[category].total_usd += usdVal;
              expenses.categories[category].monthly[monthKey] = (expenses.categories[category].monthly[monthKey] || 0) + usdVal;

              if (!expenses.monthly[monthKey]) expenses.monthly[monthKey] = 0;
              expenses.monthly[monthKey] += usdVal;
            }
          }

          if (lineItem.total_usd > 0) {
            expenses.line_items.push(lineItem);
            if (expenses.categories[category]) {
              expenses.categories[category].line_items.push({ tool, total_usd: lineItem.total_usd });
            }
          }
        }
      }
      console.log(`Expenses: parsed ${expenses.line_items.length} line items across ${Object.keys(expenses.monthly).length} months`);
    }

    // --- Parse "Raw Balance STR" sheet for monthly Stripe fees ---
    const balanceSheetName = workbook.SheetNames.find(n => n.includes('Raw Balance STR') || n.includes('Raw Balance'));
    let stripeFees = {};
    if (balanceSheetName) {
      const balSheet = workbook.Sheets[balanceSheetName];
      const balRows = XLSX.utils.sheet_to_json(balSheet, { header: 1, raw: true });
      if (balRows.length >= 2) {
        const balHeaders = balRows[0];
        const balMonthCol = findColIndex(balHeaders, ['month']);
        const balFeesCol = findColIndex(balHeaders, ['stripe fees']);

        for (let i = 1; i < balRows.length; i++) {
          const row = balRows[i];
          const monthKey = parseMonthLabel(row[balMonthCol]);
          if (!monthKey) continue;
          stripeFees[monthKey] = Math.abs(num(row[balFeesCol]));
        }
      }
      console.log(`Stripe fees: parsed ${Object.keys(stripeFees).length} months`);
    }

    // --- Store in FinancialReport entity ---
    // Deactivate previous active reports
    const existing = await base44.asServiceRole.entities.FinancialReport.filter({ is_active: true });
    for (const rep of existing) {
      await base44.asServiceRole.entities.FinancialReport.update(rep.id, { is_active: false });
    }

    // Create new report
    const sortedKeys = Object.keys(monthly).sort();
    const report = await base44.asServiceRole.entities.FinancialReport.create({
      file_name: fileName,
      data: {
        monthly,
        expenses,
        stripe_fees: stripeFees,
        metadata: {
          months_count: successCount,
          start_month: sortedKeys[0],
          end_month: sortedKeys[sortedKeys.length - 1],
          expense_line_items: expenses.line_items.length,
          expense_months: Object.keys(expenses.monthly).length,
          stripe_fee_months: Object.keys(stripeFees).length,
        },
      },
      is_active: true,
    });

    return Response.json({
      success: true,
      report_id: report.id,
      months_parsed: successCount,
      start_month: sortedKeys[0],
      end_month: sortedKeys[sortedKeys.length - 1],
      expense_line_items: expenses.line_items.length,
      stripe_fee_months: Object.keys(stripeFees).length,
      sample: monthly[sortedKeys[0]],
    });
  } catch (error) {
    console.error("parseFinancialReport error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});