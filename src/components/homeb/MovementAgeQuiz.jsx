import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";
import { useSiteContent } from "@/lib/SiteContentContext";

const DEFAULT_QUESTIONS = [
  { id: "age", type: "single", question: "Age", options: ["Under 18", "18–24", "25–34", "35–44", "45+"] },
  { id: "mobility_experience", type: "single", question: "Have you ever done mobility or stretching work before?", options: ["Never", "A little, on my own", "Yes, regularly", "I used to but stopped"] },
  { id: "main_goal", type: "single", question: "What's your main goal right now?", options: ["Move without pain", "Get stronger", "Increase my mobility", "Feel more energized day to day"] },
  { id: "other_goals", type: "multi", question: "What else do you hope to get from this? Pick as many as you want.", options: ["More energy", "Better sleep", "Less pain", "More confidence", "Better performance in sports", "Impressive skills (handstands, flags, etc.)"] },
  { id: "body_type", type: "single", question: "How would you describe your body right now?", options: ["Naturally lean", "Average build", "Carrying extra weight", "Not sure"] },
  { id: "long_term", type: "single", question: "What do you want long-term?", options: ["Stay mobile as I get older", "Avoid injuries", "Keep building strength for life", "Keep up with the things I love doing (sports, travel, family)"] },
  { id: "best_shape", type: "single", question: "How long ago were you in the best shape of your life?", options: ["I'm in it now", "Less than a year ago", "1–3 years ago", "3+ years ago", "Never really have been"] },
  { id: "squat", type: "single", question: "Can you squat down with your heels flat on the ground?", options: ["Yes, easily", "Yes, but it's tight", "No"] },
  { id: "workouts_last_month", type: "single", question: "How many times have you worked out in the last month?", options: ["0", "1–4", "5–8", "9+"] },
  { id: "train_frequency", type: "single", question: "Going forward, how often would you like to train?", options: ["1–2 days a week", "3–4 days a week", "5+ days a week", "Not sure yet"] },
  { id: "workout_time", type: "single", question: "How much time can you give each workout?", options: ["Less than 10 minutes", "10–15 minutes", "20–30 minutes", "30+ minutes"] },
  { id: "pain_issues", type: "multi", question: "Do you deal with any of these? Pick as many as apply.", options: ["Tight hips or hamstrings", "Lower back pain", "Knee pain", "Shoulder pain or stiffness", "None of these"] },
  { id: "energy_activity", type: "single", question: "How would you describe your day-to-day energy and activity?", options: ["Mostly sitting, low energy", "On my feet but often tired", "Active and feel good", "Very active, high energy"] },
  { id: "sleep", type: "single", question: "How much do you usually sleep?", options: ["Under 5 hours", "5–7 hours", "7–9 hours", "9+ hours"] },
  { id: "barriers", type: "multi", question: "What's made it hard to reach your goal before? Pick as many as apply.", options: ["No clear plan", "Motivation", "Time", "Work or family demands", "A big life change (move, breakup, finances, etc.)", "An injury", "None of these, I just haven't started"] },
];

// All existing embedded videos are preserved here.
const VIDEO_EMBEDS = {
  "Shoulder mobility / neck release drill": "https://www.loom.com/embed/f824fe0923244e99ad9c28c38b8e1a85",
  "Spinal mobility / hip-hinge decompression drill": "https://www.loom.com/embed/046154e7beb54434823fad2f05fb563c",
  "Hip opener / 90-90 style drill": "https://www.loom.com/embed/ca0b9f1d28be4eb8ac4948252a73d17f",
  "Knee-friendly controlled range drill (not deep loaded squats)": "https://www.loom.com/embed/1f21fbe4d15c48a8b0c5190ae49a7bbe",
  "Full-body flow / 'movement snack' video": "https://www.loom.com/embed/31d8dd5c444f49299e6988fe172a23c6",
};

// Q8 (squat) routing — maps each of the 3 squat answers to one of the existing embedded videos.
// Unassigned (kept in VIDEO_EMBEDS but not routed): "Shoulder mobility / neck release drill", "Full-body flow / 'movement snack' video".
const SQUAT_VIDEO_ROUTING = {
  "Yes, easily": "Knee-friendly controlled range drill (not deep loaded squats)",
  "Yes, but it's tight": "Hip opener / 90-90 style drill",
  "No": "Spinal mobility / hip-hinge decompression drill",
};

const DEFAULT_TEXT = {
  emailHeadline: "Your Fitness Age is ready",
  emailSubhead: "Enter your email to see your results + get your personalized plan.",
  emailCta: "Reveal My Results",
  introLine: "What's your real Movement Age?",
  explainer: "Fitness Age isn't your real age — it's how well your body is actually performing based on your squat, mobility, energy, and sleep. It goes up when your body is stiffer, weaker, or more worn down than it should be for your age, and it goes down as those things improve. The good news: unlike your real age, this number can go down.",
  squatLabel: "Your Squat Breakdown",
  planLabel: "Your Recommended Plan",
};

const MONTHLY_FEATURES = [
  "240+ guided sessions",
  "Programs for mobility, strength and longevity",
  "New sessions added regularly",
];

const ANNUAL_FEATURES = [
  "Weekly live community calls and Q&As with The Movement team",
  "Exclusive ongoing content and masterclasses",
];

const CALC_MESSAGES = [
  "Calculating your Fitness Age...",
  "Analyzing your movement patterns...",
  "Building your plan...",
];

const BARRIER_PHRASES = {
  "No clear plan": "not having a clear plan",
  "Motivation": "staying motivated",
  "Time": "finding the time",
  "Work or family demands": "juggling work and family",
  "A big life change (move, breakup, finances, etc.)": "a major life change",
  "An injury": "an old injury",
  "None of these, I just haven't started": "not having started yet",
};

const AGE_MIDPOINTS = [16, 21, 30, 40, 50];
const SQUAT_DELTAS = [-2, 1, 4]; // Yes easily, tight, No
const ENERGY_DELTAS = [3, 1, -1, -2];
const SLEEP_DELTAS = [2, 1, -1, 0];

function noneIndex(options) {
  return options.findIndex(o => o.startsWith("None of these"));
}

function getRealAge(ageIdx) {
  return AGE_MIDPOINTS[ageIdx] ?? 30;
}

function calculateFitnessAge(indices, questions) {
  const realAge = getRealAge(indices.age);
  const contributors = [];
  let delta = 0;

  // Q8 squat
  const squatIdx = indices.squat;
  const squatDelta = SQUAT_DELTAS[squatIdx] ?? 0;
  delta += squatDelta;
  if (squatDelta > 0) {
    const squatLabel = squatIdx === 1 ? "tightness in your squat" : "your squat pattern";
    contributors.push({ key: "squat", delta: squatDelta, label: squatLabel });
  }

  // Q12 pain (multi)
  const painQ = questions.find(q => q.id === "pain_issues");
  const painSelected = indices.pain_issues || [];
  const pNone = noneIndex(painQ.options);
  let painDelta = 0;
  if (painSelected.includes(pNone)) {
    painDelta = -1;
  } else {
    painDelta = Math.min(painSelected.length, 3);
  }
  delta += painDelta;
  if (painDelta > 0) contributors.push({ key: "pain", delta: painDelta, label: "pain or stiffness" });

  // Q13 energy
  const energyIdx = indices.energy_activity;
  const energyDelta = ENERGY_DELTAS[energyIdx] ?? 0;
  delta += energyDelta;
  if (energyDelta > 0) {
    const energyLabel = energyIdx === 0 ? "low daily activity" : "daily fatigue";
    contributors.push({ key: "energy", delta: energyDelta, label: energyLabel });
  }

  // Q14 sleep
  const sleepDelta = SLEEP_DELTAS[indices.sleep] ?? 0;
  delta += sleepDelta;
  if (sleepDelta > 0) contributors.push({ key: "sleep", delta: sleepDelta, label: "poor sleep" });

  // Q9 + Q10 training gap (0 workouts last month, wants 5+ days/week) — affects score, not shown in phrase
  if (indices.workouts_last_month === 0 && indices.train_frequency === 2) {
    delta += 1;
  }

  const clampedDelta = Math.max(-10, Math.min(10, delta));
  const fitnessAge = Math.max(18, realAge + clampedDelta);

  contributors.sort((a, b) => b.delta - a.delta);
  const topContributors = contributors.slice(0, 2);

  return { realAge, fitnessAge, topContributors };
}

function getLimiterPhrase(indices, questions) {
  const barriersQ = questions.find(q => q.id === "barriers");
  const selected = indices.barriers || [];
  const bNone = noneIndex(barriersQ.options);
  // Prefer the first selected non-"None of these" answer
  const first = selected.find(i => i !== bNone);
  const chosen = first !== undefined
    ? barriersQ.options[first]
    : (selected.length ? barriersQ.options[selected[0]] : "");
  return BARRIER_PHRASES[chosen] || "staying consistent";
}

function buildBehindText(items) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return "";
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (filtered.length === 1) return `${cap(filtered[0])} is exactly what your plan fixes first.`;
  const list = filtered.length === 2
    ? `${filtered[0]} and ${filtered[1]}`
    : `${filtered.slice(0, -1).join(", ")}, and ${filtered[filtered.length - 1]}`;
  return `${cap(list)} are exactly what your plan fixes first.`;
}

export default function MovementAgeQuiz({ open, onClose }) {
  const { content } = useSiteContent();
  const quizContent = content?.movementAgeQuiz;
  const questions = quizContent?.questions?.length ? quizContent.questions : DEFAULT_QUESTIONS;
  const text = { ...DEFAULT_TEXT, ...(quizContent || {}) };

  const totalSteps = questions.length;
  const [step, setStep] = useState(0); // 0..N-1 = questions, N = email, N+1 = results
  const [answers, setAnswers] = useState({}); // questionId → index (single) or array (multi)
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [monthlyExpanded, setMonthlyExpanded] = useState(false);
  const [annualExpanded, setAnnualExpanded] = useState(false);
  const [planChoice, setPlanChoice] = useState("annual");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcMsgIndex, setCalcMsgIndex] = useState(0);

  useEffect(() => {
    if (!calculating) return;
    setCalcMsgIndex(0);
    const interval = setInterval(() => {
      setCalcMsgIndex(i => (i + 1) % CALC_MESSAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [calculating]);

  const goToNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setStep(totalSteps); // email screen
    }
  };

  const handleSelect = (optionIndex) => {
    const q = questions[step];
    if (q.type === "multi") {
      handleMultiToggle(q, optionIndex);
      return;
    }
    setAnswers({ ...answers, [q.id]: optionIndex });
    setTimeout(goToNext, 300);
  };

  const handleMultiToggle = (q, optionIndex) => {
    const current = answers[q.id] || [];
    const nIdx = noneIndex(q.options);
    let next;
    if (optionIndex === nIdx) {
      next = current.includes(nIdx) ? [] : [nIdx];
    } else {
      const without = current.filter(i => i !== nIdx);
      next = without.includes(optionIndex)
        ? without.filter(i => i !== optionIndex)
        : [...without, optionIndex];
    }
    setAnswers({ ...answers, [q.id]: next });
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

    const indices = {};
    questions.forEach(q => { indices[q.id] = answers[q.id]; });

    const { realAge, fitnessAge, topContributors } = calculateFitnessAge(indices, questions);
    const limiter = getLimiterPhrase(indices, questions);
    const squatAnswer = questions.find(q => q.id === "squat").options[indices.squat] || "";
    const videoCategory = SQUAT_VIDEO_ROUTING[squatAnswer] || "";

    setSubmitting(true);
    setCalculating(true);

    setTimeout(() => {
      setCalculating(false);
      setResults({ realAge, fitnessAge, topContributors, limiter, videoCategory });
      track("quiz_completed", {
        fitness_age: fitnessAge,
        real_age: realAge,
        limiter,
        plan_choice: planChoice,
      });
      setStep(totalSteps + 1); // results screen

      // Save lead in the background (non-blocking)
      try {
        const quizAnswersText = {};
        questions.forEach(q => {
          const a = answers[q.id];
          if (Array.isArray(a)) {
            quizAnswersText[q.id] = a.map(i => q.options[i]);
          } else {
            quizAnswersText[q.id] = q.options[a];
          }
        });
        base44.functions.invoke("submitLead", {
          full_name: email.trim(),
          email: email.trim(),
          source: "movement_age_quiz",
          quiz_section: "footer_test",
          quiz_recommendation: planChoice,
          quiz_answers: quizAnswersText,
        });
      } catch {
        // non-critical — results already shown
      }
      setSubmitting(false);
    }, 3000);
  };

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app.");
      return;
    }
    setCheckoutLoading(true);
    try {
      track("quiz_checkout_click", { plan: planChoice, fitness_age: results?.fitnessAge });
      const res = await base44.functions.invoke("createCheckout", { plan: planChoice, ga_client_id: getGaClientId() });
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
    setMonthlyExpanded(false);
    setAnnualExpanded(false);
    setCalculating(false);
    setPlanChoice("annual");
    onClose();
  };

  const currentQ = questions[step];
  const currentSingleAnswer = currentQ && currentQ.type !== "multi" ? answers[currentQ.id] : null;
  const currentMultiAnswer = currentQ && currentQ.type === "multi" ? (answers[currentQ.id] || []) : [];
  const isQuestionStep = step < totalSteps;
  const isEmailStep = step === totalSteps;
  const isResultsStep = step === totalSteps + 1;

  const behindText = buildBehindText([
    ...(results?.topContributors || []).map(c => c.label),
    results?.limiter,
  ]);

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
              {calculating && (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto mb-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={calcMsgIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-heading text-lg font-bold text-off-white uppercase tracking-tight mb-6"
                    >
                      {CALC_MESSAGES[calcMsgIndex]}
                    </motion.p>
                  </AnimatePresence>
                  <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="h-full bg-orange-red rounded-full"
                    />
                  </div>
                </div>
              )}
              {!calculating && isQuestionStep && (
                <>
                  {step === 0 && (
                    <p className="font-body text-sm text-white-muted leading-relaxed mb-5 text-left">
                      {text.introLine}
                    </p>
                  )}
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
                    {currentQ.options.map((opt, oi) => {
                      const selected = currentQ.type === "multi"
                        ? currentMultiAnswer.includes(oi)
                        : currentSingleAnswer === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(oi)}
                          className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all flex items-center justify-between ${
                            selected
                              ? "border-orange-red bg-orange-red/10 text-off-white"
                              : "border-dark-border bg-dark-bg text-white-muted hover:border-orange-red/50 hover:text-off-white"
                          }`}
                        >
                          <span>{opt}</span>
                          {selected && <Check className="w-4 h-4 text-orange-red flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
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
                    {currentQ.type === "multi" && (
                      <button
                        onClick={goToNext}
                        className="flex items-center gap-1.5 bg-orange-red text-dark-bg font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}

              {!calculating && isEmailStep && (
                <div className="text-center">
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
                <div className="text-left">
                  {/* 1. Headline */}
                  <h3 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-1.5 leading-tight">
                    Your Movement Age: {results.fitnessAge}
                  </h3>
                  {/* 2. Sub-line */}
                  <p className="font-body text-sm text-white-muted mb-4">
                    Our prediction of your body's true physical age. Unlike your real age, this one can go down.
                  </p>

                  {/* 4. Gap line */}
                  <p className="font-body text-sm font-semibold text-off-white mb-5">
                    You're not where you should be yet. Here's how we get you there.
                  </p>

                  {/* 5. Behind Your Score */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mb-4">
                    <p className="font-body text-[11px] text-orange-red font-semibold uppercase tracking-widest mb-2">
                      Behind Your Score
                    </p>
                    <p className="font-body text-sm text-off-white leading-relaxed">
                      {behindText}
                    </p>
                  </div>

                  {/* 7. Video section */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mb-4">
                    <p className="font-body text-[11px] font-bold text-white-muted uppercase tracking-widest mb-2">
                      A Look Inside
                    </p>
                    <div className="aspect-video rounded-lg overflow-hidden bg-dark-surface-2">
                      <iframe
                        src="https://www.loom.com/embed/ebf4988d0b2048988bf5077dfa521244"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="font-body text-xs text-white-muted mt-3 leading-relaxed">
                      One real exercise from your program, this is what training with us actually looks like.
                    </p>
                  </div>

                  {/* 8. Benefit line */}
                  <p className="font-body text-sm text-white-muted leading-relaxed mb-5">
                    Thousands have already lowered their Movement Age doing exactly this. Now it's your turn.
                  </p>

                  {/* 9. Plan section */}
                  <div className="mb-4">
                    <p className="font-body text-[11px] text-orange-red font-semibold uppercase tracking-widest mb-3 text-center">
                      Your Plan
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Monthly card */}
                      <div
                        onClick={() => setPlanChoice("monthly")}
                        className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col ${
                          planChoice === "monthly"
                            ? "border-orange-red bg-orange-red/10"
                            : "border-dark-border bg-dark-bg hover:border-orange-red/50"
                        }`}
                      >
                        <p className="font-heading text-sm font-bold text-off-white uppercase mb-1.5">Monthly</p>
                        <p className="font-heading text-2xl font-bold text-off-white mb-1.5">$35<span className="text-sm text-white-muted font-body">/mo</span></p>
                        <p className="font-body text-[11px] text-white-muted mb-2.5">Full access, cancel anytime.</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMonthlyExpanded(!monthlyExpanded); }}
                          className="flex items-center justify-center gap-1.5 w-full mt-auto border border-dark-border bg-dark-surface-2 text-orange-red font-body text-[11px] font-semibold py-2 rounded-full hover:bg-orange-red/10 transition-colors"
                        >
                          What's included <ChevronDown className={`w-3.5 h-3.5 transition-transform ${monthlyExpanded ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {monthlyExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden space-y-1.5 mt-2.5"
                            >
                              {MONTHLY_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-orange-red flex-shrink-0 mt-0.5" />
                                  <span className="font-body text-[11px] text-off-white/90 leading-snug">{f}</span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Annual card */}
                      <div
                        onClick={() => setPlanChoice("annual")}
                        className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col ${
                          planChoice === "annual"
                            ? "border-orange-red bg-orange-red/10"
                            : "border-dark-border bg-dark-bg hover:border-orange-red/50"
                        }`}
                      >
                        <span className="absolute top-1.5 right-1.5 bg-orange-red text-dark-bg text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Save 20%</span>
                        <p className="font-heading text-sm font-bold text-off-white uppercase mb-1.5">Annual</p>
                        <p className="font-heading text-2xl font-bold text-off-white mb-1.5">$20<span className="text-sm text-white-muted font-body">/mo</span></p>
                        <p className="font-body text-[11px] text-white-dim mb-2.5">Billed $240/yr</p>
                        <p className="font-body text-[11px] text-white-muted mb-2.5">Everything in Monthly plus more. Best offer.</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAnnualExpanded(!annualExpanded); }}
                          className="flex items-center justify-center gap-1.5 w-full mt-auto border border-dark-border bg-dark-surface-2 text-orange-red font-body text-[11px] font-semibold py-2 rounded-full hover:bg-orange-red/10 transition-colors"
                        >
                          What's included <ChevronDown className={`w-3.5 h-3.5 transition-transform ${annualExpanded ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {annualExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden space-y-1.5 mt-2.5"
                            >
                              <li className="flex items-start gap-1.5">
                                <span className="font-body text-[11px] text-off-white/90 leading-snug font-semibold">Everything in Monthly, plus:</span>
                              </li>
                              {ANNUAL_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-orange-red flex-shrink-0 mt-0.5" />
                                  <span className="font-body text-[11px] text-off-white/90 leading-snug">{f}</span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="font-body text-xs text-white-muted text-center">Switch or cancel anytime.</p>
                  </div>

                  {/* 10. CTA button */}
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
                  >
                    {checkoutLoading ? "Loading..." : <>Start My Plan <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}