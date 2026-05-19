import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronRight, ArrowLeft, Activity, Armchair, Target, Clock, Flame, RotateCcw, Dumbbell, Infinity, Sprout, Layers, Zap, Mountain, User, Phone, Mail, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const questions = [
  {
    id: "pain",
    question: "Where do you feel the most tension or discomfort?",
    options: [
      { label: "Lower back", Icon: Activity },
      { label: "Neck & shoulders", Icon: Layers },
      { label: "Hips & knees", Icon: RotateCcw },
      { label: "All over — general stiffness", Icon: Zap },
    ],
  },
  {
    id: "lifestyle",
    question: "How much of your day do you spend sitting?",
    options: [
      { label: "Less than 4 hours", Icon: Flame },
      { label: "4–6 hours", Icon: Target },
      { label: "6–9 hours", Icon: Armchair },
      { label: "9+ hours", Icon: Clock },
    ],
  },
  {
    id: "goal",
    question: "What's your primary movement goal?",
    options: [
      { label: "Move without pain", Icon: Sprout },
      { label: "Regain lost flexibility", Icon: RotateCcw },
      { label: "Build functional strength", Icon: Dumbbell },
      { label: "Stay capable for decades", Icon: Infinity },
    ],
  },
  {
    id: "experience",
    question: "What's your current movement experience?",
    options: [
      { label: "Complete beginner", Icon: Sprout },
      { label: "Some experience", Icon: Flame },
      { label: "Active but not consistent", Icon: Zap },
      { label: "Experienced — want to go deeper", Icon: Mountain },
    ],
  },
];

const recommendations = {
  default: {
    title: "Start with the Foundation Track",
    description: "Based on your answers, we recommend beginning with Kinetiqo's Foundation Track — a structured 21-day protocol designed to rebuild movement from the ground up. Daily 10-minute sessions, no equipment needed.",
    cta: "Begin your foundation",
  },
  pain_lower_back: {
    title: "The Lower Back Reset Protocol",
    description: "You need targeted decompression and hip mobility work before anything else. Kinetiqo's Lower Back Reset sequences address the root cause — not just the symptom. 12 minutes a day changes everything.",
    cta: "Start the Reset",
  },
  pain_all_over: {
    title: "The Full-Body Mobility Reboot",
    description: "Systemic stiffness requires a systemic solution. The Kinetiqo Mobility Reboot covers every major joint in a logical sequence — morning to evening. You'll feel the shift in week one.",
    cta: "Begin the Reboot",
  },
  goal_strength: {
    title: "Functional Strength Foundation",
    description: "Strength without mobility is just compensation. Kinetiqo's Strength Foundation track builds real, usable power on a stable base — no machines, no injury risk.",
    cta: "Build your foundation",
  },
  goal_decades: {
    title: "The Longevity Operating System",
    description: "You're thinking long-term — good. The Kinetiqo Longevity track covers joint health, nervous system regulation, and sustainable strength.",
    cta: "Start your OS",
  },
};

function getRecommendation(answers) {
  if (answers.pain === "Lower back") return recommendations.pain_lower_back;
  if (answers.pain === "All over — general stiffness") return recommendations.pain_all_over;
  if (answers.goal === "Build functional strength") return recommendations.goal_strength;
  if (answers.goal === "Stay capable for decades") return recommendations.goal_decades;
  return recommendations.default;
}

const slideVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Quiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState("quiz"); // quiz | form | success
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const current = questions[step];
  const progress = (step / questions.length) * 100;
  const rec = getRecommendation(answers);

  const handleSelect = (label) => {
    const newAnswers = { ...answers, [current.id]: label };
    setAnswers(newAnswers);
    setDirection(1);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        setPhase("form");
      }
    }, 220);
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setTimeout(() => setStep(s => s - 1), 0);
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await base44.functions.invoke("submitLead", {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      source: "quiz",
      quiz_recommendation: rec.title,
    });
    setSubmitting(false);
    setPhase("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-xl bg-dark-surface border border-dark-border rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Fixed header with close button */}
        <div className="flex items-center justify-end px-6 pt-5 pb-0 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-bg/80 text-white-muted hover:text-off-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {phase === "quiz" && (
          <div className="h-0.5 bg-dark-border shrink-0">
            <motion.div className="h-full bg-orange-red" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
          </div>
        )}

        <div className="p-6 sm:p-8 pt-4 flex flex-col overflow-y-auto flex-1">
          <AnimatePresence mode="wait" custom={direction}>

            {phase === "quiz" && (
              <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-body text-xs text-white-muted uppercase tracking-widest">
                    Question {step + 1} of {questions.length}
                  </p>
                  {step > 0 && (
                    <button onClick={handleBack} className="flex items-center gap-1.5 text-xs text-white-muted hover:text-orange-red transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-tight mb-8">
                  {current.question}
                </h2>
                <div className="grid grid-cols-1 gap-3 flex-1">
                  {current.options.map((opt, i) => {
                    const Icon = opt.Icon;
                    const selected = answers[current.id] === opt.label;
                    return (
                      <motion.button key={opt.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.22 }}
                        onClick={() => handleSelect(opt.label)}
                        className={`group flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${selected ? "border-orange-red bg-orange-red/10" : "border-dark-border bg-dark-bg hover:border-orange-red hover:bg-orange-red/5"}`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${selected ? "text-orange-red" : "text-white-muted group-hover:text-orange-red"} transition-colors`} />
                        <span className={`font-body text-sm flex-1 ${selected ? "text-off-white" : "text-off-white/80 group-hover:text-off-white"} transition-colors`}>
                          {opt.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${selected ? "text-orange-red" : "text-white-dim group-hover:text-orange-red"} transition-colors`} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { setPhase("quiz"); setStep(questions.length - 1); setDirection(-1); }}
                    className="flex items-center gap-1.5 text-xs text-white-muted hover:text-orange-red transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 bg-orange-red/10 border border-orange-red/30 rounded-full px-4 py-1.5 mb-4 w-fit">
                  <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
                  <span className="font-body text-xs text-orange-red uppercase tracking-widest">Your recommendation is ready</span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight leading-tight mb-2">{rec.title}</h2>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-6">{rec.description}</p>

                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-muted" />
                      <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name *" dir="ltr"
                        className={`w-full bg-dark-bg border ${errors.full_name ? "border-red-500" : "border-dark-border"} rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors`} />
                    </div>
                    {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-muted" />
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone *" type="tel" dir="ltr"
                        className={`w-full bg-dark-bg border ${errors.phone ? "border-red-500" : "border-dark-border"} rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors`} />
                    </div>
                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-muted" />
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" type="email" dir="ltr"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
                  </div>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-2">
                    {submitting ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit</>}
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 bg-orange-red/10 border border-orange-red/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-orange-red" />
                </div>
                <h2 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-3">Thank you!</h2>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-8">We've received your details and will be in touch shortly.</p>
                <a href="#pricing" onClick={onClose}
                  className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors">
                  {rec.cta} <ArrowRight className="w-4 h-4" />
                </a>
                <button onClick={onClose} className="mt-4 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4">
                  Maybe later
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}