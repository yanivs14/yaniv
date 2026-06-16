import { base44 } from "@/api/base44Client";

export const IC_DEFAULTS = {
  accentColor: "#FF2DF1",
  navbar: {
    links: [
      { label: "What Is It", href: "#ic-what" },
      { label: "What You Get", href: "#ic-benefits" },
      { label: "How It Works", href: "#ic-process" },
      { label: "FAQ", href: "#ic-faq" },
    ],
    ctaText: "Apply for Inner Circle",
  },
  hero: {
    eyebrow: "Our Highest Level of Coaching",
    title1: "Inner",
    title2: "Circle.",
    ctaText: "Apply for Inner Circle",
    ctaSubtext: "Application starts with a private consultation.",
    keywords: ["Personalized", "Live Feedback", "Limited Spots", "Direct Support"],
    mediaUrl: "",
    mediaType: "none", // "image" | "video" | "none"
  },
  marquee: {
    items: ["The Most Personal Coaching Experience", "Limited Availability", "Personalized Plan", "Weekly Live Sessions", "Direct Support"],
  },
  whatIsIt: {
    eyebrow: "What Is It",
    headline: "Not a program.\nA partnership.",
    headlineLine1: "Not a program.",
    headlineLine2: "A partnership.",
    headlineAccentColor: "",
    body1: "Inner Circle is our most premium, highest-touch coaching experience. It includes everything in the Monthly / Annual membership, plus a personalized plan, weekly live feedback, ongoing adjustments, and direct support — offered only in limited capacity.",
    body2: "This is for the person who wants a coach invested in their progress, adjusting the plan in real time, and showing up for them every week.",
    mediaUrl: "",
    mediaType: "none",
    features: [
      { num: "01", title: "Personalized Movement Plan", desc: "A plan built entirely around your body, goals, and current capacity — not a template." },
      { num: "02", title: "Weekly Live Zoom Feedback", desc: "Face-to-face feedback, form corrections, and real-time guidance every single week." },
      { num: "03", title: "Ongoing Plan Adjustments", desc: "Your program evolves with you. As you progress, so does your training." },
    ],
  },
  whatYouGet: {
    eyebrow: "The Full Package",
    headline: "What you",
    headlineAccent: "get.",
    ctaText: "Apply now",
    mediaType: "none",
    mediaUrl: "",
    items: [
      { label: "Everything included in the Monthly / Annual membership", tag: "Foundation" },
      { label: "Personalized movement plan tailored to your body, goals, and progress", tag: "Custom" },
      { label: "Weekly live Zoom feedback session", tag: "Live" },
      { label: "Ongoing plan adjustments as you improve", tag: "Adaptive" },
      { label: "Direct support throughout your journey", tag: "Support" },
      { label: "Limited availability for serious members only", tag: "Exclusive" },
    ],
  },
  process: {
    eyebrow: "How It Works",
    headline: "Three steps.\nOne transformation.",
    headlineLine1: "Three steps.",
    headlineLine2: "One transformation.",
    headlineAccentColor: "",
    steps: [
      { step: "01", title: "Apply", desc: "Fill out a short form telling us about your goals and where you're at right now." },
      { step: "02", title: "Consultation Call", desc: "We hop on a private call to understand your situation and see if Inner Circle is the right fit." },
      { step: "03", title: "Your Plan Begins", desc: "We build your personalized plan and get to work. Your transformation starts here." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Got\nquestions?",
    headlineLine1: "Got",
    headlineLine2: "questions?",
    headlineAccentColor: "",
    items: [
      { q: "Who is Inner Circle for?", a: "Inner Circle is for serious movers who want the highest level of personal coaching — people ready to invest in a premium, fully personalized experience with direct support from Roye." },
      { q: "How is Inner Circle different from the regular membership?", a: "The regular membership gives you access to all programs. Inner Circle adds a personalized movement plan built for your body, weekly live Zoom sessions with Roye, ongoing plan adjustments, and direct communication throughout." },
      { q: "How many spots are available?", a: "Inner Circle operates at strictly limited capacity to ensure every member gets genuine attention. Spots are opened periodically and require an application." },
      { q: "What does the application process look like?", a: "You submit a short application, then schedule a private consultation call with Roye to discuss your goals and assess fit. If it's a match, your personalized plan begins." },
      { q: "How often are the live sessions?", a: "Members receive one weekly live Zoom session with Roye for form feedback, movement corrections, and guidance. These are real, face-to-face sessions — not pre-recorded." },
      { q: "Can I join if I'm a complete beginner?", a: "Yes. Inner Circle is built around your current level, whatever that is. Roye builds your plan from where you are and progresses it with you over time." },
      { q: "What happens if I need to pause or cancel?", a: "We understand life happens. Reach out directly and we'll work something out. Inner Circle is a relationship, not just a subscription." },
      { q: "Do I still get access to the regular program library?", a: "Absolutely. Inner Circle includes everything in the Monthly / Annual membership, plus all the premium add-ons on top of that." },
      { q: "How much does Inner Circle cost?", a: "Pricing is discussed during the private consultation call, as it depends on your goals and the scope of support. Apply to find out if it's the right fit." },
      { q: "How do I get started?", a: "Click the Apply button, fill out a short form, and we'll be in touch to schedule your consultation call. The sooner you apply, the sooner your transformation begins." },
    ],
  },
  finalCta: {
    eyebrow: "Ready?",
    headline: "This is\nyour",
    headlineAccent: "move.",
    body: "Inner Circle is designed for members looking for our most personal and premium coaching experience. Spots are limited and application is required.",
    ctaText: "Apply for Inner Circle",
    ctaSubtext: "Application starts with a private consultation.",
  },
};

const SECTION_KEY = "inner_circle_page";

let _cache = null;

export async function loadICContent() {
  _cache = null;
  const records = await base44.entities.InnerCircleContent.filter({ section_key: SECTION_KEY });
  if (records.length > 0) {
    _cache = { id: records[0].id, ...deepMerge(IC_DEFAULTS, records[0].data || {}) };
  } else {
    _cache = { ...IC_DEFAULTS };
  }
  return _cache;
}

export async function saveICContent(data) {
  const { id, ...rest } = data;
  const payload = { section_key: SECTION_KEY, data: rest };
  if (id) {
    await base44.entities.InnerCircleContent.update(id, payload);
    return { id, ...rest };
  } else {
    const created = await base44.entities.InnerCircleContent.create(payload);
    return { id: created.id, ...rest };
  }
}

function deepMerge(defaults, override) {
  if (typeof defaults !== "object" || defaults === null) return override ?? defaults;
  const result = { ...defaults };
  for (const key of Object.keys(override || {})) {
    if (Array.isArray(override[key])) {
      result[key] = override[key];
    } else if (
      typeof override[key] === "object" && override[key] !== null &&
      typeof defaults[key] === "object" && defaults[key] !== null &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], override[key]);
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}