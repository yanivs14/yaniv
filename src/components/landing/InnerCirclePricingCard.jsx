import { Check, ArrowRight, Crown } from "lucide-react";

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
      <div className="flex-shrink-0 w-[78vw] snap-start relative rounded-2xl p-px bg-gradient-to-b from-orange-red/50 via-orange-red/15 to-transparent flex flex-col">
        <div className="relative bg-dark-bg rounded-2xl p-5 flex flex-col overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-red/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-orange-red/15 border border-orange-red/30 rounded-full px-2.5 py-1 w-fit mb-3">
              <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
              <span className="font-body text-[9px] font-semibold text-orange-red uppercase tracking-wider">Limited Spots</span>
            </div>
            <h3 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2">
              {c.innerCircleTitle || "Roye, Maxed Out."}
            </h3>
            <p className="font-body text-sm text-white-muted mb-4 leading-relaxed">
              {c.innerCircleDescription}
            </p>
          </div>
          <div className="relative my-3 h-px bg-gradient-to-r from-transparent via-orange-red/30 to-transparent" />
          <ul className="relative space-y-2 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-off-white/90">{f}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-5">
            <a
              href="#inner-circle"
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-2 font-body text-xs text-white-muted text-center">
              {c.innerCircleFootnote || "Starts with a private consultation."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: premium card with glow + gradient border
  return (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-orange-red/50 via-orange-red/15 to-transparent flex flex-col">
      <div className="relative bg-dark-bg rounded-2xl p-8 flex flex-col overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Limited spots badge */}
          <div className="flex items-center gap-1.5 bg-orange-red/15 border border-orange-red/30 rounded-full px-3 py-1 w-fit mb-3">
            <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
            <span className="font-body text-[10px] font-semibold text-orange-red uppercase tracking-wider">Limited Spots</span>
          </div>
          <h3 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-3">
            {c.innerCircleTitle || "Roye, Maxed Out."}
          </h3>
          <p className="font-body text-sm text-white-muted leading-relaxed mb-4">
            {c.innerCircleDescription}
          </p>
        </div>

        <div className="relative my-4 h-px bg-gradient-to-r from-transparent via-orange-red/30 to-transparent" />

        <ul className="relative space-y-2.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
              <span className="font-body text-sm text-off-white/90">{f}</span>
            </li>
          ))}
        </ul>
        <div className="relative mt-6">
          <a
            href="#inner-circle"
            className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors shadow-lg shadow-orange-red/20"
          >
            {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-2 font-body text-xs text-white-muted text-center">
            {c.innerCircleFootnote || "Starts with a private consultation."}
          </p>
        </div>
      </div>
    </div>
  );
}