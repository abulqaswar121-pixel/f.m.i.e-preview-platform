import { Facebook, Instagram, Linkedin, Music2 } from "lucide-react";

import { socialLinks } from "@/config/site";
import { cn } from "@/lib/utils";

const ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Music2,
} as const;

interface SocialIconLinksProps {
  className?: string;
  iconClassName?: string;
}

/** The official F.M.I.E social profiles, straight from `src/config/site.ts`. */
export function SocialIconLinks({ className, iconClassName }: SocialIconLinksProps) {
  return (
    <span className={cn("flex", className)}>
      {socialLinks.map((social) => {
        const Icon = ICONS[social.id as keyof typeof ICONS] ?? Music2;
        return (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`F.M.I.E on ${social.label}`}
            title={`${social.label} — ${social.handle}`}
            className="text-current transition-colors hover:text-brand-gold"
          >
            <Icon className={cn("h-4 w-4", iconClassName)} />
          </a>
        );
      })}
    </span>
  );
}

export default SocialIconLinks;
