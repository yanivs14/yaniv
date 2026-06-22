import React from "react";
import { Link } from "react-router-dom";

export default function PromoNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-center h-16">
        <Link to="/" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase hover:text-orange-red transition-colors">
          The Movement
        </Link>
      </div>
    </nav>
  );
}