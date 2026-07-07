export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ];
  const csv = '\uFEFF' + rows.join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename + '.csv');
}

export function exportXLSX(data, filename, sheetName = 'Data') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const headerRow = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${esc(h)}</Data></Cell>`).join('')}</Row>`;
  const dataRows = data.map(row =>
    `<Row>${headers.map(h => {
      const val = row[h];
      if (typeof val === 'number' && !isNaN(val)) return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
      return `<Cell><Data ss:Type="String">${esc(val)}</Data></Cell>`;
    }).join('')}</Row>`
  ).join('');

  const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="${esc(sheetName)}">\n<Table>${headerRow}${dataRows}</Table>\n</Worksheet>\n</Workbook>`;

  downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' }), filename + '.xls');
}

export function aggregateByInterval(monthlyData, interval) {
  if (interval === 'monthly' || !monthlyData.length) return monthlyData;

  const grouped = {};
  for (const row of monthlyData) {
    const key = row.key || row.month || '';
    const [year, month] = key.split('-').map(Number);
    if (!year) continue;
    let groupKey;
    if (interval === 'quarterly') {
      groupKey = `${year}-Q${Math.ceil((month || 1) / 3)}`;
    } else if (interval === 'annual') {
      groupKey = String(year);
    } else {
      groupKey = key;
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = { period: groupKey };
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'number') grouped[groupKey][k] = 0;
      }
    }
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'number') grouped[groupKey][k] += v;
    }
  }
  return Object.values(grouped).sort((a, b) => String(a.period).localeCompare(String(b.period)));
}