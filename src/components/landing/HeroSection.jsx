import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
              Your body<br />
              was <span className="text-orange-red">built</span><br />
              to move.
            </h1>
            <p className="mt-8 font-body text-base lg:text-lg text-white-muted max-w-md leading-relaxed">
              We pay attention to movement only after we lose it. A guided, daily method to rebuild your physical foundation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 font-body text-sm text-white-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-red rounded-full" />
                No equipment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-red rounded-full" />
                Cancel anytime
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-orange-red text-white font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                Start moving
              </a>
              <a
                href="#method"
                className="inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim"
              >
                Take the 60-second quiz now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden aspect-[3/4]">
              <img
                src={HERO_IMG}
                alt="Person doing a flowing mobility exercise"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}