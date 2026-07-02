import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Simple CSV parser handling quoted fields
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }
  return rows;
}

// Find a column value by possible name fragments
function findField(row, names) {
  for (const name of names) {
    for (const key of Object.keys(row)) {
      if (key.includes(name)) return row[key];
    }
  }
  return '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const fileUrl = body.file_url;
    if (!fileUrl) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Fetch the file content
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch file' }, { status: 500 });
    }
    const text = await res.text();

    // Parse CSV
    const rows = parseCSV(text);
    if (rows.length === 0) {
      return Response.json({ error: 'No data found in file' }, { status: 400 });
    }

    console.log(`Skool file: parsed ${rows.length} rows, columns: ${Object.keys(rows[0]).join(', ')}`);

    const skoolMap = {};
    const financials = {
      total_revenue: 0,
      monthly_data: {},
    };

    for (const row of rows) {
      const email = findField(row, ['email', 'mail', 'e-mail']).toLowerCase().trim();
      if (!email || !email.includes('@')) continue;

      const name = findField(row, ['name', 'member', 'full name']);
      const plan = findField(row, ['plan', 'subscription', 'tier', 'product']);
      const statusRaw = findField(row, ['status', 'active', 'state']).toLowerCase();
      const amountStr = findField(row, ['amount', 'paid', 'price', 'revenue', 'total', 'cost']);
      const dateStr = findField(row, ['date', 'joined', 'created', 'paid at', 'payment date', 'time']);

      const amount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
      const isChurned = statusRaw.includes('cancel') || statusRaw.includes('churn') || statusRaw.includes('inactive') || statusRaw.includes('left');
      const isActive = !isChurned && (statusRaw.includes('active') || statusRaw.includes('subscribed') || statusRaw === '' || statusRaw.includes('member'));

      let data = skoolMap[email];
      if (!data) {
        data = {
          skool_name: name,
          is_paying: false,
          is_churned: false,
          skool_plan: plan,
          skool_joined: null,
          skool_last_payment: null,
          skool_amount: 0,
        };
        skoolMap[email] = data;
      }

      data.skool_name = data.skool_name || name;
      data.skool_plan = data.skool_plan || plan;
      data.skool_amount += amount;
      financials.total_revenue += amount;

      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date)) {
          if (!data.skool_joined || date < new Date(data.skool_joined)) {
            data.skool_joined = date.toISOString();
          }
          if (!data.skool_last_payment || date > new Date(data.skool_last_payment)) {
            data.skool_last_payment = date.toISOString();
          }
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!financials.monthly_data[monthKey]) {
            financials.monthly_data[monthKey] = { revenue: 0, transactions: 0 };
          }
          financials.monthly_data[monthKey].revenue += amount;
          financials.monthly_data[monthKey].transactions += 1;
        }
      }

      if (isActive && !isChurned) {
        data.is_paying = true;
        data.is_churned = false;
      } else if (isChurned) {
        data.is_churned = true;
      }
    }

    const allContacts = Object.values(skoolMap);
    const stats = {
      total_members: allContacts.length,
      active_members: allContacts.filter(c => c.is_paying).length,
      churned_members: allContacts.filter(c => c.is_churned).length,
    };

    const sortedMonths = Object.entries(financials.monthly_data)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    financials.monthly_data = Object.fromEntries(sortedMonths);

    console.log(`Skool: ${stats.total_members} members, $${financials.total_revenue.toFixed(2)} revenue`);

    return Response.json({ skoolMap, financials, stats, rowCount: rows.length });
  } catch (error) {
    console.error("parseSkoolFile error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});