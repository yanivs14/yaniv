import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";
import { isPreLaunch, PRE_LAUNCH_PRICE, REGULAR_PRICE } from "@/lib/handstandDeadline";

let _standaloneInProgress = false;
let _annualInProgress = false;

export async function startStandaloneCheckout(pageState = "handstand_landing") {
  if (_standaloneInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _standaloneInProgress = true;
  try {
    const price = isPreLaunch() ? PRE_LAUNCH_PRICE : REGULAR_PRICE;
    track("begin_checkout", { currency: "USD", plan_type: "handstand_course", page_state: pageState });
    trackMetaAddToCart({ value: price, currency: "USD", planType: "handstand_course", planLabel: "Handstand Course" });
    const res = await base44.functions.invoke("createHandstandCheckout", { ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _standaloneInProgress = false;
  }
}

export async function startAnnualCheckout(pageState = "handstand_landing") {
  if (_annualInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _annualInProgress = true;
  try {
    track("begin_checkout", { currency: "USD", plan_type: "annual", page_state: pageState });
    trackMetaAddToCart({ value: 240, currency: "USD", planType: "annual", planLabel: "Annual Membership" });
    const res = await base44.functions.invoke("createCheckout", { plan: "annual", ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _annualInProgress = false;
  }
}