import React from "react";

/**
 * Renders a heading string with the last word in the global accent (orange) color.
 * The accent color is driven by the admin-controlled --orange-red-rgb CSS variable
 * set on #hs-root, so it automatically respects the global Page Settings accent color.
 */
export default function AccentText({ text }) {
  if (!text) return null;
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= 1) return <>{trimmed}</>;
  return (
    <>
      {words.slice(0, -1).join(" ")}{" "}
      <span className="text-orange-red">{words[words.length - 1]}</span>
    </>
  );
}