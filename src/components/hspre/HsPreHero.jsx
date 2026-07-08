import { ArrowDown } from "lucide-react";

export default function HsPreHero({ content }) {
  const c = content || {};
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={c.heroImage} alt="Athlete performing a handstand" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#0F0F0F]" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-heading text-6xl md:text-8xl font-extrabold uppercase leading-[0.9] mb-6">
          {c.heroTitleLine1}<br /><span className="text-[#00fff7]">{c.heroTitleHighlight}</span>
        </h1>
        <p className="font-body text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          {c.heroDescription}
        </p>
        <a
          href={c.heroCtaLink || "#program"}
          className="inline-flex items-center gap-2 bg-[#00fff7] text-black font-heading font-bold uppercase tracking-wider px-8 py-4 rounded-md hover:bg-[#00ccc6] transition-colors text-lg"
        >
          {c.heroCtaText}
          <ArrowDown className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}