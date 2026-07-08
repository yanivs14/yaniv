export default function HsPreIntro({ content }) {
  const c = content || {};
  return (
    <section className="py-24 px-6 max-w-3xl mx-auto">
      <p className="font-body text-lg md:text-2xl text-white/80 leading-relaxed text-center">
        {c.introP1Before}<span className="text-[#00fff7] font-semibold">{c.introP1Highlight}</span>{c.introP1After}
      </p>
      <p className="font-body text-lg md:text-xl text-white/50 leading-relaxed text-center mt-8">
        {c.introP2}
      </p>
    </section>
  );
}