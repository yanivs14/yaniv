import { Sparkles } from "lucide-react";

export default function HsPreCta() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center rounded-2xl bg-gradient-to-br from-[#00fff7]/10 to-transparent border border-[#00fff7]/30 p-12">
        <div className="inline-flex items-center gap-2 bg-[#00fff7]/15 text-[#00fff7] px-4 py-1.5 rounded-full text-sm font-body font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Launch Special
        </div>
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold uppercase mb-4 leading-tight">
          Be the First to Get Access
        </h2>
        <p className="font-body text-lg text-white/70 mb-2">
          Join the pre-launch and enjoy <span className="text-[#00fff7] font-bold">25% off</span> the full price.
        </p>
        <p className="font-body text-sm text-white/40 mb-8">
          Limited spots available — secure your discount before launch day.
        </p>
        <a
          href="#"
          className="inline-block bg-[#00fff7] text-black font-heading font-bold uppercase tracking-wider px-10 py-4 rounded-md hover:bg-[#00ccc6] transition-colors text-lg"
        >
          Claim 25% Off
        </a>
      </div>
    </section>
  );
}