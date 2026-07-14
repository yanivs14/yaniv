import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track } from "@/lib/analytics";

const QUESTIONS = [
  {
    id: "q1",
    text: "Let's start with the basics. What's your age range?",
    scored: false,
    answers: [
      { label: "Under 25", value: "under_25" },
      { label: "25–34", value: "25_34" },
      { label: "35–44", value: "35_44" },
      { label: "45–54", value: "45_54" },
      { label: "55+", value: "55_plus" },
    ],
  },
  {
    id: "q2",
    text: "Get up off the floor right now if you can. What happened?",
    scored: true,
    answers: [
      { label: "I popped right up, no hands", value: "no_hands", points: 0 },
      { label: "I used one hand to help", value: "one_hand", points: 1 },
      { label: "I needed both hands, or pushed off something", value: "both_hands", points: 2 },
      { label: "I didn't try — getting up like that isn't easy for me anymore", value: "cant", points: 3 },
    ],
  },
  {
    id: "q3",
    text: "If your body could talk, what age would it say it is?",
    scored: true,
    answers: [
      { label: "Younger than my actual age", value: "younger", points: 0 },
      { label: "About the same", value: "same", points: 1 },
      { label: "A few years older", value: "few_older", points: 2 },
      { label: "Noticeably older — I feel it every day", value: "noticeably_older", points: 3 },
    ],
  },
  {
    id: "q4",
    text: "Where does your body hold the most tension or pain?",
    scored: false,
    answers: [
      { label: "Lower back", value: "lower_back" },
      { label: "Hips / knees", value: "hips_knees" },
      { label: "Neck / shoulders", value: "neck_shoulders" },
      { label: "All over — general stiffness", value: "all_over" },
      { label: "Honestly, nowhere major yet", value: "nowhere" },
    ],
  },
  {
    id: "q5",
    text: "The morning after a workout or an active day, how do you feel?",
    scored: true,
    answers: [
      { label: "Recovered and ready to go again", value: "recovered", points: 0 },
      { label: "A little sore, but fine", value: "little_sore", points: 1 },
      { label: "Wrecked for a day or two", value: "wrecked", points: 2 },
      { label: "I've started avoiding being that active because of it", value: "avoiding", points: 3 },
    ],
  },
  {
    id: "q6",
    text: "On a typical day, how many hours are you sitting?",
    scored: true,
    answers: [
      { label: "Less than 4 hours", value: "lt_4", points: 0 },
      { label: "4–6 hours", value: "4_6", points: 1 },
      { label: "7–9 hours", value: "7_9", points: 2 },
      { label: "10+ hours", value: "gt_10", points: 3 },
    ],
  },
  {
    id: "q7",
    text: "How often does structured movement (workouts, stretching, mobility work) actually happen right now?",
    scored: true,
    answers: [
      { label: "Daily", value: "daily", points: 0 },
      { label: "A few times a week", value: "few_week", points: 1 },
      { label: "Rarely — maybe once a week", value: "rarely", points: 2 },
      { label: "Basically never", value: "never", points: 3 },
    ],
  },
  {
    id: "q8",
    text: "What do you think is aging your body fastest?",
    scored: false,
    answers: [
      { label: "Sitting too much", value: "sitting" },
      { label: "Bad sleep", value: "sleep" },
      { label: "Stress", value: "stress" },
      { label: "Never moving the \u201Cright\u201D way — I don't know where to start", value: "dont_know" },
    ],
  },
  {
    id: "q9",
    text: "When you picture actually fixing this, what sounds right for you?",
    scored: false,
    answers: [
      { label: "A daily practice I follow on my own time", value: "own_time", route: "practice" },
      { label: "I want it to be a habit I stick to — accountability matters to me", value: "accountability", route: "practice_annual" },
      { label: "I want direct access and guidance from Roye himself", value: "direct_roye", route: "inner_circle" },
    ],
  },
];

const TIERS = {
  1: { name: "Ahead of the Curve", color: "#4ade80", badge: "YOUNGER" },
  2: { name: "Right on Pace", color: "#00fff7", badge: "ON PACE" },
  3: { name: "Moving Older", color: "#f5c542", badge: null },
  4: { name: "Aging Fast", color: "#ef4444", badge: null },
};

function calculateResult(answers) {
  const score = QUESTIONS
    .filter((q) => q.scored)
    .reduce((sum, q) => {
      const choice = q.answers.find((a) => a.value === answers[q.id]);
      return sum + (choice?.points ?? 0);
    }, 0);

  let tier = 1;
  let yearsOlder = 0;
  if (score <= 3) tier = 1;
  else if (score <= 7) tier = 2;
  else if (score <= 11) {
    tier = 3;
    yearsOlder = Math.max(2, Math.min(score - 3, 15));
  } else {
    tier = 4;
    yearsOlder = Math.max(2, Math.min(score - 3, 15));
  }

  const q9Choice = QUESTIONS[8].answers.find((a) => a.value === answers.q9);
  const route = q9Choice?.route || "practice";
  return { score, tier, yearsOlder, route };
}

function getLabel(questionId, value) {
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q?.answers.find((a) => a.value === value)?.label || "";
}

const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : "");

export default function BodyAgeQuiz({ onClose }) {
  const [phase, setPhase] = useState("questions");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [leadInfo, setLeadInfo] = useState({ full_name: "", email: "", phone: "" });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    track("body_age_quiz_started", { location: "final_cta" });
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAnswer = (question, value) => {
    if (selectedAnswer) return;
    setSelectedAnswer(value);
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setPhase("lead");
      }
    }, 350);
  };

  const goBack = () => {
    if (phase === "lead") {
      setPhase("questions");
      setCurrentQ(QUESTIONS.length - 1);
    } else if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadInfo.full_name.trim() || !leadInfo.email.trim()) return;

    setSubmitting(true);
    const calculated = calculateResult(answers);
    setResult(calculated);

    const tierName = TIERS[calculated.tier].name;
    const recommendation = calculated.yearsOlder > 0
      ? `${tierName} — ${calculated.yearsOlder} years older → ${calculated.route}`
      : `${tierName} → ${calculated.route}`;

    try {
      await base44.entities.Lead.create({
        full_name: leadInfo.full_name,
        email: leadInfo.email,
        phone: leadInfo.phone,
        source: "body_age_quiz",
        quiz_section: "finalCta",
        quiz_recommendation: recommendation,
        quiz_answers: answers,
        browser_language: navigator.language,
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
    }

    setSubmitting(false);
    setPhase("loading");

    setTimeout(() => {
      setPhase("result");
      track("body_age_quiz_completed", {
        tier: calculated.tier,
        route: calculated.route,
        years_older: calculated.yearsOlder,
      });
    }, 2500);
  };

  const handleCtaClick = () => {
    track("body_age_quiz_cta_clicked", { tier: result.tier, route: result.route });
    onClose();
    setTimeout(() => {
      const el = document.getElementById("pricing");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  const handleRetake = () => {
    setPhase("questions");
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setLeadInfo({ full_name: "", email: "", phone: "" });
  };

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg my-8 bg-dark-bg rounded-2xl border border-dark-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-dark-surface-2 text-white-muted hover:text-off-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {phase === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 pt-12"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white-dim font-body">
                    Question {currentQ + 1} of {QUESTIONS.length}
                  </span>
                  {currentQ > 0 && (
                    <button
                      onClick={goBack}
                      className="flex items-center gap-1 text-xs text-white-muted hover:text-off-white transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  )}
                </div>
                <div className="h-1 bg-dark-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-red"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-bold text-off-white mb-6 leading-tight">
                {question.text}
              </h3>

              <div className="space-y-2.5">
                {question.answers.map((answer) => (
                  <button
                    key={answer.value}
                    onClick={() => handleAnswer(question, answer.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedAnswer === answer.value
                        ? "border-orange-red bg-orange-red/10 text-off-white"
                        : "border-dark-border bg-dark-surface text-white-muted hover:border-orange-red/50 hover:text-off-white"
                    }`}
                  >
                    <span className="font-body text-sm">{answer.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "lead" && (
            <motion.div
              key="lead"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 pt-12"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-xs text-white-muted hover:text-off-white transition-colors mb-6"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>

              <h3 className="font-heading text-2xl font-bold text-off-white mb-2">Almost there.</h3>
              <p className="font-body text-sm text-white-muted mb-6">
                Enter your details to reveal your Body Age result.
              </p>

              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={leadInfo.full_name}
                  onChange={(e) => setLeadInfo({ ...leadInfo, full_name: e.target.value })}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={leadInfo.email}
                  onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={leadInfo.phone}
                  onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-xl hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-2"
                >
                  {submitting ? "Calculating..." : (
                    <>
                      See my Body Age <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 pt-16 pb-16 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-orange-red flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full bg-orange-red/30"
                />
              </motion.div>
              <p className="font-heading text-lg font-bold text-off-white uppercase tracking-widest">
                Calculating your Body Age...
              </p>
              <p className="font-body text-xs text-white-dim mt-2">Analyzing your movement patterns</p>
            </motion.div>
          )}

          {phase === "result" && result && (
            <ResultScreen
              result={result}
              answers={answers}
              onCta={handleCtaClick}
              onRetake={handleRetake}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ResultScreen({ result, answers, onCta, onRetake }) {
  const { tier, yearsOlder, route } = result;
  const tierConfig = TIERS[tier];
  const q4 = getLabel("q4", answers.q4);
  const q6 = getLabel("q6", answers.q6);
  const q8 = getLabel("q8", answers.q8);
  const q4Nowhere = q4 === "Honestly, nowhere major yet";

  const bigText = tier <= 2 ? tierConfig.badge : `+${yearsOlder} YRS`;

  const subheadline =
    tier === 1
      ? "Your body is moving younger than your age."
      : tier === 2
      ? "Your body is moving about the age it should."
      : tier === 3
      ? `Your body is moving ${yearsOlder} years older than you are.`
      : `Your body is moving ${yearsOlder} years older than you are — and it's accelerating.`;

  let ctaText, ctaSubtext, showPracticeFallback = false;

  if (route === "inner_circle") {
    showPracticeFallback = true;
    if (tier === 4) {
      ctaText = "Book your Inner Circle consultation";
      ctaSubtext = "Talk to Roye directly about closing this gap.";
    } else if (tier === 1) {
      ctaText = "Apply for Inner Circle";
      ctaSubtext =
        "You're already ahead. Inner Circle is where people like you go to keep leveling up with Roye directly.";
    } else {
      ctaText = "Apply for Inner Circle";
      ctaSubtext = "Get direct access and guidance from Roye himself.";
    }
  } else {
    if (tier === 4) {
      ctaText = "Get my plan";
      ctaSubtext = "Start The Movement today. First month 30% off — code MOVE30.";
    } else if (tier === 3) {
      ctaText = "Start The Movement";
      ctaSubtext = "30% off your first month — code MOVE30.";
    } else if (tier === 2) {
      ctaText = "Join The Movement";
      ctaSubtext = "Build the habit before you need to fix the damage.";
    } else {
      ctaText = "See The Movement";
      ctaSubtext = "Protect what you've built.";
    }
    if (route === "practice_annual") {
      ctaSubtext += " Annual plan recommended.";
    }
  }

  let bodyParagraphs;
  if (tier === 4) {
    bodyParagraphs = (
      <>
        <p className="mb-3">
          That's not a guess — it's what your own answers just showed us.{" "}
          {q4Nowhere
            ? "Even without major pain spots,"
            : `Tension in your ${lowerFirst(q4)},`}{" "}
          sitting {lowerFirst(q6)} a day, barely any structured movement. You already told us what's
          driving it: {lowerFirst(q8)}.
        </p>
        <p>
          Here's the thing — this is the most fixable version of this problem. People who start
          furthest behind see the fastest turnaround, because there's the most room to close the gap.
          But it doesn't close on its own. It closes with a daily practice built for exactly where your
          body is right now.
        </p>
      </>
    );
  } else if (tier === 3) {
    bodyParagraphs = (
      <>
        <p className="mb-3">
          Not a crisis — but not nothing either.{" "}
          {q4Nowhere ? "Your answers show the pattern." : `${q4} is the tell.`} Left alone, this is
          exactly the kind of gap that quietly becomes a bigger one in five years.
        </p>
        <p>
          The good news: this is the easiest tier to fix, because you're already close. A consistent
          daily practice — 10–15 minutes — is usually enough to close a gap this size.
        </p>
      </>
    );
  } else if (tier === 2) {
    bodyParagraphs = (
      <>
        <p className="mb-3">
          That's a good place to be — most people your age aren't. But "on pace" isn't the same as
          "ahead," and the habits that got you here (some sitting, some stiffness, not much structure)
          are exactly the habits that tip people into the next tier over the next few years.
        </p>
        <p>This is the moment to get ahead of it instead of catching up later.</p>
      </>
    );
  } else {
    bodyParagraphs = (
      <>
        <p className="mb-3">
          Genuinely rare — most people who take this land in the tiers above. Whatever you're doing is
          working. The question now isn't "how do I fix this," it's "how do I not lose it."
        </p>
        <p>
          This is where a structured daily practice matters more, not less — it's what keeps you here
          instead of drifting back.
        </p>
      </>
    );
  }

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 pt-10"
    >
      <p className="text-xs text-white-dim font-body uppercase tracking-widest text-center mb-4">
        Body Age Assessment
      </p>

      <div className="text-center mb-6">
        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight"
          style={{ color: tierConfig.color }}
        >
          {bigText}
        </motion.h2>
        <p className="font-body text-sm text-off-white mt-3 font-semibold">{subheadline}</p>
      </div>

      <div className="text-center mb-5">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border"
          style={{
            color: tierConfig.color,
            borderColor: tierConfig.color + "40",
            backgroundColor: tierConfig.color + "10",
          }}
        >
          {tierConfig.name}
        </span>
      </div>

      <div className="font-body text-sm text-white-muted leading-relaxed mb-6">
        {bodyParagraphs}
      </div>

      <div className="text-center">
        <button
          onClick={onCta}
          className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
        >
          {ctaText} <ArrowRight className="w-4 h-4" />
        </button>
        {ctaSubtext && <p className="font-body text-xs text-white-dim mt-3">{ctaSubtext}</p>}
        {showPracticeFallback && (
          <button
            onClick={onCta}
            className="block mx-auto mt-4 font-body text-xs text-white-muted hover:text-off-white underline underline-offset-4 transition-colors"
          >
            or start now with The Practice while you wait to hear back
          </button>
        )}
      </div>

      <button
        onClick={onRetake}
        className="flex items-center justify-center gap-1.5 mx-auto mt-8 text-xs text-white-dim hover:text-white-muted transition-colors"
      >
        <RefreshCw className="w-3 h-3" /> Retake quiz
      </button>
    </motion.div>
  );
}