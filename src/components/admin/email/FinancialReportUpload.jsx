import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, Calendar, CheckCircle, RefreshCw, AlertCircle, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FinancialReportUpload({ onReportParsed }) {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadActiveReport();
  }, []);

  const loadActiveReport = async () => {
    try {
      const res = await base44.functions.invoke("parseFinancialReport", { action: "load" });
      if (res.data?.report) {
        setActiveReport(res.data.report);
      }
    } catch (e) {
      // "load" action might not be supported yet — silently ignore
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;
      setUploading(false);

      setParsing(true);
      const parseRes = await base44.functions.invoke("parseFinancialReport", {
        file_url: fileUrl,
        file_name: file.name,
      });
      const data = parseRes.data;
      if (data.error) throw new Error(data.error);
      setResult(data);
      setActiveReport({
        file_name: file.name,
        data: { metadata: { months_count: data.months_parsed, start_month: data.start_month, end_month: data.end_month } },
        created_date: new Date().toISOString(),
      });
      if (onReportParsed) onReportParsed(data);
    } catch (e) {
      setError(e.message || e?.response?.data?.error || "Failed to process file");
    }
    setParsing(false);
  };

  const loading = uploading || parsing;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body font-semibold text-slate-900">Historical Financial Report</p>
          <p className="text-[10px] text-slate-400">Excel with combined Skool+Stripe monthly data — backfills revenue & MRR history</p>
        </div>
      </div>

      {/* Active report status */}
      {activeReport && !loading && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mb-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body font-medium text-slate-900 truncate">{activeReport.file_name}</p>
            <p className="text-[10px] text-slate-500">
              {activeReport.data?.metadata?.months_count || 0} months · {activeReport.data?.metadata?.start_month} → {activeReport.data?.metadata?.end_month}
              <span className="text-emerald-600 ml-1">· Active</span>
            </p>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!loading && (
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={e => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors">
            <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <p className="text-[11px] text-slate-600 font-body">
              {activeReport ? "Upload new Excel to replace" : "Click to upload financial Excel"}
            </p>
          </div>
        </label>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-body">
            {uploading ? "Uploading file…" : "Parsing Excel data…"}
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5 mt-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-600 font-body">{error}</p>
        </div>
      )}

      {/* Success result */}
      {result && !loading && (
        <div className="flex items-center gap-1.5 text-emerald-600 mt-2">
          <CheckCircle className="w-3.5 h-3.5" />
          <p className="text-[11px] font-body">
            Parsed {result.months_parsed} months ({result.start_month} → {result.end_month})
          </p>
        </div>
      )}
    </div>
  );
}