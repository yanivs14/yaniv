import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import BookCallModal from "@/components/landing/BookCallModal";

export default function InnerCircleSection() {
  const { content } = useSiteContent();
  const c = content.innerCircle || {};
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <section className="py-12 lg:py-24 bg-dark-bg" id="inner-circle">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">
              {c.eyebrow || "Exclusive"}
            </p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-6">
              {c.headline || "Inner"}<br />
              <span className="text-orange-red">{c.headlineAccent || "Circle."}</span>
            </h2>

            <p className="font-body text-base text-white-muted leading-relaxed mb-5">
              {c.description || "Want a personalized program and direct feedback from Roye and the Movement team?"}
            </p>

            <p className="font-body text-base text-white-muted leading-relaxed mb-5">
              {c.paragraph1 || "Inner Circle is our highest-level coaching experience - built for individuals committed to integrating movement into everyday life, not just workouts."}
            </p>

            <p className="font-body text-base text-white-muted leading-relaxed mb-5">
              {c.paragraph2 || "Get tailored guidance, accountability, technique feedback, and a structured path designed around your goals, limitations, and progression."}
            </p>

            <p className="font-body text-base text-white-muted leading-relaxed mb-8">
              {c.paragraph3 || "This is for people who want deeper practice, higher standards, and real long-term transformation."}
            </p>

            <div className="border-t border-dark-border pt-8">
              <p className="font-body text-sm font-semibold text-off-white mb-2">
                {c.ctaLabel || "Want to learn more?"}
              </p>
              <p className="font-body text-sm text-white-muted mb-6">
                {c.ctaSubtext || "Book a call with one of our movement experts to see if Inner Circle is the right fit for you."}
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                {c.ctaButton || "Book a call"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2 aspect-[3/4] rounded-2xl overflow-hidden bg-dark-surface border border-dark-border"
          >
            {c.imageUrl ? (
              <img src={c.imageUrl} alt="Inner Circle" className="w-full h-full object-cover" />
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