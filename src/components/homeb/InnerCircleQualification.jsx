import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

export default function InnerCircleQualification({ open, onClose, onQualify }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full p-6 lg:p-8 relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white-dim hover:text-off-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
                Inner Circle requires a minimum three-month, four-figure financial commitment. Are you comfortable with this level of pricing?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onQualify}
                  className="flex items-center justify-center gap-2 w-full bg-gold text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors"
                >
                  Yes, continue to application <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="font-body text-sm text-white-muted hover:text-off-white transition-colors py-2"
                >
                  No, explore Annual Membership
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}