import React from "react";

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-cream-dark/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-warm-black">
              KINETIQO
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-body text-sm text-text-muted-warm">
              Kinetiqo by Roye Gold — The movement operating system
            </p>
            <p className="font-body text-xs text-text-muted-warm/60 mt-1">
              © 2026 · Movement, restored.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}