import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { SiteLink } from "@/components/common/SiteLink";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import {
  compliance,
  contactRoutes,
  footerNavigation,
  headquarters,
  legal,
  newsletterFrequencies,
  newsletterPreferences,
  site,
  socialLinks,
} from "@/config/site";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<string>(newsletterFrequencies[0] ?? "Weekly");
  const [preferences, setPreferences] = useState<string[]>(["morning-brief"]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const toggle = (id: string) => {
    setPreferences((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (preferences.length === 0) {
      setError("Select at least one newsletter preference.");
      return;
    }
    if (!consent) {
      setError("Please confirm the consent statement to subscribe.");
      return;
    }
    setSubmitting(true);
    await api.audience.subscribeNewsletter(email, preferences, frequency);
    setSubmitting(false);
    setDone(true);
    toast.success("Subscription confirmed", {
      description: `You are subscribed to ${preferences.length} briefing${preferences.length === 1 ? "" : "s"} (${frequency.toLowerCase()}).`,
    });
  };

  if (done) {
    return (
      <div className="rounded-lg border border-brand-gold/50 bg-brand-navy-light/20 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 text-brand-gold" /> Subscription confirmed
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/75">
          A confirmation record has been written to the preview database. You can change frequency
          and preferences at any time — in production this would be a double opt-in email flow.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-white/15 bg-white/5 p-5"
      noValidate
    >
      <h3 className="font-display text-lg font-semibold text-white">Institutional briefings</h3>
      <p className="mt-1 text-xs leading-relaxed text-white/70">
        Choose exactly what arrives, and how often. No preference is pre-selected for commercial
        content.
      </p>
      <label
        className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60"
        htmlFor="footer-email"
      >
        Work email
      </label>
      <input
        id="footer-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@organisation.com"
        className="mt-1.5 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-gold focus:outline-none"
      />
      <fieldset className="mt-4 space-y-2">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
          Preferences
        </legend>
        {newsletterPreferences.map((preference) => (
          <label
            key={preference.id}
            className="flex cursor-pointer items-start gap-2.5 text-xs text-white/80"
          >
            <input
              type="checkbox"
              checked={preferences.includes(preference.id)}
              onChange={() => toggle(preference.id)}
              className="mt-0.5 h-3.5 w-3.5 accent-[#C5A869]"
            />
            <span>
              <span className="font-medium text-white">{preference.label}</span>
              <span className="block text-white/60">{preference.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-4">
        <label
          className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60"
          htmlFor="footer-frequency"
        >
          Frequency
        </label>
        <select
          id="footer-frequency"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value)}
          className="mt-1.5 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
        >
          {newsletterFrequencies.map((option) => (
            <option key={option} value={option} className="text-brand-charcoal">
              {option}
            </option>
          ))}
        </select>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-white/70">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-[#C5A869]"
        />
        I consent to receiving the selected F.M.I.E briefings and understand I can withdraw consent
        at any time by emailing {contactRoutes[0]?.email}.
      </label>
      {error ? <p className="mt-3 text-xs font-medium text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-navy-dark hover:bg-[#d4b87e] disabled:opacity-60"
      >
        {submitting ? "Recording…" : "Subscribe to briefings"}
      </button>
    </form>
  );
}

export function Footer() {
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
          <p
            className={cn(
              "rounded-md border border-brand-gold/40 bg-brand-gold/10 px-4 py-3 text-[11px] leading-relaxed text-white/85",
            )}
          >
            <span className="font-semibold text-brand-gold">Demonstration preview. </span>
            {site.previewNotice}
          </p>
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
