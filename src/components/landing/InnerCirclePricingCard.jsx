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

  // Desktop: compact horizontal card
  return (
    <div className="bg-dark-bg border border-orange-red/30 rounded-2xl p-6 lg:p-8">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left: title + description + CTA */}
        <div>
          <p className="font-body text-sm text-orange-red mb-1">Inner Circle</p>
          <h3 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-3">
            {c.innerCircleTitle || "Roye, Maxed Out."}
          </h3>
          <p className="font-body text-sm text-white-muted leading-relaxed mb-5">
            {c.innerCircleDescription}
          </p>
          <a
            href="#inner-circle"
            className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-2 font-body text-xs text-white-muted">
            {c.innerCircleFootnote || "Starts with a private consultation."}
          </p>
        </div>
        {/* Right: features grid */}
        <div className="lg:col-span-2">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-off-white/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}