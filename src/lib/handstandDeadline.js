import { useState, useEffect } from "react";

export const HANDSTAND_DEADLINE = new Date("2026-08-02T23:59:59+03:00").getTime();
export const PRE_LAUNCH_PRICE = 99;
export const REGULAR_PRICE = 149;

export function isPreLaunch() {
  return Date.now() < HANDSTAND_DEADLINE;
}

export function useHandstandOffer(t = {}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = HANDSTAND_DEADLINE - now;
  const preLaunch = diff > 0;

  let countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (preLaunch) {
    const totalSec = Math.floor(diff / 1000);
    countdown = {
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    };
  }

  const price = preLaunch ? PRE_LAUNCH_PRICE : REGULAR_PRICE;

  return {
    isPreLaunch: preLaunch,
    countdown,
    price,
    priceDisplay: `$${price}`,
    nextPrice: REGULAR_PRICE,
    nextPriceDisplay: `$${REGULAR_PRICE}`,
    // CTAs
    ctaText: preLaunch
      ? (t.ctaPreLaunch || `Get the Handstand Course — $${PRE_LAUNCH_PRICE}`)
      : (t.ctaRegular || `Get the Handstand Course — $${REGULAR_PRICE}`),
    secondaryCtaText: t.secondaryCtaText || "Explore Annual Membership",
    microcopy: t.microcopy || "One-time payment · No subscription · Access instructions delivered by email",
    // Offer labels
    offerLabel: preLaunch ? (t.offerLabelPreLaunch || "PRE-LAUNCH PRICE") : (t.offerLabelRegular || "NOW AVAILABLE"),
    preLaunchLabel: preLaunch ? (t.preLaunchLabel || "PRE-LAUNCH ACCESS · SAVE $50 UNTIL AUGUST 2") : "",
    deliveryNote: preLaunch
      ? (t.deliveryNotePreLaunch || "Course access begins August 3.")
      : (t.deliveryNoteRegular || "Access instructions delivered by email."),
    // Hero
    heroCountdownLabel: t.heroCountdownLabel || "Pre-launch ends in",
    // Announcement bar
    announcementLeftText: t.announcementLeftText || "PRE-LAUNCH PRICE ENDS AUGUST 2",
    announcementRightText: t.announcementRightText || "$99 NOW · $149 FROM AUGUST 3",
    announcementCtaText: t.announcementCtaText || "GET THE COURSE",
    announcementNowAvailable: t.announcementNowAvailable || "NOW AVAILABLE",
    announcementOneTimePayment: t.announcementOneTimePayment || "One-time payment",
    announcementCountdownLabel: t.announcementCountdownLabel || "Pre-launch price ends in",
    announcementMobileEndsLabel: t.announcementMobileEndsLabel || "· ENDS",
    // Sticky mobile bar
    stickyBarPreLaunch: t.stickyBarPreLaunch || "$99 UNTIL AUG 2",
    stickyBarRegular: t.stickyBarRegular || "ONE-TIME PAYMENT",
    stickyBarCtaText: t.stickyBarCtaText || "GET THE COURSE",
    // Purchase options price notes
    standalonePriceNotePreLaunch: t.standalonePriceNotePreLaunch || `Pre-launch price · $${REGULAR_PRICE} from August 3`,
    standalonePriceNoteRegular: t.standalonePriceNoteRegular || "One-time payment",
    // Final CTA
    finalCtaPreLaunchReminder: t.finalCtaPreLaunchReminder || `Pre-launch price: $${PRE_LAUNCH_PRICE} until August 2`,
    // Footer
    footerTerms: t.footerTerms || "Terms",
    footerPrivacy: t.footerPrivacy || "Privacy Policy",
    footerRefund: t.footerRefund || "Refund Policy",
    footerContact: t.footerContact || "Contact",
    // Video
    videoPlaceholder: t.videoPlaceholder || "Add a video in the admin editor",
  };
}