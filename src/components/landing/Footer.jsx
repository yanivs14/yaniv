import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-heading text-4xl lg:text-6xl font-bold tracking-widest text-off-white uppercase">
            KINETIQO
          </p>
          <div className="text-center md:text-right">
            <p className="font-body text-sm text-white-muted">
              Kinetiqo by Roye Gold — The movement operating system
            </p>
            <p className="font-body text-xs text-white-dim mt-1">
              © 2026 · Movement, restored.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}