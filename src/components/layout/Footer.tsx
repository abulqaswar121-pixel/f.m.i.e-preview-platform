
import { SiteLink } from "@/components/common/SiteLink";
import { useDatabase } from "@/services/api";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import {
  compliance,
  contactRoutes,
  footerNavigation,
  headquarters,
  offices,
  legal,
  site,
  socialLinks,
} from "@/config/site";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-white">Email updates</h3>
      <p className="text-sm leading-relaxed text-white/70">Email briefings are not open yet.</p>
      <p className="text-xs leading-relaxed text-white/70">Follow F.M.I.E on our official social pages for updates.</p>
    </div>
  );
}

export function Footer() {
  const database = useDatabase();
  return (
    <footer className="bg-brand-navy-dark text-white">
      <div className="fmie-container grid gap-10 py-14 lg:grid-cols-[1.15fr_2fr_1.15fr]">
        <div>
          <Logo tone="light" compact showTagline />
          <p className="mt-5 text-sm leading-relaxed text-white/70">{site.description}</p>
          <address className="mt-5 space-y-2 text-xs not-italic text-white/70">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" />
              <span>{headquarters.addressOneLine}</span>
            </p>
            <p className="pl-5.5 text-white/60">
              Also in {offices.slice(1).map((item) => item.city).join(", ")}.
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-brand-gold" />
              {headquarters.telephone}
            </p>
            {contactRoutes.map((route) => (
              <p key={route.id} className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-gold" />
                <a href={`mailto:${route.email}`} className="hover:text-brand-gold">
                  {route.email}
                </a>
              </p>
            ))}
          </address>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/70 hover:border-brand-gold hover:text-brand-gold"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerNavigation.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.to}-${link.label}`}>
                    <SiteLink
                      to={link.to}
                      search={link.search}
                      hash={link.hash}
                      className="text-xs text-white/75 hover:text-white hover:underline"
                    >
                      {link.label}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <NewsletterForm />
      </div>

      <div className="border-t border-white/10">
        <div className="fmie-container space-y-3 py-6">
          <ul className="space-y-1.5">
            {legal.notices.map((notice) => (
              <li key={notice} className="text-[11px] leading-relaxed text-white/55">
                {notice}
              </li>
            ))}
            <li className="text-[11px] leading-relaxed text-white/55">
              {compliance.noAffiliation}
            </li>
          </ul>
          <div className="flex flex-col gap-2 pt-2 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>{legal.copyright}</p>
            <p>{legal.registeredOffice}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
