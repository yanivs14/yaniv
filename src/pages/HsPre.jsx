import HsPreHero from "@/components/hspre/HsPreHero";
import HsPreIntro from "@/components/hspre/HsPreIntro";
import HsPreProgram from "@/components/hspre/HsPreProgram";
import HsPreCta from "@/components/hspre/HsPreCta";

export default function HsPre() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <HsPreHero />
      <HsPreIntro />
      <HsPreProgram />
      <HsPreCta />
    </div>
  );
}