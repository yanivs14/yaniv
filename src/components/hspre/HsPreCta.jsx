export default function HsPreCta({ content }) {
  const c = content || {};
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center rounded-2xl bg-gradient-to-br from-[#00fff7]/10 to-transparent border border-[#00fff7]/30 p-12">
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold uppercase mb-4 leading-tight">
          {c.ctaTitle}
        </h2>
        <p className="font-body text-lg text-white/70 mb-2">
          {c.ctaDesc1Before}<span className="text-[#00fff7] font-bold">{c.ctaDesc1Highlight}</span>{c.ctaDesc1After}
        </p>
        <p className="font-body text-sm text-white/40 mb-8">
          {c.ctaDesc2}
        </p>
        <a
          href={c.ctaButtonLink || "#"}
          className="inline-block bg-[#00fff7] text-black font-heading font-bold uppercase tracking-wider px-10 py-4 rounded-md hover:bg-[#00ccc6] transition-colors text-lg"
        >
          {c.ctaButtonText}
        </a>
      </div>
    </section>
  );
}