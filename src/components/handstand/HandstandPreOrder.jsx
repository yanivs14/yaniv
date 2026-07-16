import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";
import PreOrderHero from "@/components/handstand/preorder/PreOrderHero";
import PreOrderCurriculum from "@/components/handstand/preorder/PreOrderCurriculum";
import PreOrderClosing from "@/components/handstand/preorder/PreOrderClosing";

let _checkoutInProgress = false;
async function startPreOrderCheckout() {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track("begin_checkout", { currency: "USD", plan_type: "handstand_preorder", page_state: "handstand_preorder" });
    const res = await base44.functions.invoke("createHandstandCheckout", { ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function HandstandPreOrder({ config, onUpdateVideo }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await startPreOrderCheckout();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <PreOrderHero config={config} onCheckout={handleCheckout} loading={loading} onUpdateVideo={onUpdateVideo} />
      <PreOrderCurriculum />
      <PreOrderClosing config={config} onCheckout={handleCheckout} loading={loading} />
    </div>
  );
}