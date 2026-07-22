import { useState, useEffect } from "react";

export const HANDSTAND_DEADLINE = new Date("2026-08-02T23:59:59+03:00").getTime();
export const PRE_LAUNCH_PRICE = 99;
export const REGULAR_PRICE = 149;

export function isPreLaunch() {
  return Date.now() < HANDSTAND_DEADLINE;
}

export function useHandstandOffer() {
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
    ctaText: `Get the Handstand Course — $${price}`,
    secondaryCtaText: "Explore Annual Membership",
    deliveryNote: preLaunch ? "Course access begins August 3." : "Access instructions delivered by email.",
    offerLabel: preLaunch ? "PRE-LAUNCH PRICE" : "NOW AVAILABLE",
    preLaunchLabel: preLaunch ? "PRE-LAUNCH ACCESS · SAVE $50 UNTIL AUGUST 2" : "",
    saveText: preLaunch ? "Save $50" : "",
  };
}