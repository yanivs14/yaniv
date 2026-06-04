import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import BookCallModal from "@/components/landing/BookCallModal";

export default function InnerCircleSection() {
  const { content } = useSiteContent();
  const c = content.innerCircle || {};
  const [modalOpen, setModalOpen] = useState(false);

  const whatYouGet = c.whatYouGet || [];

  return (
    <>
      <section className="py-12 lg:py-24 bg-dark-bg" id="inner-circle">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">
                {c.eyebrow || "Our Highest Level of Coaching"}
              </p>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] uppercase tracking-tight mb-6">
                <span className="text-off-white">{c.headline || "Inner"} </span><span className="text-orange-red">{c.headlineAccent || "Circle."}</span>
              </h2>

              <p className="font-body text-base text-white-muted leading-relaxed mb-5">
                {c.description}
              </p>
              <p className="font-body text-base text-white-muted leading-relaxed mb-5">
                {c.paragraph1}
              </p>
              {c.paragraph2 && (
                <p className="font-body text-base text-white-muted leading-relaxed mb-5">
                  {c.paragraph2}
                </p>
              )}

              {/* What You Get */}
              {whatYouGet.length > 0 && (
                <div className="mb-8">
                  <p className="font-body text-sm font-bold text-off-white uppercase tracking-widest mb-4">
                    What You Get:
                  </p>
                  <ul className="space-y-3">
                    {whatYouGet.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                        <span className="font-body text-sm text-white-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA block */}
              <div className="border-t border-dark-border pt-8">
                {c.ctaLabel && (
                  <p className="font-body text-sm text-off-white leading-relaxed mb-3">
                    {c.ctaLabel}
                  </p>
                )}
                {c.ctaSubtext && (
                  <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
                    {c.ctaSubtext}
                  </p>
                )}
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
                >
                  {c.ctaButton || "Apply for Inner Circle"}
                </button>
                {c.ctaFootnote && (
                  <p className="font-body text-xs text-white-dim mt-3">{c.ctaFootnote}</p>
                )}
              </div>
            </motion.div>

            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2 rounded-2xl overflow-hidden"
            >
              {c.imageUrl ? (
                <img src={c.imageUrl} alt="Inner Circle" className="w-full h-auto object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
                  No image yet
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <BookCallModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}