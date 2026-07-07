import { Layers, Scale, Move, Crown, Zap, Wrench } from "lucide-react";

const PHASES = [
  {
    number: "01",
    icon: Layers,
    title: "The Foundation Phase",
    description:
      "Building the absolute core essentials of handbalancing — mastering your body line alignment to unlock effortless balance over raw muscle strain.",
  },
  {
    number: "02",
    icon: Scale,
    title: "Balance Phase",
    description:
      "Applying endurance protocols to wall drills while learning the specific entry mechanics to find and hold your freestanding handstand.",
  },
  {
    number: "03",
    icon: Move,
    title: "Movement Phase",
    description:
      "Practicing foundational shapes inside the handstand to deepen your control and prepare your shoulders for more complex patterns.",
  },
  {
    number: "04",
    icon: Crown,
    title: "Specialist Phase",
    description:
      "Achieving strict mastery over advanced shapes and conditioning the body for the elite transition toward the one-arm handstand.",
  },
];

const EXTRAS = [
  {
    icon: Zap,
    title: "Handstand Elements",
    description:
      "Training advanced, dynamic transitions with a focus on active mobility and movement efficiency, transforming your handstand into a functional platform for complex elements.",
  },
  {
    icon: Wrench,
    title: "Toolbox",
    description:
      "Your go-to repository for supplementary work, covering joint preparation, wrist warm-ups, and the essential mobility drills needed to support your practice.",
  },
];

export default function HsPreProgram() {
  return (
    <section id="program" className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-[#00fff7] text-sm font-body uppercase tracking-[0.3em]">The Program</span>
        <h2 className="font-heading text-5xl md:text-6xl font-extrabold uppercase mt-3">
          Four Phases to Mastery
        </h2>
      </div>

      <div className="grid gap-5">
        {PHASES.map((phase) => {
          const Icon = phase.icon;
          return (
            <div
              key={phase.number}
              className="group flex gap-6 p-7 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#00fff7]/40 transition-colors"
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#00fff7]/10 flex items-center justify-center group-hover:bg-[#00fff7]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#00fff7]" />
                </div>
                <span className="font-heading text-2xl font-bold text-white/20">{phase.number}</span>
              </div>
              <div className="pt-1">
                <h3 className="font-heading text-2xl font-bold uppercase mb-2">{phase.title}</h3>
                <p className="font-body text-white/60 leading-relaxed">{phase.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {EXTRAS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-7 rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#161616] border border-[#2A2A2A] hover:border-[#00fff7]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#00fff7]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#00fff7]" />
              </div>
              <h3 className="font-heading text-xl font-bold uppercase mb-2">{item.title}</h3>
              <p className="font-body text-white/60 leading-relaxed text-sm">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}