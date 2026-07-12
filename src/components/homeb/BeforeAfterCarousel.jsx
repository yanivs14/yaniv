import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function BeforeAfterCarousel() {
  const { content } = useSiteContent();
  const c = content.homebBeforeAfter || {};
  const scrollRef = useRef(null);

  const items = c.items || [];

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="bg-dark-bg py-12 lg:py-20" id="real-results">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {c.headline || "Real Results, Real Members"}
          </h2>
          <p className="mt-3 font-body text-base text-orange-red">94% feel a shift in week one</p>
        </motion.div>

        {items.length > 0 ? (
          <div className="relative">
            {/* Scroll buttons */}
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-dark-surface border border-dark-border text-off-white hover:border-orange-red hover:text-orange-red transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-dark-surface border border-dark-border text-off-white hover:border-orange-red hover:text-orange-red transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel */}
            <div
              ref={scrollRef}
              className="flex gap-4 lg:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-2 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex-shrink-0 w-[280px] sm:w-[340px] lg:w-[400px] snap-center"
                >
                  <div className="rounded-2xl overflow-hidden border border-dark-border bg-dark-surface">
                    <div className="grid grid-cols-2">
                      {/* Before */}
                      <div className="relative">
                        <div className="aspect-[3/4] bg-dark-bg">
                          {item.beforeImg ? (
                            <img src={item.beforeImg} alt="Before" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white-dim text-xs">Before</div>
                          )}
                        </div>
                        <span className="absolute top-2 left-2 bg-black/70 text-off-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Before</span>
                      </div>
                      {/* After */}
                      <div className="relative">
                        <div className="aspect-[3/4] bg-dark-bg">
                          {item.afterImg ? (
                            <img src={item.afterImg} alt="After" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white-dim text-xs">After</div>
                          )}
                        </div>
                        <span className="absolute top-2 right-2 bg-orange-red text-dark-bg text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">After</span>
                      </div>
                    </div>
                    {item.caption && (
                      <p className="p-4 font-body text-sm text-white-muted text-center">{item.caption}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="rounded-2xl overflow-hidden border border-dark-border bg-dark-surface max-w-2xl mx-auto">
              <img
                src="https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png"
                alt="Movement practice in action"
                className="w-full aspect-video object-cover"
              />
            </div>
            <p className="mt-4 font-body text-sm text-white-dim">Real member transformations — coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}