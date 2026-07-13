import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function SeeInsideSection() {
  const { content } = useSiteContent();
  const c = content.homebSeeInside || {};

  return (
    <section className="bg-dark-bg py-12 lg:py-20" id="see-inside">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-3">{c.eyebrow || "This is what you're joining"}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {c.headline || "See How It Works"}
          </h2>
        </motion.div>

        {/* Video / Animation container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden bg-dark-surface border border-dark-border aspect-video max-w-4xl mx-auto"
        >
          {c.videoUrl ? (
            <video src={c.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : c.imageUrl ? (
            <img src={c.imageUrl} alt="See inside" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
              Upload a video or image showing the learning interface
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}