import { base44 } from "@/api/base44Client";

const PAGE_KEY = "hspre";

export const HSPRE_DEFAULTS = {
  // Hero
  heroImage: "https://media.base44.com/images/public/6a0c583766eb003a373061f3/15ccebf4a_generated_image.png",
  heroTitleLine1: "Master The",
  heroTitleHighlight: "Handstand",
  heroDescription: "A complete progression system — from your first wall hold to elite one-arm mastery.",
  heroCtaText: "Explore the Program",
  heroCtaLink: "#program",

  // Intro
  introP1Before: "A well-executed handstand is actually one of the best bodyweight skills for developing ",
  introP1Highlight: "strength, balance, and body control.",
  introP1After: " Handstands deliver a combination of physical development, skill mastery, and enjoyment. This improves coordination and motor control that transfers to many athletic movements.",
  introP2: "It's a skill — not just exercise. Unlike doing more push-ups every week, handstands are a movement skill.",

  // Program
  programTitle: "Four Phases to Mastery",
  phases: [
    { number: "01", title: "The Foundation Phase", description: "Building the absolute core essentials of handbalancing — mastering your body line alignment to unlock effortless balance over raw muscle strain." },
    { number: "02", title: "Balance Phase", description: "Applying endurance protocols to wall drills while learning the specific entry mechanics to find and hold your freestanding handstand." },
    { number: "03", title: "Movement Phase", description: "Practicing foundational shapes inside the handstand to deepen your control and prepare your shoulders for more complex patterns." },
    { number: "04", title: "Specialist Phase", description: "Achieving strict mastery over advanced shapes and conditioning the body for the elite transition toward the one-arm handstand." },
  ],
  extras: [
    { title: "Handstand Elements", description: "Training advanced, dynamic transitions with a focus on active mobility and movement efficiency, transforming your handstand into a functional platform for complex elements." },
    { title: "Toolbox", description: "Your go-to repository for supplementary work, covering joint preparation, wrist warm-ups, and the essential mobility drills needed to support your practice." },
  ],

  // CTA
  ctaTitle: "Be the First to Get Access",
  ctaDesc1Before: "Join the pre-launch and enjoy ",
  ctaDesc1Highlight: "25% off",
  ctaDesc1After: " the full price.",
  ctaDesc2: "Limited spots available — secure your discount before launch day.",
  ctaButtonText: "Claim 25% Off",
  ctaButtonLink: "#",
};

export async function loadHsPreContent() {
  try {
    const records = await base44.entities.PrepPageContent.filter({ page_key: PAGE_KEY });
    if (records.length > 0) {
      return { ...HSPRE_DEFAULTS, ...records[0].data, _id: records[0].id };
    }
  } catch (e) {
    console.error("Failed to load hspre content:", e);
  }
  return { ...HSPRE_DEFAULTS, _id: null };
}

export async function saveHsPreContent(data, recordId) {
  const payload = { page_key: PAGE_KEY, data };
  if (recordId) {
    return await base44.entities.PrepPageContent.update(recordId, payload);
  }
  return await base44.entities.PrepPageContent.create(payload);
}