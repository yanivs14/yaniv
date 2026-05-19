import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronRight, Activity, Armchair, Target, Clock, Flame, RotateCcw, Dumbbell, Infinity, Sprout, Layers, Zap, Mountain } from "lucide-react";

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
    description:
      "Based on your answers, we recommend beginning with Kinetiqo's Foundation Track — a structured 21-day protocol designed to rebuild movement from the ground up. Daily 10-minute sessions, no equipment needed.",
    cta: "Begin your foundation",
  },
  pain_lower_back: {
    title: "The Lower Back Reset Protocol",
    description:
      "You need targeted decompression and hip mobility work before anything else. Kinetiqo's Lower Back Reset sequences address the root cause — not just the symptom. 12 minutes a day changes everything.",
    cta: "Start the Reset",
  },
  pain_all_over: {
    title: "The Full-Body Mobility Reboot",
    description:
      "Systemic stiffness requires a systemic solution. The Kinetiqo Mobility Reboot covers every major joint in a logical sequence — morning to evening. You'll feel the shift in week one.",
    cta: "Begin the Reboot",
  },
  goal_strength: {
    title: "Functional Strength Foundation",
    description:
      "Strength without mobility is just compensation. Kinetiqo's Strength Foundation track builds real, usable power on a stable base — no machines, no injury risk. Just you and control.",
    cta: "Build your foundation",
  },
  goal_decades: {
    title: "The Longevity Operating System",
    description:
      "You're thinking long-term — good. The Kinetiqo Longevity track covers joint health, nervous system regulation, and sustainable strength. The body you want at 70 starts with what you do today.",
    cta: "Start your OS",
  },
};

function getRecommendation(answers) {
  if (answers.pain === "Lower back & core") return recommendations.pain_lower_back;
  if (answers.pain === "All over — general stiffness") return recommendations.pain_all_over;
  if (answers.goal === "Build functional strength") return recommendations.goal_strength;
  if (answers.goal === "Stay capable for decades") return recommendations.goal_decades;
  return recommendations.default;
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function Quiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);

  const current = questions[step];
  const progress = ((step) / questions.length) * 100;

  const handleSelect = (label) => {
    const newAnswers = { ...answers, [current.id]: label };
    setAnswers(newAnswers);
    setDirection(1);

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep((s) => s + 1);
      } else {
        setDone(true);
      }
    }, 220);
  };

  const rec = getRecommendation(answers);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-xl bg-dark-surface border border-dark-border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-dark-bg/80 text-white-muted hover:text-off-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress bar */}
        {!done && (
          <div className="h-0.5 bg-dark-border">
            <motion.div
              className="h-full bg-orange-red"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}

        <div className="p-8 sm:p-10 min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {!done ? (
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="flex flex-col h-full"
              >
                {/* Step indicator */}
                <p className="font-body text-xs text-white-muted uppercase tracking-widest mb-6">
                  Question {step + 1} of {questions.length}
                </p>

                {/* Question */}
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-tight mb-8">
                  {current.question}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3 flex-1">
                  {current.options.map((opt, i) => (
                    <motion.button
                      key={opt.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.22 }}
                      onClick={() => handleSelect(opt.label)}
                      className="group flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border border-dark-border bg-dark-bg hover:border-orange-red hover:bg-orange-red/5 transition-all duration-200"
                    >
                      {(() => { const Icon = opt.Icon; return <Icon className="w-5 h-5 flex-shrink-0 text-orange-red" />; })()}
                      <span className="font-body text-sm text-off-white/80 group-hover:text-off-white transition-colors flex-1">
                        {opt.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white-dim group-hover:text-orange-red transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-start h-full"
              >
                <div className="inline-flex items-center gap-2 bg-orange-red/10 border border-orange-red/30 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
                  <span className="font-body text-xs text-orange-red uppercase tracking-widest">Your personalized recommendation</span>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-tight mb-5">
                  {rec.title}
                </h2>

                <p className="font-body text-sm text-white-muted leading-relaxed mb-8 flex-1">
                  {rec.description}
                </p>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <a
                    href="#pricing"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
                  >
                    {rec.cta} <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={onClose}
                    className="font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4"
                  >
                    Maybe later
                  </button>
                </div>

                <p className="mt-5 font-body text-xs text-white-dim text-center w-full">
                  Free · No equipment · Cancel anytime
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}