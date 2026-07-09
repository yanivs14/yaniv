import { useState, useEffect } from "react";
import { loadHsPreContent } from "@/lib/hspreContent";
import HsPreHero from "@/components/hspre/HsPreHero";
import HsPreIntro from "@/components/hspre/HsPreIntro";
import HsPreProgram from "@/components/hspre/HsPreProgram";
import HsPreCta from "@/components/hspre/HsPreCta";

export default function HsPre() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    loadHsPreContent().then(setContent).catch(() => setContent({}));
  }, []);

  if (!content) {
    return <div className="min-h-screen bg-[#0F0F0F]" />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <HsPreHero content={content} />
      <HsPreIntro content={content} />
      <HsPreProgram content={content} />
      <HsPreCta content={content} />
    </div>
  );
}