import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const btnBase = "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-body transition-colors";
  const btnActive = "bg-orange-red text-dark-bg font-bold";
  const btnIdle = "bg-[#111] border border-[#2a2a2a] text-white-muted hover:border-orange-red hover:text-off-white";
  const btnDisabled = "opacity-40 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${btnIdle} ${currentPage === 1 ? btnDisabled : ""}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btnBase} ${btnIdle}`}>1</button>
          {start > 2 && <span className="text-white-dim px-1">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${p === currentPage ? btnActive : btnIdle}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-white-dim px-1">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={`${btnBase} ${btnIdle}`}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${btnIdle} ${currentPage === totalPages ? btnDisabled : ""}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}