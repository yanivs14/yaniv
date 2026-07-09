import { useState, useEffect } from "react";
import { loadHsPreContent, HSPRE_DEFAULTS } from "@/lib/hspreContent";
import HsPreHero from "@/components/hspre/HsPreHero";
import HsPreIntro from "@/components/hspre/HsPreIntro";
import HsPreProgram from "@/components/hspre/HsPreProgram";
import HsPreCta from "@/components/hspre/HsPreCta";

export default function HsPre() {
  const [content, setContent] = useState(HSPRE_DEFAULTS);

  useEffect(() => {
    loadHsPreContent().then(setContent).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <HsPreHero content={content} />
      <HsPreIntro content={content} />
      <HsPreProgram content={content} />
      <HsPreCta content={content} />
    </div>
  );
}