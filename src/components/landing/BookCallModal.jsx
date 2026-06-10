import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DialCodePicker, COUNTRIES } from "./CountrySelect";

export default function BookCallModal({ open, onClose }) {
  const [step, setStep] = useState("form");
  const [schedulingUrl, setSchedulingUrl] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", dialCode: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleClose = () => {
    setStep("form");
    setSchedulingUrl(null);
    setForm({ full_name: "", email: "", phone: "", dialCode: "" });
    setErrors({});
    onClose();
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.dialCode) e.phone = "Please select a country code";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    return e;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const dialCode = COUNTRIES.find(c => c.code === form.dialCode)?.dial || "";
    const countryName = COUNTRIES.find(c => c.code === form.dialCode)?.name || "";
    try {
      const [, slotsRes] = await Promise.all([
        base44.functions.invoke("submitLead", {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: `${dialCode} ${form.phone.trim()}`,
          source: "inner_circle",
          quiz_recommendation: `Inner Circle Inquiry — ${countryName}`
        }),
        base44.functions.invoke("getCalendlySlots", {})
      ]);

      const eventTypes = slotsRes.data?.eventTypes || [];
      const url = eventTypes[0]?.scheduling_url || null;
      setSchedulingUrl(url);
      setStep("schedule");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    }
    setLoading(false);
  };

  const handleOpenCalendly = () => {
    if (!schedulingUrl) return;
    const params = new URLSearchParams({
      name: form.full_name.trim(),
      email: form.email.trim(),
    });
    window.open(`${schedulingUrl}?${params.toString()}`, "_blank");
    setStep("success");
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div className="mb-4">
      <label className="block font-body text-xs text-white-muted uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }}
        placeholder={placeholder}
        className={`w-full bg-dark-bg border rounded-xl px-4 py-3 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${errors[key] ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-400 font-body">{errors[key]}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-dark-bg border border-dark-border text-white-muted hover:text-off-white hover:border-orange-red transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STEP 1: Fill form */}
            {step === "form" && (
              <div className="p-7 sm:p-8">
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-2">Inner Circle</p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-1">
                  Book a Call
                </h2>
                <p className="font-body text-sm text-white-muted mb-6">
                  Please fill out your details and book a personal consultation.
                </p>

                <form onSubmit={handleFormSubmit} noValidate>
                  {field("full_name", "Full Name", "text", "John Doe")}
                  {field("email", "Email Address", "email", "john@example.com")}
                  <div className="mb-4">
                    <label className="block font-body text-xs text-white-muted uppercase tracking-widest mb-1.5">
                      Phone Number <span className="text-orange-red">*</span>
                    </label>
                    <div className={`flex items-center bg-dark-bg border rounded-xl overflow-hidden transition-colors ${errors.phone ? "border-red-500" : "border-dark-border focus-within:border-orange-red"}`}>
                      <DialCodePicker
                        value={form.dialCode}
                        onChange={code => { setForm(f => ({ ...f, dialCode: code })); setErrors(er => ({ ...er, phone: undefined })); }}
                        error={errors.phone}
                      />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: undefined })); }}
                        placeholder="123 456 7890"
                        className="flex-1 bg-transparent px-3 py-3 font-body text-sm text-off-white placeholder-white-dim focus:outline-none"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-400 font-body">{errors.phone}</p>}
                  </div>

                  {errors.submit && <p className="mb-3 text-sm text-red-400 font-body">{errors.submit}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Schedule on Calendly */}
            {step === "schedule" && (
              <div className="p-7 sm:p-8 text-center">
                <div className="w-16 h-16 bg-orange-red/15 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-orange-red" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2">
                  Thanks for your interest in Inner Circle!
                </h2>
                <p className="font-body text-sm text-white-muted mb-8">
                  Your details have been received, <span className="text-off-white font-semibold">{form.full_name}</span>.<br />
                  Now pick a time that works for you.
                </p>
                <button
                  onClick={handleOpenCalendly}
                  disabled={!schedulingUrl}
                  className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-50"
                >
                  Schedule a Call <ArrowRight className="w-4 h-4" />
                </button>
                {!schedulingUrl && (
                  <p className="mt-3 font-body text-xs text-white-muted">No Calendly slots available right now.</p>
                )}
              </div>
            )}

            {/* STEP 3: Success */}
            {step === "success" && (
              <div className="p-7 sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-orange-red/15 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle className="w-8 h-8 text-orange-red" />
                </motion.div>
                <h2 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2">
                  Details Received!
                </h2>
                <p className="font-body text-sm text-white-muted mb-3">
                  Thank you, <span className="text-off-white font-semibold">{form.full_name}</span>.
                </p>
                <p className="font-body text-sm text-white-muted mb-6">
                  Complete your booking in the Calendly tab that just opened. We'll see you on the call!
                </p>
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 bg-dark-bg border border-dark-border text-off-white font-body text-sm font-semibold px-6 py-3 rounded-full hover:border-orange-red transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}