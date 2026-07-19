import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

let cachedPropertyId: string | null = null;

async function discoverPropertyId(accessToken: string): Promise<{ id: string; name: string }> {
  if (cachedPropertyId) return { id: cachedPropertyId, name: cachedPropertyId };
  const res = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 Admin API failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  const target = 'kinetiqo';
  let fallback: { id: string; name: string } | null = null;
  for (const account of data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      if (!prop.property) continue;
      const id = prop.property.replace('properties/', '');
      const name = prop.displayName || id;
      if (!fallback) fallback = { id, name };
      if (name.toLowerCase().includes(target)) {
        cachedPropertyId = id;
        return { id, name };
      }
    }
  }
  if (fallback) {
    cachedPropertyId = fallback.id;
    return fallback;
  }
  throw new Error('No GA4 properties found in this Google Analytics account');
}

async function runReport(accessToken: string, propertyId: string, body: object) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 Data API failed: ${res.status} ${err}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const { date_from, date_to } = await req.json().catch(() => ({}));

    const today = new Date().toISOString().slice(0, 10);
    const defaultFrom = new Date(Date.now() - 89 * 86400000).toISOString().slice(0, 10);
    const startDate = date_from || defaultFrom;
    const endDate = date_to || today;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");
    const { id: propertyId, name: propertyName } = await discoverPropertyId(accessToken);

    const dateRanges = [{ startDate, endDate }];

    // Run 3 reports in parallel: totals, by traffic source, by landing page
    const [totalsRes, sourceRes, pageRes] = await Promise.all([
      runReport(accessToken, propertyId, {
        dateRanges,
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
        ],
      }),
      runReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      }),
      runReport(accessToken, propertyId, {
        dateRanges,
        dimensions: [{ name: 'landingPagePlusQueryString' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 15,
      }),
    ]);

    // Parse totals
    const totalsRow = totalsRes.rows?.[0]?.metricValues || [];
    const totals = {
      sessions: parseInt(totalsRow[0]?.value || '0'),
      users: parseInt(totalsRow[1]?.value || '0'),
      new_users: parseInt(totalsRow[2]?.value || '0'),
      page_views: parseInt(totalsRow[3]?.value || '0'),
      conversions: parseInt(totalsRow[4]?.value || '0'),
      revenue: parseFloat(totalsRow[5]?.value || '0'),
    };

    // Parse by source
    const bySource = (sourceRes.rows || []).map((row: any) => ({
      source: row.dimensionValues[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0'),
      conversions: parseInt(row.metricValues[2]?.value || '0'),
      revenue: parseFloat(row.metricValues[3]?.value || '0'),
    }));

    // Parse by page
    const byPage = (pageRes.rows || []).map((row: any) => ({
      page: row.dimensionValues[0]?.value || '/',
      sessions: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0'),
      conversions: parseInt(row.metricValues[2]?.value || '0'),
    }));

    return Response.json({
      property_id: propertyId,
      property_name: propertyName,
      date_range: { start: startDate, end: endDate },
      totals,
      by_source: bySource,
      by_page: byPage,
    });
  } catch (error) {
    console.error('getAnalyticsConversion error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});