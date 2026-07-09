import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function HsPreLeadForm({ content }) {
  const c = content || {};
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setStatus("error");
      setErrorMsg("Name and email are required.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const browser_language = navigator.language || "";
      const utms = {};
      const urlParams = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => {
        const val = urlParams.get(k);
        if (val) utms[k] = val;
      });

      await base44.functions.invoke("submitLead", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: "hspre",
        quiz_section: "lead_form",
        browser_language,
        utms,
      });

      setStatus("success");
      setForm({ full_name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Lead form submission failed:", err);
      setStatus("error");
      setErrorMsg(err?.response?.data?.error || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[#00fff7]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#00fff7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-heading text-2xl font-bold uppercase text-white mb-2">You're In!</p>
        <p className="font-body text-sm text-white/60">Check your email for next steps.</p>
      </div>
    );
  }

  const inputClass = "w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-white font-body placeholder:text-white/30 focus:outline-none focus:border-[#00fff7] transition-colors";

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-white mb-2">
          {c.formHeading}
        </h3>
        <p className="font-body text-sm text-white/60">
          {c.formSubtext}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full Name *"
          className={inputClass}
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email *"
          className={inputClass}
        />
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone (optional)"
          className={inputClass}
        />
        {status === "error" && (
          <p className="text-sm text-red-400 font-body text-center">{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-[#00fff7] text-black font-heading font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#00ccc6] transition-colors text-base disabled:opacity-60"
        >
          {status === "loading" ? "Submitting..." : c.formButtonText}
        </button>
      </form>
    </div>
  );
}