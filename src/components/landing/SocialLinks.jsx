import React from "react";
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Music } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

const ICON_MAP = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Music,
};

export default function SocialLinks({ className = "", showLabels = false, iconSize = "w-5 h-5" }) {
  const { content } = useSiteContent();
  const links = content.social?.links || [];

  if (!links.length) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map((l, i) => {
        const Icon = ICON_MAP[l.icon?.toLowerCase()] || Instagram;
        return (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white-muted hover:text-orange-red transition-colors"
            aria-label={l.platform}
          >
            <Icon className={iconSize} />
            {showLabels && <span className="font-body text-sm">{l.platform}</span>}
          </a>
        );
      })}
    </div>
  );
}