import React from "react";
import { Trophy } from "lucide-react";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

export default function UserRanking({ rankings, currentUserName }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1D2120]/5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#1D2120]" />
          <h3 className="font-bold text-[#1D2120] text-lg" style={{ fontFamily: FONT_HEADING }}>Top Contributors</h3>
        </div>
        <p className="text-[#6B6B6B] text-sm">Be the first to contribute!</p>
      </div>
    );
  }

  const topUsers = rankings.slice(0, 5);
  const medalColors = [
    "bg-[#D4F658] text-[#1D2120]",
    "bg-[#1D2120]/10 text-[#1D2120]",
    "bg-[#1D2120]/5 text-[#6B6B6B]",
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1D2120]/5 lg:sticky lg:top-24">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-[#1D2120]" />
        <h3 className="font-bold text-[#1D2120] text-lg" style={{ fontFamily: FONT_HEADING }}>Top Contributors</h3>
      </div>
      <div className="space-y-3">
        {topUsers.map((u, i) => (
          <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${u.name === currentUserName ? "bg-[#D4F658]/10" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? medalColors[i] : "bg-[#1D2120]/5 text-[#6B6B6B]"}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1D2120] truncate">{u.name}</p>
              <p className="text-xs text-[#6B6B6B]">{u.total} {u.total === 1 ? "post" : "posts"}</p>
            </div>
            {u.name === currentUserName && (
              <span className="text-[10px] font-bold text-[#1D2120] bg-[#D4F658] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}