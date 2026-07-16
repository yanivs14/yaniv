import { base44 } from "@/api/base44Client";

/**
 * Centralized analytics & attribution module.
 * - UTM persistence: first-touch (never overwritten), last-touch (per session)
 * - Session & anonymous ID management
 * - Standardized event payload builder
 * - Pushes to dataLayer (GA4 via GTM)
 * - Forwards key events to HubSpot behavioral events API when email is known
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

const SK = {
  ANON: "_rg_anon_id",
  SESSION: "_rg_session_id",
  SESSION_TS: "_rg_session_ts",
  FIRST: "_rg_first_touch",
  LAST: "_rg_last_touch",
  IDENTITY: "_rg_identity",
  COUNTRY: "_rg_country",
};

// Events that should also be forwarded to HubSpot
const HUBSPOT_EVENTS = ["page_view", "cta_clicked", "pricing_viewed", "quiz_opened", "lead_capture"];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function getOrCreate(key, gen) {
  let v = localStorage.getItem(key);
  if (!v) { v = gen(); localStorage.setItem(key, v); }
  return v;
}

function parseUtms() {
  const params = new URLSearchParams(window.location.search);
  const utms = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) utms[k] = v;
  }
  return utms;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType = "desktop";
  if (/Mobi|Android|iPhone/i.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet/i.test(ua)) deviceType = "tablet";
  let browser = "unknown";
  if (/Edg/i.test(ua)) browser = "edge";
  else if (/Chrome/i.test(ua)) browser = "chrome";
  else if (/Firefox/i.test(ua)) browser = "firefox";
  else if (/Safari/i.test(ua)) browser = "safari";
  return { device_type: deviceType, browser };
}

export function getGaClientId() {
  try {
    const m = document.cookie.match(/_ga=([^;]+)/);
    if (m) {
      const p = m[1].split(".");
      if (p.length >= 4) return p[2] + "." + p[3];
    }
  } catch (_) {}
  return "";
}

/**
 * Initialize on app load — sets up UTM persistence and session.
 * Call once at app startup.
 */
export function initAnalytics() {
  getOrCreate(SK.ANON, genId);

  const now = Date.now();
  const ts = localStorage.getItem(SK.SESSION_TS);
  if (!ts || now - parseInt(ts) > SESSION_TIMEOUT) {
    localStorage.setItem(SK.SESSION, genId());
  }
  localStorage.setItem(SK.SESSION_TS, String(now));

  const utms = parseUtms();
  const referrer = document.referrer || "direct";
  const landingPage = window.location.pathname;
  const touchData = { ...utms, referrer, landing_page: landingPage, timestamp: now };

  // First touch: set only once
  if (!localStorage.getItem(SK.FIRST)) {
    localStorage.setItem(SK.FIRST, JSON.stringify(touchData));
  }

  // Last touch: always update (per qualified session)
  localStorage.setItem(SK.LAST, JSON.stringify(touchData));

  // Global CTA click listener — any element with data-cta-id
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-cta-id]");
    if (!el) return;
    trackCtaClicked(
      el.dataset.ctaId,
      (el.textContent || "").trim().slice(0, 100),
      el.getAttribute("href") || el.dataset.ctaDestination || "",
      window.location.pathname
    );
  }, true);
}

export function getAnonymousId() {
  return getOrCreate(SK.ANON, genId);
}

export function getSessionId() {
  const now = Date.now();
  const ts = localStorage.getItem(SK.SESSION_TS);
  if (!ts || now - parseInt(ts) > SESSION_TIMEOUT) {
    localStorage.setItem(SK.SESSION, genId());
  }
  localStorage.setItem(SK.SESSION_TS, String(now));
  return localStorage.getItem(SK.SESSION) || genId();
}

/** Returns first-touch and last-touch attribution for form/checkout payloads */
export function getAttribution() {
  try {
    return {
      first_touch: JSON.parse(localStorage.getItem(SK.FIRST) || "{}"),
      last_touch: JSON.parse(localStorage.getItem(SK.LAST) || "{}"),
    };
  } catch (_) {
    return { first_touch: {}, last_touch: {} };
  }
}

/** Returns current UTMs (from last-touch) for appending to lead/checkout payloads */
export function getCurrentUtms() {
  const lt = getAttribution().last_touch;
  return {
    utm_source: lt.utm_source || "",
    utm_medium: lt.utm_medium || "",
    utm_campaign: lt.utm_campaign || "",
    utm_content: lt.utm_content || "",
    utm_term: lt.utm_term || "",
  };
}

/** Store user identity after lead capture — enables HubSpot event forwarding */
export function setUserIdentity(email, hubspotContactId) {
  if (!email) return;
  localStorage.setItem(SK.IDENTITY, JSON.stringify({
    email,
    hubspot_contact_id: hubspotContactId || "",
  }));
}

export function getIdentity() {
  try { return JSON.parse(localStorage.getItem(SK.IDENTITY) || "{}"); }
  catch (_) { return {}; }
}

export function setCountry(country) {
  if (country) sessionStorage.setItem(SK.COUNTRY, country);
}

function getPageInfo() {
  return {
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_variant: window.location.pathname,
  };
}

/**
 * Core tracking function — pushes enriched event to dataLayer (GA4/GTM).
 * If email is known and event is HubSpot-eligible, forwards via backend (debounced).
 */
export function track(eventName, params = {}) {
  const identity = getIdentity();
  const device = getDeviceInfo();

  const payload = {
    event: eventName,
    event_name: eventName,
    event_version: "1.0",
    event_time: new Date().toISOString(),
    anonymous_id: getAnonymousId(),
    session_id: getSessionId(),
    ga_client_id: getGaClientId(),
    ...getPageInfo(),
    ...getCurrentUtms(),
    referrer: document.referrer || "direct",
    ...device,
    country: sessionStorage.getItem(SK.COUNTRY) || "",
    hubspot_contact_id: identity.hubspot_contact_id || "",
    idempotency_key: genId(),
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  // Forward to HubSpot if eligible and email known
  if (identity.email && HUBSPOT_EVENTS.includes(eventName)) {
    _queueHubspot(eventName, payload);
  }
}

// Debounced HubSpot forwarding
let _hsQueue = [];
let _hsTimer = null;

function _queueHubspot(eventName, payload) {
  _hsQueue.push({ eventName, payload });
  if (_hsTimer) return;
  _hsTimer = setTimeout(() => {
    _hsTimer = null;
    const batch = _hsQueue.splice(0);
    for (const { eventName, payload } of batch) {
      base44.functions.invoke("trackEvent", { ...payload, event_name: eventName }).catch(() => {});
    }
  }, 2000);
}

// ── Convenience wrappers ──

export function trackPageView(pageVariant) {
  track("page_view", { page_variant: pageVariant || window.location.pathname });
}

export function trackSectionViewed(sectionId, scrollDepth) {
  track("section_viewed", { section_id: sectionId, scroll_depth: scrollDepth || 0 });
}

export function trackCtaClicked(ctaId, ctaText, destination, pageState) {
  track("cta_clicked", {
    cta_id: ctaId || "",
    cta_text: ctaText || "",
    destination: destination || "",
    page_state: pageState || "",
  });
}

export function trackVideoEngaged(videoId, progressPct) {
  track("video_engaged", { video_id: videoId || "", progress_pct: progressPct });
}

export function trackPricingViewed(planOptions, pageState) {
  track("pricing_viewed", {
    plan_options: typeof planOptions === "string" ? planOptions : JSON.stringify(planOptions || []),
    page_state: pageState || "",
  });
}

export function trackQuizOpened(quizId, quizVersion) {
  track("quiz_opened", { quiz_id: quizId || "movement_quiz", quiz_version: quizVersion || "1.0" });
}

/** Track lead capture — also stores identity for future HubSpot event forwarding */
export function trackLeadCapture(email, leadSource, consent, quizRecommendation) {
  setUserIdentity(email);
  track("lead_capture", {
    email,
    lead_source: leadSource || "",
    consent: consent ? "true" : "false",
    quiz_recommendation: quizRecommendation || "",
  });
}

/** Track purchase with full revenue data */
export function trackPurchase(transactionId, value, currency, plan, customerEmail, customerName) {
  if (customerEmail) setUserIdentity(customerEmail);
  track("purchase", {
    transaction_id: transactionId,
    value: value || 0,
    currency: currency || "USD",
    plan,
    customer_email: customerEmail || "",
    customer_name: customerName || "",
    revenue: value || 0,
    price: value || 0,
    product: plan || "",
    quantity: 1,
  });

  // Meta Pixel: Subscribe for subscriptions (monthly/annual/promo), Purchase for one-time
  const isSubscription = SUBSCRIPTION_PLANS.includes(plan);
  trackMetaPixel(isSubscription ? "Subscribe" : "Purchase", {
    value: value || 0,
    currency: currency || "USD",
    content_name: plan || "",
    content_type: "product",
    content_ids: [plan || ""],
  });
}

// ── Meta Pixel ──

const SUBSCRIPTION_PLANS = ["monthly", "annual", "promo"];

function trackMetaPixel(eventName, params = {}) {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}

/** Track AddToCart — fires Meta Pixel client-side */
export function trackMetaAddToCart({ value, currency, planType, planLabel }) {
  trackMetaPixel("AddToCart", {
    value: value || 0,
    currency: currency || "USD",
    content_name: planLabel || planType || "",
    content_type: "product",
    content_ids: [planType || ""],
  });
}