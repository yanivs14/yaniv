import React, { useState, useEffect } from "react";
import GdprConsent from "./GdprConsent";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronRight, ArrowLeft, Activity, Armchair, Target, Clock, Flame, RotateCcw, Dumbbell, Infinity, Sprout, Layers, Zap, Mountain, Check, CheckCircle, Mail, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSiteContent } from "@/lib/SiteContentContext";

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
    description: "",
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

let _checkoutInProgress = false;
async function startCheckout(plan) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    const res = await base44.functions.invoke("createCheckout", { plan });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

const monthlyFeatures = [
  "The Movement full OS- daily adaptive practice",
  "All 240+ guided sessions with Roye",
  "Mobility, control, strength, longevity tracks",
  "Community access, content and challenges",
];

const annualFeatures = [
  "Save $181",
  "Everything in Monthly",
  "Exclusive member-only trainings and advanced content",
  "Priority access to new releases",
];

const plans = [
  {
    key: "annual",
    label: "Annual",
    price: (c) => c.annualMonthlyPrice,
    period: "/ month",
    secondaryPrice: (c) => `${c.annualPrice} / year billed annually`,
    discount: "Save 40%",
    badge: "Best value",
    subtitle: "Our annual members enjoy extra content and benefits.",
    features: annualFeatures,
    accentColor: true,
  },
  {
    key: "monthly",
    label: "Monthly",
    price: (c) => c.monthlyPrice,
    period: "/ month",
    secondaryPrice: null,
    discount: null,
    badge: null,
    features: monthlyFeatures,
    accentColor: false,
  },
];

function PricingPhase({ c, rec, checkoutLoading, handleCheckout, onBack }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div key="pricing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col">

      <div className="flex items-center mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white-muted hover:text-orange-red transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight leading-tight mb-6">Choose your plan</h2>

      {/* Plan rows */}
      <div className="space-y-3">
        {plans.map((plan) => {
          const isOpen = expanded === plan.key;
          return (
            <div key={plan.key} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${plan.accentColor ? "border-orange-red/60 bg-orange-red/5" : "border-dark-border bg-dark-bg"}`}>
              {/* Row */}
              <div className="px-4 pt-3.5 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-base font-bold uppercase tracking-tight text-off-white">{plan.label}</span>
                      {plan.badge && (
                        <span className="font-body text-[10px] font-semibold bg-orange-red text-dark-bg px-2 py-0.5 rounded-full">{plan.badge}</span>
                      )}
                      {plan.discount && (
                        <span className="font-body text-[10px] font-bold text-orange-red border border-orange-red/40 px-2 py-0.5 rounded-full">{plan.discount}</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`font-heading text-2xl font-bold ${plan.accentColor ? "text-orange-red" : "text-off-white"}`}>{plan.price(c)}</span>
                      <span className="font-body text-xs text-white-muted">{plan.period}</span>
                    </div>
                    {plan.secondaryPrice && (
                      <p className="font-body text-[11px] text-white-muted mt-0.5">{plan.secondaryPrice(c)}</p>
                    )}
                    {plan.accentColor && (
                      <p className="font-body text-xs font-semibold text-off-white mt-1 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-red"></span>
                        Weekly live coaching & feedback
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-shrink-0">
                    <button
                      onClick={() => handleCheckout(plan.key)}
                      disabled={checkoutLoading === plan.key}
                      className={`flex items-center justify-center gap-1.5 font-body text-xs font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-60 w-full sm:w-auto ${plan.accentColor ? "bg-orange-red text-dark-bg hover:bg-orange-red-hover" : "bg-off-white text-dark-bg hover:bg-off-white/90"}`}
                    >
                      {checkoutLoading === plan.key
                        ? <div className="w-3 h-3 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                        : <>{plan.key === "annual" ? "Transform Your Body Today" : "Start Moving Pain-Free"}</>
                      }
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : plan.key)}
                      className="font-body text-xs text-white-muted hover:text-orange-red transition-colors border border-dark-border hover:border-orange-red/50 px-3 py-1.5 rounded-full w-full sm:w-auto"
                    >
                      {isOpen ? "Hide" : "Compare"}
                    </button>
                  </div>
                </div>
                {plan.subtitle && (
                  <p className="font-body text-[11px] text-white-muted mt-1.5">{plan.subtitle}</p>
                )}
              </div>

              {/* Expandable features */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 pb-4 border-t ${plan.accentColor ? "border-orange-red/20" : "border-dark-border"}`}>
                      <ul className="mt-3 space-y-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.accentColor ? "text-orange-red" : "text-orange-red"}`} />
                            <span className="font-body text-xs text-off-white/80">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center font-body text-xs text-white-muted">No equipment · Cancel any time</p>
    </motion.div>
  );
}

export default function Quiz({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { content } = useSiteContent();
  const c = content.pricing;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState("quiz"); // quiz | email | pricing | success
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [gdpr, setGdpr] = useState(false);

  const handleCheckout = async (plan) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'begin_checkout', currency: 'USD', plan_type: plan });
    setCheckoutLoading(plan);
    await startCheckout(plan);
    setCheckoutLoading(null);
  };

  const current = questions[step] || questions[0];
  const progress = (step / questions.length) * 100;
  const rec = getRecommendation(answers);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setEmailError("Please enter your full name");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!gdpr) {
      setEmailError("Please accept the privacy policy to continue");
      return;
    }
    setEmailError("");
    setEmailLoading(true);
    try {
      // Get country from IP
      let country = "";
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        const geo = await geoRes.json();
        country = geo.country_name || geo.country || "";
      } catch (_) {}

      await base44.functions.invoke("submitLead", {
        full_name: fullName.trim(),
        phone: phone.trim() || "-",
        email: email.trim(),
        source: "quiz",
        quiz_section: "hero",
        quiz_recommendation: getRecommendation(answers).title,
        quiz_answers: answers,
        browser_language: navigator.language || "",
        country,
      });
    } catch (_) {}
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'post_quiz_lead_submitted', form_type: 'post_quiz' });
    setEmailLoading(false);
    setPhase("pricing");
  };

  const handleSelect = (label) => {
    const newAnswers = { ...answers, [current.id]: label };
    setAnswers(newAnswers);
    setDirection(1);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        setPhase("email");
      }
    }, 220);
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setTimeout(() => setStep(s => s - 1), 0);
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
                      <button key={`${step}-${opt.label}`}
                        onClick={() => handleSelect(opt.label)}
                        className={`group flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${selected ? "border-orange-red bg-orange-red/10" : "border-dark-border bg-dark-bg hover:border-orange-red hover:bg-orange-red/5"}`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${selected ? "text-orange-red" : "text-white-muted group-hover:text-orange-red"} transition-colors`} />
                        <span className={`font-body text-sm flex-1 ${selected ? "text-off-white" : "text-off-white/80 group-hover:text-off-white"} transition-colors`}>
                          {opt.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${selected ? "text-orange-red" : "text-white-dim group-hover:text-orange-red"} transition-colors`} />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "email" && (
              <motion.div key="email" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col">

                <p className="font-body text-xs text-orange-red uppercase tracking-widest text-center mb-2">Your results are ready</p>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-tight text-center mb-6">
                  Get Your Personalized Program
                </h2>

                <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full name *"
                    className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 font-body text-sm text-off-white placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
                  />

                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="Email *"
                      className={`w-full bg-dark-bg border rounded-2xl px-4 py-4 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${emailError ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-400 font-body -mt-1">{emailError}</p>}

                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 font-body text-sm text-off-white placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
                  />

                  {/* GDPR Consent */}
                  <div className="mt-1">
                    <GdprConsent id="quiz-gdpr" checked={gdpr} onChange={setGdpr} />
                  </div>

                  <button type="submit" disabled={emailLoading}
                    className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-1">
                    {emailLoading
                      ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                      : "Master Movement With Roye"}
                  </button>
                </form>

                <p className="mt-3 text-center font-body text-[10px] text-white-dim">No spam. Unsubscribe at any time.</p>
              </motion.div>
            )}

            {phase === "pricing" && (
              <PricingPhase
                c={c}
                rec={rec}
                checkoutLoading={checkoutLoading}
                handleCheckout={handleCheckout}
                onBack={() => setPhase("email")}
              />
            )}

            {phase === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 bg-orange-red/10 border border-orange-red/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-orange-red" />
                </div>
                <h2 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-3">Thank you!</h2>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-8">We've received your details and will be in touch shortly.</p>
                <button onClick={() => setPhase("pricing")}
                  className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors">
                  {rec.cta} <ArrowRight className="w-4 h-4" />
                </button>
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