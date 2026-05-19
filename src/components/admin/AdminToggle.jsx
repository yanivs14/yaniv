import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import AdminPanel from "./AdminPanel";

export default function AdminToggle() {
  const { adminMode, setAdminMode } = useSiteContent();

  return (
    <>
      <motion.button
        onClick={() => setAdminMode(!adminMode)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-orange-red text-dark-bg rounded-full flex items-center justify-center shadow-lg hover:bg-orange-red-hover transition-colors"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="Open Site Editor"
      >
        {adminMode ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {adminMode && <AdminPanel onClose={() => setAdminMode(false)} />}
      </AnimatePresence>
    </>
  );
}