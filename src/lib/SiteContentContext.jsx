import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_CONTENT = {
  hero: {
    headline1: "Your body",
    headline2: "was",
    headlineAccent: "built",
    headline3: "to move.",
    subtitle: "We pay attention to movement only after we lose it. A guided, daily method to rebuild your physical foundation.",
    badge1: "No equipment",
    badge2: "Cancel anytime",
    ctaPrimary: "Start Moving With Roye",
    ctaSecondary: "Take the 60-second quiz now",
    videoUrl: "",
    videoPoster: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png",
  },
  degrading: {
    headline1: "Your body has been",
    headlineAccent: "silently degrading.",
    subtitle: "Nobody taught you to rebuild it. Until now. Stiffness. Back pain. Lost range of motion. These aren't age — they're hurting your quality of life, building up daily while you sit, scroll, and adapt to less of yourself.",
    imageUrl: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/b9c7805bd_generated_41015e1e.png",
    listTitle: "Sound familiar?",
    painPoints: [
      "Stiff in the morning. Tight by night.",
      "Back, hips, knees, neck — the daily friction.",
      "Strength isn't the problem. Foundation is.",
      "Modern life is breaking your body.",
    ],
    stats: [
      { value: "80%", label: "of adults carry chronic joint or back pain" },
      { value: "6.5h", label: "sitting per day, on average" },
      { value: "-1%/yr", label: "muscle mass lost after 30 (untrained)" },
    ],
  },
  session: {
    eyebrow: "Try a sample · 22-second demo",
    headline1: "Experience what a",
    headlineAccent: "session",
    headline2: "feels like.",
    subtitle: "Five cues. Conscious breath. Deliberate movement. This is the rhythm of every Kinetiqo practice.",
    sessionLabel: "Day session · Standing flow",
    imageUrl: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/316e3cc6a_generated_48b25648.png",
    videoUrl: "",
  },
  pillars: {
    eyebrow: "The Method",
    headline1: "Four pillars,",
    headline2: "one",
    headlineAccent: "operating system.",
    subtitle: "Not a workout split. A daily practice that touches every layer of how your body operates — from joint health to nervous system regulation to the quality of your next decade.",
    imageUrl: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/b92a57523_generated_5445101a.png",
    pillars: [
      { icon: "◎", title: "Mobility", desc: "Open every joint. Recover the range you were born with." },
      { icon: "◈", title: "Strength", desc: "Functional, owned. Strength your body actually uses." },
      { icon: "◇", title: "Control", desc: "Precision in every transition. Move with intention." },
      { icon: "∞", title: "Longevity", desc: "Body that lasts. Decades of capability, not a sprint." },
    ],
  },
  howItFlows: {
    headline1: "How your day with",
    headlineAccent: "movement",
    headline2: "flows.",
    steps: [
      { num: "01", title: "Sign up", desc: "Get instant access to the full library of movement content by Roye Gold — every session, every progression." },
      { num: "02", title: "Open Skool", desc: "Jump into the community classroom where the library lives. One login, everything in one place." },
      { num: "03", title: "Start training", desc: "Choose any session that fits your day. Roye guides every cue — live coaching, conscious breath, with progressions from beginner to advanced." },
    ],
  },
  testimonials: {
    eyebrow: "What changes",
    headline1: "They didn't expect",
    headlineAccent: "this.",
    subtitle: "Real members. Their words, on camera — around day 21, the change is visible.",
    items: [
      { name: "Anna", role: "The Movement member", quote: "Anything is achievable at any age and with no experience.", img: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/67195c632_generated_154b4cca.png" },
      { name: "Anthony", role: "The Movement member", quote: "I'm walking straighter, I've gotten taller. I feel more upright.", img: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a9c1046f2_generated_ebce92fe.png" },
      { name: "Cary", role: "The Movement member", quote: "My body is back in order from the injury that I sustained.", img: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/5371bf27f_generated_9d9e1948.png" },
    ],
    stats: [
      { value: "1M+", label: "in Roye's community" },
      { value: "94%", label: "feel a shift in week one" },
      { value: "4.9", label: "avg rating · App Store" },
    ],
  },
  pricing: {
    sectionTitle: "Memberships",
    monthlyPrice: "$35",
    monthlyFeatures: [
      "Personalized adaptive daily practice",
      "Full Movement training library (240+ sessions)",
      "Strength, mobility, control & longevity tracks",
      "Community access + challenges",
    ],
    ctaMonthly: "Begin Monthly",
    annualMonthlyPrice: "$19.99",
    annualPrice: "$239.88",
    annualSavings: "SAVE 40%",
    annualInsteadOf: "SAVE 40%",
    annualFeatures: [
      "Everything in Monthly, plus:",
      "Weekly live coaching & feedback",
      "Exclusive member-only trainings",
      "Advanced content drops",
      "Priority access to new releases",
      "Annual member perks & content",
    ],
    ctaAnnual: "Begin Annual",
    innerCircleBadge: "By Application Only",
    innerCircleTitle: "TAILORED TO YOU",
    innerCircleSubtitle: "Private Coaching",
    innerCircleTagline: "Premium 3-month commitment",
    innerCircleDescription: "A private, personalized coaching experience for a select number of members ready for direct access to Roye, deeper accountability, and a premium three-month commitment.",
    innerCircleFeatures: [
      "Everything in Monthly/Annual",
      "Personalized plan for your body & goals",
      "Weekly live feedback with Roye",
      "Ongoing adjustments as you progress",
      "Direct support, every step",
      "Limited spots - serious members only",
    ],
    innerCircleCta: "Apply to Inner Circle",
    innerCircleFootnote: "Starts with a private consultation.",
  },
  finalCta: {
    showQuizButton: true,
    eyebrow: "The only question",
    headline1: "Are you ready",
    headline2: "to actually",
    headlineAccent: "Move Better?",
    subtitle: "Ten minutes. Tomorrow morning. Start the practice that gives your body back to you.",
    ctaPrimary: "Start moving",
    ctaSecondary: "Take the 60-second quiz now",
    footnote: "Free · No equipment · Cancel anytime",
    signature: "— Roye Gold",
  },
  navbar: {
    brand: "KINETIQO",
    links: [
      { label: "The Program", href: "#program" },
      { label: "Who Is It For?", href: "#who" },
      { label: "Roye Gold", href: "#roye" },
      { label: "Pricing", href: "#pricing" },
      { label: "Inner Circle", href: "#inner-circle" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: "Start Moving With Roye",
  },
  footer: {
    brand: "KINETIQO",
    tagline: "Kinetiqo by Roye Gold — The movement operating system",
    copyright: "© 2026 · Movement, restored.",
  },
  social: {
    links: [
      { platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
      { platform: "YouTube", url: "https://youtube.com", icon: "youtube" },
      { platform: "TikTok", url: "https://tiktok.com", icon: "tiktok" },
    ]
  },
  innerCircle: {
    eyebrow: "Our Highest Level of Coaching",
    headline: "Inner",
    headlineAccent: "Circle.",
    description: "The Inner Circle is our most premium, highest-touch coaching experience.",
    paragraph1: "It includes everything in the Monthly / Annual membership, plus a personalized plan, weekly live feedback, ongoing adjustments, and direct support — offered only in limited capacity.",
    paragraph2: "",
    paragraph3: "",
    whatYouGet: [
      "Everything included in the Monthly / Annual membership",
      "Personalized movement plan tailored to your body, goals, and progress",
      "Weekly live Zoom feedback session",
      "Ongoing plan adjustments as you improve",
      "Direct support throughout your journey",
      "Limited availability for serious members only",
    ],
    ctaLabel: "",
    ctaSubtext: "",
    ctaButton: "Apply for Inner Circle →",
    ctaFootnote: "Application starts with a private consultation.",
    ctaUrl: "#",
    imageUrl: "",
  },
  about: {
    eyebrow: "",
    headline: "Meet",
    headlineAccent: "Roye Gold",
    text: "Most people don't lose their body all at once — it happens slowly, through years of sitting and skipping the basics, until moving well feels like something other people can do. Not you.\n\nI spent 12 years working against exactly that. I started as a competitive swimmer during my military service, then shifted from performing in the water to understanding how the body actually moves — and why most people lose that ability without noticing. That became The Movement: not a workout program, but a structured path back to a body that moves the way it's supposed to.\n\nBuilt for people starting from zero, and for the athletes I've coached as a movement advisor to American Ninja Warrior. Today, over a million people follow this work — same principles every time, nothing overcomplicated to look impressive.\n\nIf you're here, you already know something needs to change. Let's start.",
    imageUrl: "",
    gallery: [],
    iconList: [
      "Live coaching, every cue",
      "Structured progressions, beginner to advanced",
      "Full library, one login",
      "Community that keeps you accountable",
    ],
  },
  faq: {
    items: [
      { question: "Do I need any equipment?", answer: "No equipment needed. All sessions are bodyweight-based and designed to be done anywhere — at home, in a hotel room, or outdoors." },
      { question: "How long are the sessions?", answer: "Most sessions are 10–20 minutes. Some advanced flows go up to 30 minutes. You can always choose a session length that fits your day." },
      { question: "I'm a complete beginner — is this for me?", answer: "Absolutely. The Foundation Track is built specifically for people starting from zero. Roye guides every cue so you always know exactly what to do." },
      { question: "What if I have an injury or chronic pain?", answer: "Many members join because of injuries or chronic pain. The method focuses on gentle, restorative movement — but if you have a serious condition, consult your doctor first." },
      { question: "Can I cancel anytime?", answer: "Yes. There are no long-term commitments. You can cancel your subscription at any time from your account settings, no questions asked." },
      { question: "What platform is the content on?", answer: "All content is hosted on Skool — a simple, clean community platform. One login gives you access to the full library, the community, and all live sessions." },
    ]
  },
  homebSocialProof: {
    stats: [
      { value: "1.5M+", label: "Social Media Followers" },
      { value: "1k+", label: "Guided Videos" },
      { value: "15+", label: "Years Coaching Members" },
      { value: "1st", label: "Official Movement School in the World" },
    ],
  },
  homebSeeInside: {
    eyebrow: "This is what you're joining",
    headline: "A Glimpse Into The Program",
    headlineAccent: "The Program",
    subtitle: "Watch a short introduction to Roye's philosophy, teaching style, and the practice behind The Movement.",
    steps: ["Watch it", "Try it", "Share it", "Personal Feedback"],
    youtubeUrl: "",
    videoUrl: "",
    imageUrl: "",
  },
  homebComparison: {
    eyebrow: "Comparison Chart",
    headline: "Everyone wants structure, a routine, and fast results. Here's who actually gives you all three.",
    subtitle: "",
    columns: ["The Movement", "Random YouTube", "Traditional Gym"],
    rows: [
      { feature: "Time to start", movement: "10 min, exact exercise ready for you", youtube: "Endless searching", gym: "Drive, park, wait for equipment" },
      { feature: "Pain relief", movement: "Lasts", youtube: "Temporary, if any", gym: "Focus on aesthetics only" },
      { feature: "Who's coaching you", movement: "Roye, daily", youtube: "No one personally", gym: "Extra cost for personal trainer" },
      { feature: "Routine", movement: "Built as a daily 10 min habit", youtube: "Easy to abandon", gym: "Easy to skip" },
      { feature: "Feels different by", movement: "Week 1", youtube: "Unknown", gym: "2-3 Months" },
      { feature: "Cost", movement: "$19.99/mo", youtube: "Free (but no plan)", gym: "$50-150/mo" },
    ],
  },
  homebBuiltForEveryone: {
    eyebrow: "Inclusivity",
    headline: "Built For Everyone",
    paragraphs: [
      "Sit for hours a day? Hips locked, back tight the second you stand? Stretching apps, random YouTube, even physio and massages – they treat the symptom, not the cause.",
      "This isn't one program for one type of body. Active or just getting moving again, any age, any size, any pace – built around you, not a generic plan.",
      "Fifteen years of Roye's method, broken down step by step – so anyone can follow from day one.",
    ],
  },
  homebBeforeAfter: {
    eyebrow: "Real Results",
    headline: "Real Results, Real Members",
    subtitle: "Before & After photos of flexibility (touching toes) and then improving after 2 weeks",
    items: [],
  },
  handstandPreorder: {
    enabled: false,
    targetDate: "",
    price: "99",
    originalPrice: "149",
    discountText: "Save 34%",
    videoUrl: "",
    videoPoster: "",
  },
  movementAgeQuiz: {
    questions: [
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
    ],
    emailHeadline: "Your Fitness Age is ready",
    emailSubhead: "Enter your email to see your results + get your personalized plan.",
    emailCta: "Reveal My Results",
    introLine: "What's your real Fitness Age?",
    explainer: "Fitness Age isn't your real age — it's how well your body is actually performing based on your squat, mobility, energy, and sleep. It goes up when your body is stiffer, weaker, or more worn down than it should be for your age, and it goes down as those things improve. The good news: unlike your real age, this number can go down.",
    squatLabel: "Your Squat Breakdown",
    planLabel: "Your Recommended Plan",
  },
};

const SiteContentContext = createContext(null);

// Merge DB records into the default content structure
function mergeDbRecords(records) {
  const merged = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  for (const rec of records) {
    if (rec.section_key && rec.data) {
      // Handle legacy nested structure: { data: {...}, section_key: "..." }
      const payload = rec.data.data && rec.data.section_key ? rec.data.data : rec.data;
      merged[rec.section_key] = payload;
    }
  }
  return merged;
}

export function SiteContentProvider({ children, keyPrefix = "" }) {
  const [content, setContent] = useState(null);
  const [dbRecords, setDbRecords] = useState({}); // section_key -> { id, data }
  const [loading, setLoading] = useState(true);
  const dbRecordsRef = useRef({});

  // Load all content from DB on mount
  useEffect(() => {
    base44.entities.SiteContent.list().then(records => {
      const byKey = {};
      const filtered = [];
      for (const rec of records) {
        if (keyPrefix) {
          if (rec.section_key?.startsWith(keyPrefix)) {
            const unprefixed = rec.section_key.slice(keyPrefix.length);
            const adjusted = { ...rec, section_key: unprefixed };
            byKey[unprefixed] = adjusted;
            filtered.push(adjusted);
          }
        } else {
          byKey[rec.section_key] = rec;
          filtered.push(rec);
        }
      }
      setDbRecords(byKey);
      dbRecordsRef.current = byKey;
      setContent(mergeDbRecords(filtered));
      setLoading(false);
    }).catch(() => {
      setContent(DEFAULT_CONTENT);
      dbRecordsRef.current = {};
      setLoading(false);
    });
  }, []);

  // Persist a section's data to DB (uses ref to avoid duplicate creates from concurrent calls)
  const saveRecord = useCallback(async (section, newData) => {
    const existing = dbRecordsRef.current[section];
    try {
      if (existing?.id) {
        await base44.entities.SiteContent.update(existing.id, { data: newData });
      } else {
        const created = await base44.entities.SiteContent.create({ section_key: keyPrefix + section, data: newData });
        dbRecordsRef.current = { ...dbRecordsRef.current, [section]: created };
        setDbRecords(prev => ({ ...prev, [section]: created }));
      }
    } catch (err) {
      console.error("Failed to save content:", err);
    }
  }, [keyPrefix]);

  // Update a field and persist to DB
  const update = useCallback(async (section, field, value) => {
    const existing = dbRecordsRef.current[section];
    const newData = { ...(existing?.data || DEFAULT_CONTENT[section] || {}), [field]: value };

    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    const newRecord = { ...existing, data: newData };
    dbRecordsRef.current = { ...dbRecordsRef.current, [section]: newRecord };
    setDbRecords(prev => ({ ...prev, [section]: newRecord }));

    await saveRecord(section, newData);
  }, [keyPrefix, saveRecord]);

  // Update a nested array item and persist to DB
  const updateDeep = useCallback(async (section, field, index, subField, value) => {
    const existing = dbRecordsRef.current[section];
    const currentData = existing?.data || DEFAULT_CONTENT[section] || {};
    const arr = [...(currentData[field] || [])];
    arr[index] = { ...arr[index], [subField]: value };
    const newSectionData = { ...currentData, [field]: arr };

    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: arr },
    }));
    const newRecord = { ...existing, data: newSectionData };
    dbRecordsRef.current = { ...dbRecordsRef.current, [section]: newRecord };
    setDbRecords(prev => ({ ...prev, [section]: newRecord }));

    await saveRecord(section, newSectionData);
  }, [keyPrefix, saveRecord]);

  // Reset a section to defaults and overwrite DB
  const resetSection = useCallback(async (section) => {
    const defaultData = DEFAULT_CONTENT[section];
    if (!defaultData) return;
    const existing = dbRecordsRef.current[section];
    setContent(prev => ({ ...prev, [section]: defaultData }));
    const newRecord = { ...existing, data: defaultData };
    dbRecordsRef.current = { ...dbRecordsRef.current, [section]: newRecord };
    setDbRecords(prev => ({ ...prev, [section]: newRecord }));
    await saveRecord(section, defaultData);
  }, [keyPrefix, saveRecord]);

  return (
    <SiteContentContext.Provider value={{ content, update, updateDeep, resetSection, loading }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}