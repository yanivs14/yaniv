import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CalendlySlots from "@/components/landing/CalendlySlots";

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function BookCallModal({ open, onClose }) {
  // step: "slot" | "form" | "success"
  const [step, setStep] = useState("slot");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleClose = () => {
    setStep("slot");
    setSelectedSlot(null);
    setForm({ full_name: "", email: "", phone: "" });
    setErrors({});
    onClose();
  };

  const handleSlotSelected = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      setErrors({ slot: "Please select a time slot to continue." });
      return;
    }
    setErrors({});
    setStep("form");
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await base44.functions.invoke("submitLead", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: "inner_circle",
        quiz_recommendation: `Inner Circle Inquiry — ${formatDate(selectedSlot.start_time)} ${formatTime(selectedSlot.start_time)}`
      });
      setStep("success");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    }
    setLoading(false);
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

            {/* STEP 1: Pick slot */}
            {step === "slot" && (
              <div className="p-7 sm:p-8">
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-2">Inner Circle</p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-1">
                  Book a Call
                </h2>
                <p className="font-body text-sm text-white-muted mb-4">
                  Choose a time that works for you.
                </p>

                <CalendlySlots onSlotSelected={handleSlotSelected} />

                {selectedSlot && (
                  <div className="mt-4 p-3 rounded-xl border border-orange-red/40 bg-orange-red/5">
                    <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-0.5">Selected</p>
                    <p className="font-body text-sm text-off-white font-semibold">
                      {formatDate(selectedSlot.start_time)} · {formatTime(selectedSlot.start_time)}
                      {selectedSlot.duration && <span className="text-white-muted font-normal"> · {selectedSlot.duration}m</span>}
                    </p>
                  </div>
                )}

                {errors.slot && <p className="mt-3 text-xs text-red-400 font-body">{errors.slot}</p>}

                <button
                  onClick={handleContinue}
                  className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors mt-6 disabled:opacity-40"
                  disabled={!selectedSlot}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Fill form */}
            {step === "form" && (
              <div className="p-7 sm:p-8">
                <button
                  onClick={() => setStep("slot")}
                  className="flex items-center gap-1 font-body text-xs text-white-muted hover:text-off-white transition-colors mb-5"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>

                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-2">Inner Circle</p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-1">
                  Your Details
                </h2>

                {/* Selected slot summary */}
                <div className="mb-5 p-3 rounded-xl border border-dark-border bg-dark-bg">
                  <p className="font-body text-xs text-white-muted uppercase tracking-widest mb-0.5">Booking for</p>
                  <p className="font-body text-sm text-off-white font-semibold">
                    {formatDate(selectedSlot.start_time)} · {formatTime(selectedSlot.start_time)}
                    {selectedSlot.duration && <span className="text-white-muted font-normal"> · {selectedSlot.duration}m</span>}
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {field("full_name", "Full Name", "text", "John Doe")}
                  {field("email", "Email Address", "email", "john@example.com")}
                  {field("phone", "Phone Number", "tel", "+1 234 567 890")}

                  {errors.submit && <p className="mb-3 text-sm text-red-400 font-body">{errors.submit}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Request <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
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
                  Request Received!
                </h2>
                <p className="font-body text-sm text-white-muted mb-2">
                  Thank you, <span className="text-off-white font-semibold">{form.full_name}</span>.
                </p>
                <p className="font-body text-sm text-white-muted mb-6">
                  We'll confirm your slot for{" "}
                  <span className="text-off-white font-semibold">
                    {formatDate(selectedSlot.start_time)} at {formatTime(selectedSlot.start_time)}
                  </span>.
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