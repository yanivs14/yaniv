import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";
import { useSiteContent } from "@/lib/SiteContentContext";

const DEFAULT_QUESTIONS = [
  { id: "age", question: "What's your age?", options: ["18–24", "25–34", "35–44", "45–54", "55+"] },
  { id: "lifestyle", question: "What does a typical day look like?", options: ["Mostly sitting (desk/computer)", "Mix of sitting and moving", "On my feet most of the day"] },
  { id: "problem", question: "Where do you feel the most tightness or restriction?", options: ["Neck & Shoulders", "Lower Back", "Hips", "Knees", "All Over / General Stiffness"] },
  { id: "pain", question: "Do you feel pain or discomfort during normal daily movement (bending, reaching, sitting down)?", options: ["Regularly", "Occasionally", "Rarely or never"] },
  { id: "capability", question: "Can you squat all the way down, heels flat, without discomfort?", options: ["Yes, easily", "Yes, but it's tight", "No, can't get there"] },
  { id: "history", question: "How would you describe your relationship with movement right now?", options: ["Starting from near-zero", "Used to train but fell off", "Training but plateaued", "Consistent, want to go further"] },
  { id: "motivation", question: "What would change most for you if your body felt 10 years younger?", options: ["Less pain, more comfort", "More energy & confidence", "Strength & performance", "Want to build an impressive skill (handstand, flags, etc.)"] },
  { id: "commitment", question: "How much time can you give this daily?", options: ["10 min", "15–20 min", "20+ min, I'm serious about this"] },
];

// Index-based scoring (option position → delta added to Q1 midpoint)
const AGE_MIDPOINTS = [21, 30, 40, 50, 57];
const SCORING = {
  lifestyle: [4, 1, -2],
  problem: [2, 2, 2, 2, 3],
  pain: [5, 2, 0],
  capability: [-2, 2, 4],
  history: [4, 3, 1, -3],
};

const DEFAULT_VIDEO_ROUTING = [
  "Shoulder mobility / neck release drill",
  "Spinal mobility / hip-hinge decompression drill",
  "Hip opener / 90-90 style drill",
  "Knee-friendly controlled range drill (not deep loaded squats)",
  "Full-body flow / 'movement snack' video",
];

const DEFAULT_TEXT = {
  emailHeadline: "Your Movement Age is ready 👀",
  emailSubhead: "Enter your email to see your results + get your personalized plan.",
  emailCta: "Reveal My Results",
  resultsLabel: "Your Movement Age",
  limiterLabel: "Your biggest limiter",
  videoLabel: "Free Drill For You",
  planLabel: "Recommended Plan",
  confirmationText: "We've also sent your full breakdown + a free guide on {limiter} to your inbox.",
  doneButton: "Done",
};

const ANNUAL_FEATURES = [
  "240+ guided sessions in the full training library",
  "Programs for mobility, strength, and longevity",
  "New sessions and challenges added regularly",
  "Weekly live community calls & Q&As with The Movement team",
  "Exclusive ongoing content & masterclasses",
];

function getPlanRouting(indices) {
  const hist = indices.history;
  const motiv = indices.motivation;
  const commit = indices.commitment;

  if (hist === 3 && commit === 2) return { plan: "Inner Circle", handstandUpsell: false };
  if (motiv === 3 && (hist === 2 || hist === 3)) return { plan: "Annual", handstandUpsell: true };
  return { plan: "Annual", handstandUpsell: false };
}

function calculateMovementAge(indices) {
  const base = AGE_MIDPOINTS[indices.age] ?? 35;
  const delta =
    (SCORING.lifestyle[indices.lifestyle] || 0) +
    (SCORING.problem[indices.problem] || 0) +
    (SCORING.pain[indices.pain] || 0) +
    (SCORING.capability[indices.capability] || 0) +
    (SCORING.history[indices.history] || 0);
  return Math.max(18, base + delta);
}

export default function MovementAgeQuiz({ open, onClose }) {
  const { content } = useSiteContent();
  const quizContent = content?.movementAgeQuiz;
  const questions = quizContent?.questions?.length ? quizContent.questions : DEFAULT_QUESTIONS;
  const videoRouting = quizContent?.videoRouting?.length ? quizContent.videoRouting : DEFAULT_VIDEO_ROUTING;
  const text = { ...DEFAULT_TEXT, ...(quizContent || {}) };

  const totalSteps = questions.length;
  const [step, setStep] = useState(0); // 0..N-1 = questions, N = email, N+1 = results
  const [answers, setAnswers] = useState({}); // questionId → option index
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const goToNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setStep(totalSteps); // email screen
    }
  };

  const handleSelect = (optionIndex) => {
    const q = questions[step];
    setAnswers({ ...answers, [q.id]: optionIndex });
    // Auto-advance after a brief delay so the selection is visible
    setTimeout(goToNext, 300);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    // Build index map and calculate results FIRST (so results always show)
    const indices = {};
    questions.forEach(q => { indices[q.id] = answers[q.id]; });
    const problemIdx = indices.problem ?? 0;
    const movementAge = calculateMovementAge(indices);
    const { plan, handstandUpsell } = getPlanRouting(indices);
    const limiterText = questions[2].options[problemIdx] || "";
    const videoCategory = videoRouting[problemIdx] || "";
    const confirmation = (text.confirmationText || "").replace("{limiter}", limiterText);
    const motivationText = questions.find(q => q.id === "motivation")?.options[indices.motivation] || "";

    setResults({ movementAge, plan, handstandUpsell, videoCategory, limiter: limiterText, confirmation, motivation: motivationText });
    track("quiz_completed", {
      movement_age: movementAge,
      recommended_plan: plan,
      handstand_upsell: handstandUpsell,
      problem_area: limiterText,
    });
    setStep(totalSteps + 1); // results screen

    // Save lead in the background (non-blocking)
    setSubmitting(true);
    try {
      const quizAnswersText = {};
      questions.forEach(q => {
        quizAnswersText[q.id] = q.options[answers[q.id]];
      });
      await base44.functions.invoke("submitLead", {
        full_name: email.trim(),
        email: email.trim(),
        source: "movement_age_quiz",
        quiz_section: "footer_test",
        quiz_recommendation: plan,
        quiz_answers: quizAnswersText,
      });
    } catch {
      // non-critical — results already shown
    }
    setSubmitting(false);
  };

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app.");
      return;
    }
    setCheckoutLoading(true);
    try {
      track("quiz_checkout_click", { plan: "annual", movement_age: results?.movementAge });
      const res = await base44.functions.invoke("createCheckout", { plan: "annual", ga_client_id: getGaClientId() });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      // non-critical
    }
    setCheckoutLoading(false);
  };

  const handleClose = () => {
    setStep(0);
    setAnswers({});
    setEmail("");
    setEmailError("");
    setResults(null);
    onClose();
  };

  const currentQ = questions[step];
  const currentAnswerIndex = currentQ ? answers[currentQ.id] : null;
  const isQuestionStep = step < totalSteps;
  const isEmailStep = step === totalSteps;
  const isResultsStep = step === totalSteps + 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-white-dim hover:text-off-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 lg:p-8">
              {isQuestionStep && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-body text-[11px] text-orange-red font-bold uppercase tracking-widest">
                      Question {step + 1} / {totalSteps}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-dark-bg rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-orange-red rounded-full transition-all duration-300"
                      style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-6 leading-tight">
                    {currentQ.question}
                  </h3>
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => handleSelect(oi)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all flex items-center justify-between ${
                          currentAnswerIndex === oi
                            ? "border-orange-red bg-orange-red/10 text-off-white"
                            : "border-dark-border bg-dark-bg text-white-muted hover:border-orange-red/50 hover:text-off-white"
                        }`}
                      >
                        <span>{opt}</span>
                        {currentAnswerIndex === oi && <Check className="w-4 h-4 text-orange-red flex-shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-6 gap-3">
                    {step > 0 ? (
                      <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-white-dim hover:text-off-white font-body text-sm transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                </>
              )}

              {isEmailStep && (
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl">👀</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3 leading-tight">
                    {text.emailHeadline}
                  </h3>
                  <p className="font-body text-sm text-white-muted mb-6">
                    {text.emailSubhead}
                  </p>
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="your@email.com"
                      className="w-full bg-dark-bg border border-dark-border rounded-full px-5 py-3 font-body text-sm text-off-white placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
                    />
                    {emailError && <p className="text-xs text-red-400 font-body">{emailError}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Calculating..." : <>{text.emailCta} <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              )}

              {isResultsStep && results && (
                <div className="text-center">
                  <p className="font-body text-[11px] text-orange-red font-bold uppercase tracking-widest mb-2">
                    {text.resultsLabel}
                  </p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="font-heading text-7xl font-bold text-off-white">{results.movementAge}</span>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 mb-5">
                    <p className="font-body text-xs text-white-dim uppercase tracking-wide mb-1">{text.limiterLabel}</p>
                    <p className="font-heading text-lg font-bold text-orange-red uppercase">{results.limiter}</p>
                  </div>

                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mb-5 text-left">
                    <p className="font-body text-[11px] font-bold text-white-muted uppercase tracking-widest mb-2">
                      {text.videoLabel}
                    </p>
                    <p className="font-body text-sm text-off-white leading-relaxed">{results.videoCategory}</p>
                    <div className="mt-3 aspect-video bg-dark-surface-2 rounded-lg flex items-center justify-center">
                      <span className="font-body text-xs text-white-dim">Video embed area</span>
                    </div>
                  </div>

                  <div className="bg-orange-red/10 border border-orange-red/30 rounded-xl p-4 mb-3 text-left">
                    {results.motivation && (
                      <>
                        <p className="font-body text-[11px] text-orange-red font-semibold uppercase tracking-widest mb-2">
                          Recommended for your goal
                        </p>
                        <h3 className="font-heading text-lg font-bold text-off-white leading-tight mb-3">
                          {results.motivation}
                        </h3>
                      </>
                    )}
                    <div className="border-t border-dark-border pt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-heading text-base font-bold text-off-white">Annual plan</p>
                        <p className="font-body text-xs text-white-dim">Billed yearly</p>
                      </div>
                      <p className="font-heading text-2xl font-bold text-orange-red">$20<span className="text-sm text-white-muted font-body">/mo</span></p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-4"
                    >
                      {checkoutLoading ? "Loading..." : <>Start my plan <ArrowRight className="w-4 h-4" /></>}
                    </button>
                    <button
                      onClick={() => setPlanExpanded(!planExpanded)}
                      className="flex items-center justify-center gap-1.5 w-full mt-3 border border-orange-red/40 bg-dark-bg/50 text-orange-red font-body text-xs font-semibold py-2.5 rounded-full hover:bg-orange-red/10 transition-colors"
                    >
                      {planExpanded ? "Hide details" : "What's included?"} <ChevronDown className={`w-4 h-4 transition-transform ${planExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {planExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden space-y-2 mt-3"
                        >
                          {ANNUAL_FEATURES.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                              <span className="font-body text-xs text-off-white/90 leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                    {results.handstandUpsell && (
                      <p className="font-body text-xs text-orange-red mt-3">+ Handstand Course upsell flagged</p>
                    )}
                  </div>

                  <p className="font-body text-xs text-white-muted leading-relaxed mb-4">
                    {results.confirmation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}