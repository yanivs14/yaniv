import { base44 } from "@/api/base44Client";

export const IC_DEFAULTS = {
  accentColor: "#FF2DF1",
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
    body1: "Inner Circle is our most premium, highest-touch coaching experience. It includes everything in the Monthly / Annual membership, plus a personalized plan, weekly live feedback, ongoing adjustments, and direct support — offered only in limited capacity.",
    body2: "This is for the person who wants a coach invested in their progress, adjusting the plan in real time, and showing up for them every week.",
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
    steps: [
      { step: "01", title: "Apply", desc: "Fill out a short form telling us about your goals and where you're at right now." },
      { step: "02", title: "Consultation Call", desc: "We hop on a private call to understand your situation and see if Inner Circle is the right fit." },
      { step: "03", title: "Your Plan Begins", desc: "We build your personalized plan and get to work. Your transformation starts here." },
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
    } else if (typeof override[key] === "object" && override[key] !== null && typeof defaults[key] === "object" && defaults[key] !== null) {
      result[key] = deepMerge(defaults[key], override[key]);
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}