import React, { useState, useRef } from "react";
import { Upload, FileText, DollarSign, Users, CheckCircle, X, RefreshCw, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function SkoolUpload({ onSkoolData }) {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setUploading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;
      setUploading(false);

      setParsing(true);
      const parseRes = await base44.functions.invoke("parseSkoolFile", { file_url: fileUrl });
      const data = parseRes.data;
      if (data.error) throw new Error(data.error);
      data.fileName = file.name;
      setResult(data);
      if (onSkoolData) onSkoolData(data);
    } catch (e) {
      setError(e.message || e?.response?.data?.error || "Failed to process file");
    }
    setParsing(false);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loading = uploading || parsing;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-body font-semibold text-slate-900">Skool Data Upload</p>
            <p className="text-[10px] text-slate-400">Upload a CSV export from Skool to merge revenue & members</p>
          </div>
        </div>
        {result && (
          <button onClick={handleReset} className="text-slate-400 hover:text-teal-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!result && !loading && (
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={e => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-body">Click to upload Skool CSV</p>
            <p className="text-[10px] text-slate-400 mt-1">Export from Skool → Members or Payments → CSV</p>
          </div>
        </label>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-5">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-body">
            {uploading ? "Uploading file…" : "Parsing Skool data…"}
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-600 font-body">{error}</p>
            <button onClick={handleReset} className="text-[10px] text-slate-500 hover:text-slate-900 mt-1 underline">Try again</button>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <p className="text-xs font-body">Loaded {result.stats.total_members} members from {fileName}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-emerald-600 font-body leading-none">{formatMoney(result.financials.total_revenue)}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Revenue</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <Users className="w-3.5 h-3.5 text-teal-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-teal-600 font-body leading-none">{result.stats.active_members}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Active</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <X className="w-3.5 h-3.5 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-red-500 font-body leading-none">{result.stats.churned_members}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Churned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}