import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function BenefitsSection() {
  const { content } = useSiteContent();
  const c = content?.homebBenefits || {};
  const pillars = c.pillars || [];
  if (!content) return null;

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="benefits">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Left: heading + pillars grid */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
                {c.headline1 || "The Program's"}<br />
                {c.headlineAccent && <span className="text-orange-red">{c.headlineAccent}</span>}
              </h2>
            </motion.div>

            {/* Pillars grid — 2x2 */}
            <div className="mt-10 grid grid-cols-2 gap-0 border-t border-l border-dark-border flex-1">
              {pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative pt-6 pb-8 px-6 border-dark-border border-r border-b flex flex-col justify-center"
                >
                  <div className="text-2xl text-orange-red mb-4 inline-block">{p.icon}</div>
                  <h3 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-2">{p.title}</h3>
                  <p className="font-body text-sm sm:text-base text-white-muted leading-snug">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: vertical image with overlay */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface"
          >
            {c.imageUrl ? (
              <img src={c.imageUrl} alt="Benefits" className="w-full h-full object-cover" loading="lazy" />
            ) : c.videoUrl ? (
              <video src={c.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">No media yet</div>
            )}

            {/* Text overlay */}
            {c.imageOverlay && (
              <p className="absolute top-6 left-6 font-body text-sm text-off-white font-medium">{c.imageOverlay}</p>
            )}

            {/* Arrow icon */}
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-orange-red flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-dark-bg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}