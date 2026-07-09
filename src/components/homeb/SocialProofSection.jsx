import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function SocialProofSection() {
  const { content } = useSiteContent();
  const stats = content.homebSocialProof?.stats || [
    { value: "1.5M+", label: "Social Media Followers" },
    { value: "1k+", label: "Guided Videos" },
    { value: "15+", label: "Years Coaching Members" },
    { value: "1st", label: "Official Movement School in the World" },
  ];

  return (
    <section className="bg-dark-bg py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="rounded-2xl bg-dark-surface border border-dark-border py-8 lg:py-12 px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center relative"
              >
                {i > 0 && <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-dark-border" />}
                <p className="font-heading text-5xl lg:text-7xl font-bold text-orange-red leading-none tracking-tight">
                  {s.value}
                </p>
                <p className="mt-2 lg:mt-3 font-body text-[10px] lg:text-xs text-white-muted uppercase tracking-[0.2em] leading-tight px-2">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}