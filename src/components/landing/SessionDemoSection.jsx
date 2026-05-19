import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const SESSION_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/316e3cc6a_generated_48b25648.png";

export default function SessionDemoSection() {
  return (
    <section className="py-20 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-body text-sm text-text-muted-warm uppercase tracking-widest mb-4">
            Try a sample · 22-second demo
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-warm-black">
            Experience what a<br />
            <em className="italic">session</em> feels like.
          </h2>
          <p className="mt-6 font-body text-base text-text-muted-warm max-w-lg leading-relaxed">
            Five cues. Conscious breath. Deliberate movement. This is the rhythm of every Kinetiqo practice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden aspect-video bg-warm-black group cursor-pointer"
        >
          <img
            src={SESSION_IMG}
            alt="Meditation and breathing session demo"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-orange-red rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6">
            <p className="font-body text-sm text-white/80">Day session · Standing flow</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}