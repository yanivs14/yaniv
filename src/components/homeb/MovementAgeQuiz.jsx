import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track } from "@/lib/analytics";

const QUESTIONS = [
  {
    id: "age",
    question: "What's your age?",
    options: ["18–24", "25–34", "35–44", "45–54", "55+"],
  },
  {
    id: "lifestyle",
    question: "What does a typical day look like?",
    options: [
      "Mostly sitting (desk/computer)",
      "Mix of sitting and moving",
      "On my feet most of the day",
    ],
  },
  {
    id: "problem",
    question: "Where do you feel the most tightness or restriction?",
    options: [
      "Neck & Shoulders",
      "Lower Back",
      "Hips",
      "Knees",
      "All Over / General Stiffness",
    ],
  },
  {
    id: "pain",
    question:
      "Do you feel pain or discomfort during normal daily movement (bending, reaching, sitting down)?",
    options: ["Regularly", "Occasionally", "Rarely or never"],
  },
  {
    id: "capability",
    question: "Can you squat all the way down, heels flat, without discomfort?",
    options: ["Yes, easily", "Yes, but it's tight", "No, can't get there"],
  },
  {
    id: "history",
    question: "How would you describe your relationship with movement right now?",
    options: [
      "Starting from near-zero",
      "Used to train but fell off",
      "Training but plateaued",
      "Consistent, want to go further",
    ],
  },
  {
    id: "motivation",
    question: "What would change most for you if your body felt 10 years younger?",
    options: [
      "Less pain, more comfort",
      "More energy & confidence",
      "Strength & performance",
      "Want to build an impressive skill (handstand, flags, etc.)",
    ],
  },
  {
    id: "commitment",
    question: "How much time can you give this daily?",
    options: ["10 min", "15–20 min", "20+ min, I'm serious about this"],
  },
];

const AGE_MIDPOINTS = { "18–24": 21, "25–34": 30, "35–44": 40, "45–54": 50, "55+": 57 };

const SCORING = {
  lifestyle: {
    "Mostly sitting (desk/computer)": 4,
    "Mix of sitting and moving": 1,
    "On my feet most of the day": -2,
  },
  problem: {
    "All Over / General Stiffness": 3,
    "Neck & Shoulders": 2,
    "Lower Back": 2,
    Hips: 2,
    Knees: 2,
  },
  pain: { Regularly: 5, Occasionally: 2, "Rarely or never": 0 },
  capability: { "No, can't get there": 4, "Yes, but it's tight": 2, "Yes, easily": -2 },
  history: {
    "Starting from near-zero": 4,
    "Used to train but fell off": 3,
    "Training but plateaued": 1,
    "Consistent, want to go further": -3,
  },
};

const VIDEO_ROUTING = {
  "Neck & Shoulders": "Shoulder mobility / neck release drill",
  "Lower Back": "Spinal mobility / hip-hinge decompression drill",
  Hips: "Hip opener / 90-90 style drill",
  Knees: "Knee-friendly controlled range drill (not deep loaded squats)",
  "All Over / General Stiffness": "Full-body flow / 'movement snack' video",
};

function getPlanRouting(answers) {
  const q6 = answers.history;
  const q7 = answers.motivation;
  const q8 = answers.commitment;

  if (q6 === "Consistent, want to go further" && q8 === "20+ min, I'm serious about this") {
    return { plan: "Inner Circle", handstandUpsell: false };
  }
  if (
    q7 === "Want to build an impressive skill (handstand, flags, etc.)" &&
    (q6 === "Training but plateaued" || q6 === "Consistent, want to go further")
  ) {
    return { plan: "Annual", handstandUpsell: true };
  }
  return { plan: "Annual", handstandUpsell: false };
}

function calculateMovementAge(answers) {
  const base = AGE_MIDPOINTS[answers.age] || 35;
  const delta =
    (SCORING.lifestyle[answers.lifestyle] || 0) +
    (SCORING.problem[answers.problem] || 0) +
    (SCORING.pain[answers.pain] || 0) +
    (SCORING.capability[answers.capability] || 0) +
    (SCORING.history[answers.history] || 0);
  return Math.max(18, base + delta);
}

export default function MovementAgeQuiz({ open, onClose }) {
  const [step, setStep] = useState(0); // 0..7 = questions, 8 = email, 9 = results
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const totalSteps = QUESTIONS.length;

  const handleSelect = (option) => {
    const q = QUESTIONS[step];
    setAnswers({ ...answers, [q.id]: option });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setStep(totalSteps); // go to email screen (step 8)
    }
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
    setSubmitting(true);
    try {
      const movementAge = calculateMovementAge(answers);
      const { plan, handstandUpsell } = getPlanRouting(answers);
      const videoCategory = VIDEO_ROUTING[answers.problem] || "";
      setResults({ movementAge, plan, handstandUpsell, videoCategory, limiter: answers.problem });

      track("quiz_completed", {
        movement_age: movementAge,
        recommended_plan: plan,
        handstand_upsell: handstandUpsell,
        problem_area: answers.problem,
      });

      await base44.functions.invoke("submitLead", {
        full_name: "",
        email: email.trim(),
        source: "movement_age_quiz",
        quiz_section: "footer_test",
        quiz_recommendation: plan,
        quiz_answers: answers,
      });
      setStep(totalSteps + 1); // results screen (step 9)
    } catch {
      setEmailError("Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    setStep(0);
    setAnswers({});
    setEmail("");
    setEmailError("");
    setResults(null);
    onClose();
  };

  const currentQ = QUESTIONS[step];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;
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
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all ${
                          currentAnswer === opt
                            ? "border-orange-red bg-orange-red/10 text-off-white"
                            : "border-dark-border bg-dark-bg text-white-muted hover:border-orange-red/50 hover:text-off-white"
                        }`}
                      >
                        {opt}
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
                    <button
                      onClick={handleNext}
                      disabled={!currentAnswer}
                      className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {isEmailStep && (
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl">👀</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3 leading-tight">
                    Your Movement Age is ready
                  </h3>
                  <p className="font-body text-sm text-white-muted mb-6">
                    Enter your email to see your results + get your personalized plan.
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
                      {submitting ? "Calculating..." : <>Reveal My Results <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              )}

              {isResultsStep && results && (
                <div className="text-center">
                  <p className="font-body text-[11px] text-orange-red font-bold uppercase tracking-widest mb-2">
                    Your Movement Age
                  </p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="font-heading text-7xl font-bold text-off-white">{results.movementAge}</span>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 mb-5">
                    <p className="font-body text-xs text-white-dim uppercase tracking-wide mb-1">Your biggest limiter</p>
                    <p className="font-heading text-lg font-bold text-orange-red uppercase">{results.limiter}</p>
                  </div>

                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mb-5 text-left">
                    <p className="font-body text-[11px] font-bold text-white-muted uppercase tracking-widest mb-2">
                      Free Drill For You
                    </p>
                    <p className="font-body text-sm text-off-white leading-relaxed">{results.videoCategory}</p>
                    <div className="mt-3 aspect-video bg-dark-surface-2 rounded-lg flex items-center justify-center">
                      <span className="font-body text-xs text-white-dim">Video embed area</span>
                    </div>
                  </div>

                  <div className="bg-orange-red/10 border border-orange-red/30 rounded-xl p-4 mb-4 text-left">
                    <p className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest mb-1">
                      Recommended Plan
                    </p>
                    <p className="font-heading text-xl font-bold text-off-white uppercase">{results.plan}</p>
                    {results.handstandUpsell && (
                      <p className="font-body text-xs text-orange-red mt-1">+ Handstand Course upsell flagged</p>
                    )}
                  </div>

                  <p className="font-body text-xs text-white-muted leading-relaxed mb-5">
                    We've also sent your full breakdown + a free guide on {results.limiter} to your inbox.
                  </p>

                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors"
                  >
                    Done
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