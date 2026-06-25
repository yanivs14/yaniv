import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, Loader, Trash2 } from "lucide-react";

export default function Unsubscribe() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get("lead_id");
    const email = params.get("email");

    if (!leadId && !email) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const res = await base44.functions.invoke("deleteLeadEverywhere", {
          lead_id: leadId,
          email
        });
        setData(res.data);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#111] border border-[#222] rounded-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <Loader className="w-10 h-10 text-orange-red mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-heading font-bold text-off-white mb-2 uppercase tracking-wide">Removing from mailing list</h1>
            <p className="text-sm text-white-muted font-body">Please wait while we process your request.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-heading font-bold text-off-white mb-2 uppercase tracking-wide">Successfully Removed</h1>
            <p className="text-sm text-white-muted font-body mb-4">
              {data?.name || data?.email || "This contact"} has been removed from all mailing lists and integrations.
            </p>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 text-left">
              <p className="text-[10px] text-white-dim uppercase tracking-wide mb-2">Removed from:</p>
              <ul className="text-xs text-white-muted space-y-1.5 font-body">
                <li className="flex items-center gap-2">
                  <span className={data?.results?.lead ? "text-green-500" : "text-white-dim"}>{data?.results?.lead ? "✓" : "—"}</span>
                  Lead Database
                </li>
                <li className="flex items-center gap-2">
                  <span className={data?.results?.emailLogs ? "text-green-500" : "text-white-dim"}>{data?.results?.emailLogs ? "✓" : "—"}</span>
                  Email Hub
                </li>
                <li className="flex items-center gap-2">
                  <span className={data?.results?.newsletter ? "text-green-500" : "text-white-dim"}>{data?.results?.newsletter ? "✓" : "—"}</span>
                  Newsletter Subscribers
                </li>
                <li className="flex items-center gap-2">
                  <span className={data?.results?.kit ? "text-green-500" : "text-white-dim"}>{data?.results?.kit ? "✓" : "—"}</span>
                  Kit / ConvertKit
                </li>
                <li className="flex items-center gap-2">
                  <span className={data?.results?.hubspot ? "text-green-500" : "text-white-dim"}>{data?.results?.hubspot ? "✓" : "—"}</span>
                  HubSpot CRM
                </li>
              </ul>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-heading font-bold text-off-white mb-2 uppercase tracking-wide">Something went wrong</h1>
            <p className="text-sm text-white-muted font-body">We couldn't process your request. Please try again or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}