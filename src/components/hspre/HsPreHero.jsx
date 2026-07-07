import { ArrowDown } from "lucide-react";

const HERO_IMAGE = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/15ccebf4a_generated_image.png";

export default function HsPreHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="Athlete performing a handstand" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#0F0F0F]" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <span className="inline-block text-[#00fff7] text-sm font-body uppercase tracking-[0.3em] mb-6">
          Pre-Launch Access
        </span>
        <h1 className="font-heading text-6xl md:text-8xl font-extrabold uppercase leading-[0.9] mb-6">
          Master The<br /><span className="text-[#00fff7]">Handstand</span>
        </h1>
        <p className="font-body text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          A complete progression system — from your first wall hold to elite one-arm mastery.
        </p>
        <a
          href="#program"
          className="inline-flex items-center gap-2 bg-[#00fff7] text-black font-heading font-bold uppercase tracking-wider px-8 py-4 rounded-md hover:bg-[#00ccc6] transition-colors text-lg"
        >
          Explore the Program
          <ArrowDown className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}