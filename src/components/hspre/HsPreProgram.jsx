import { Layers, Scale, Move, Crown, Zap, Wrench } from "lucide-react";
import HsPreLeadForm from "@/components/hspre/HsPreLeadForm";

const PHASE_ICONS = [Layers, Scale, Move, Crown];
const EXTRA_ICONS = [Zap, Wrench];

export default function HsPreProgram({ content }) {
  const c = content || {};
  const phases = c.phases || [];
  const extras = c.extras || [];

  return (
    <section id="program" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-10 sm:mb-16">
        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase">
          {c.programTitle}
        </h2>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {phases.map((phase, i) => {
          const Icon = PHASE_ICONS[i] || Layers;
          return (
            <div
              key={i}
              className="group flex gap-4 sm:gap-6 p-5 sm:p-7 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#00fff7]/40 transition-colors"
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#00fff7]/10 flex items-center justify-center group-hover:bg-[#00fff7]/20 transition-colors">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00fff7]" />
                </div>
                <span className="font-heading text-xl sm:text-2xl font-bold text-white/20">{phase.number}</span>
              </div>
              <div className="pt-0.5 sm:pt-1 min-w-0">
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase mb-2">{phase.title}</h3>
                <p className="font-body text-sm sm:text-base text-white/60 leading-relaxed">{phase.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5">
        {extras.map((item, i) => {
          const Icon = EXTRA_ICONS[i] || Zap;
          return (
            <div
              key={i}
              className="p-5 sm:p-7 rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#161616] border border-[#2A2A2A] hover:border-[#00fff7]/40 transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00fff7]/10 flex items-center justify-center mb-3 sm:mb-4">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00fff7]" />
              </div>
              <h3 className="font-heading text-lg sm:text-xl font-bold uppercase mb-2">{item.title}</h3>
              <p className="font-body text-sm text-white/60 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Lead capture form — below Toolbox */}
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-[#1e1e1e]">
        <HsPreLeadForm content={content} />
      </div>
    </section>
  );
}