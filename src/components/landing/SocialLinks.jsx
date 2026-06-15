import React from "react";
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
);

const ICON_MAP = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: TikTokIcon,
  email: Mail,
};

export default function SocialLinks({ className = "", showLabels = false, iconSize = "w-5 h-5" }) {
  const { content } = useSiteContent();
  const links = content.social?.links || [];

  if (!links.length) return null;

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {links.map((l, i) => {
        const Icon = ICON_MAP[l.icon?.toLowerCase()] || Instagram;
        return (
          <a
            key={i}
            href={l.icon?.toLowerCase() === "email" ? `mailto:${l.url}` : l.url}
            target={l.icon?.toLowerCase() === "email" ? "_self" : "_blank"}
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