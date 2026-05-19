import React, { createContext, useContext, useState, useCallback } from "react";

const DEFAULT_CONTENT = {
  hero: {
    headline1: "Your body",
    headline2: "was",
    headlineAccent: "built",
    headline3: "to move.",
    subtitle: "We pay attention to movement only after we lose it. A guided, daily method to rebuild your physical foundation.",
    badge1: "No equipment",
    badge2: "Cancel anytime",
    ctaPrimary: "Start moving",
    ctaSecondary: "Take the 60-second quiz now",
    videoUrl: "",
    videoPoster: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png",
  },
  degrading: {
    headline1: "Your body has been",
    headlineAccent: "silently degrading.",
    subtitle: "Nobody taught you to rebuild it. Until now. Stiffness. Back pain. Lost range of motion. These aren't age — they're hurting your quality of life, building up daily while you sit, scroll, and adapt to less of yourself.",
    imageUrl: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/b9c7805bd_generated_41015e1e.png",
    painPoints: [
      "Stiff in the morning. Tight by night.",
      "Back, hips, knees, neck — the daily friction.",
      "You move less than your body needs.",
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
    eyebrow: "Begin",
    headline1: "One method.",
    headline2: "Pick your",
    headlineAccent: "path.",
    subtitle: "Monthly or annual — pick what fits, switch any time.",
    monthlyPrice: "$35",
    annualPrice: "$250",
    annualOldPrice: "$420",
    annualSavings: "Save 40% · billed yearly",
    ctaMonthly: "Begin monthly",
    ctaAnnual: "Begin annual",
  },
  finalCta: {
    eyebrow: "The only question",
    headline1: "Are you ready",
    headline2: "to actually",
    headlineAccent: "move?",
    subtitle: "Ten minutes. Tomorrow morning. Start the practice that gives your body back to you.",
    ctaPrimary: "Start moving",
    ctaSecondary: "Take the 60-second quiz now",
    footnote: "Free · No equipment · Cancel anytime",
    signature: "— Roye Gold",
  },
  navbar: {
    brand: "KINETIQO",
    links: [
      { label: "Method", href: "#method" },
      { label: "Results", href: "#results" },
      { label: "Pricing", href: "#pricing" },
    ],
    cta: "Start moving",
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
};

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [adminMode, setAdminMode] = useState(false);

  const update = useCallback((section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const updateDeep = useCallback((section, field, index, subField, value) => {
    setContent(prev => {
      const arr = [...prev[section][field]];
      arr[index] = { ...arr[index], [subField]: value };
      return { ...prev, [section]: { ...prev[section], [field]: arr } };
    });
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, update, updateDeep, adminMode, setAdminMode }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}