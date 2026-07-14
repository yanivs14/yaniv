import React from "react";
import { Check } from "lucide-react";

export default function GdprConsent({ id, checked, onChange }) {
  return (
    <div className="flex items-start gap-3">
      {/* Custom styled checkbox */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className="flex items-center justify-center w-4 h-4 rounded border cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: checked ? "#00fff7" : "transparent",
            borderColor: checked ? "#00fff7" : "#444",
          }}
        >
          {checked && <Check className="w-2.5 h-2.5 text-[#0a0a0a]" strokeWidth={3} />}
        </label>
      </div>
      <label htmlFor={id} className="font-body text-[11px] text-[#aaa] leading-relaxed cursor-pointer">
        I agree to the processing of my personal data in accordance with our{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-white-muted hover:text-off-white transition-colors"
          onClick={e => e.stopPropagation()}
        >
          privacy policy
        </a>
        . You can unsubscribe at any time.
      </label>
    </div>
  );
}