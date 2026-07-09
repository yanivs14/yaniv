import { Check, ArrowRight } from "lucide-react";

const DEFAULT_INNER_CIRCLE_FEATURES = [
  "Everything in Monthly/Annual",
  "Personalized plan for your body & goals",
  "Weekly live feedback with Roye",
  "Ongoing adjustments as you progress",
  "Direct support, every step",
  "Limited spots - serious members only",
];

export default function InnerCirclePricingCard({ c, mobile = false }) {
  const features = c.innerCircleFeatures?.length ? c.innerCircleFeatures : DEFAULT_INNER_CIRCLE_FEATURES;

  if (mobile) {
    return (
      <div className="flex-shrink-0 w-[78vw] snap-start bg-dark-bg border border-orange-red/30 rounded-2xl p-5 flex flex-col">
        <p className="font-body text-sm text-orange-red mb-1">Inner Circle</p>
        <h3 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2">
          {c.innerCircleTitle || "Roye, Maxed Out."}
        </h3>
        <p className="font-body text-sm text-white-muted mb-4 leading-relaxed">
          {c.innerCircleDescription}
        </p>
        <ul className="space-y-2 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
              <span className="font-body text-sm text-off-white/80">{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <a
            href="#inner-circle"
            className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-2 font-body text-xs text-white-muted text-center">
            {c.innerCircleFootnote || "Starts with a private consultation."}
          </p>
        </div>
      </div>
    );
  }

  // Desktop: vertical card, same structure as Monthly/Annual
  return (
    <div className="bg-dark-bg border border-orange-red/30 rounded-2xl p-8 flex flex-col">
      <p className="font-body text-sm text-orange-red mb-1">Inner Circle</p>
      <h3 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-3">
        {c.innerCircleTitle || "Roye, Maxed Out."}
      </h3>
      <p className="font-body text-sm text-white-muted leading-relaxed mb-4">
        {c.innerCircleDescription}
      </p>
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
            <span className="font-body text-sm text-off-white/80">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <a
          href="#inner-circle"
          className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
        >
          {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
        </a>
        <p className="mt-2 font-body text-xs text-white-muted text-center">
          {c.innerCircleFootnote || "Starts with a private consultation."}
        </p>
      </div>
    </div>
  );
}