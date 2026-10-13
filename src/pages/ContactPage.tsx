import { useState, type FormEvent } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { contactRoutes, headquarters, site, socialLinks } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import type { ContactDepartment } from "@/types";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const SUBJECTS: Record<ContactDepartment, string[]> = {
  general: [
    "Account or access help",
    "Membership and plans",
    "Partnership enquiry",
    "General feedback",
  ],
  editorial: ["News tip", "Correction or clarification", "Contributor pitch", "Right of reply"],
  press: [
    "Book a press release",
    "Quotation or tier question",
    "Distribution scope",
    "Campaign report",
  ],
  services: [
    "Executive profile writing",
    "Digital marketing contract",
    "Pitching & representation",
    "Wikipedia advisory",
  ],
};

export function ContactPage() {
  const search = useSearch({ strict: false }) as { department?: ContactDepartment };
  const { user } = useAuth();
  const initial = contactRoutes.some((route) => route.id === search.department)
    ? (search.department as ContactDepartment)
    : "general";

  const [department, setDepartment] = useState<ContactDepartment>(initial);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    organization: user?.organization ?? "",
    subject: SUBJECTS[initial][0] ?? "General enquiry",
    message: "",
  });

  const route = contactRoutes.find((entry) => entry.id === department) ?? contactRoutes[0]!;

  const selectDepartment = (next: ContactDepartment) => {
    setDepartment(next);
    setForm((current) => ({ ...current, subject: SUBJECTS[next][0] ?? current.subject }));
    setSent(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      toast.error("Enter a valid email address so the desk can reply.");
      return;
    }
    if (form.message.trim().length < 20) {
      toast.error("Add a little more detail — at least 20 characters.");
      return;
    }
    setSending(true);
    const message = await api.audience.submitContactMessage({
      department,
      name: form.name.trim(),
      email: form.email.trim(),
      organization: form.organization.trim() || undefined,
      subject: form.subject,
      message: form.message.trim(),
    });
    setSending(false);
    setSent(true);
    toast.success(`Message routed to ${route.label}`, {
      description: `Logged as ${message.id}. Expected response: ${route.responseTime}. No email is sent in this preview.`,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Contact F.M.I.E"
        title="Four desks, one accountable inbox each"
        description="Choose the desk that matches your enquiry. Every message is logged with a reference, a department and an expected response time, and is visible to the administrator persona."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {contactRoutes.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => selectDepartment(entry.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  department === entry.id
                    ? "border-brand-navy bg-brand-navy/5"
                    : "border-brand-border bg-white hover:border-brand-navy/40",
                )}
              >
                <p className="font-display text-sm font-semibold text-brand-charcoal">
                  {entry.label}
                </p>
                <p className="mt-1 text-xs text-brand-slate">{entry.description}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-brand-navy">
                  <Clock className="h-3 w-3" /> {entry.responseTime}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">
              Write to {route.label.toLowerCase()}
            </h2>
            <p className="mt-1 text-xs text-brand-slate">
              Routed to{" "}
              <a
                href={`mailto:${route.email}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {route.email}
              </a>{" "}
              · {route.telephone}
            </p>

            {sent ? (
              <div className="mt-5 rounded-md border border-success/40 bg-success/8 p-5 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-success" />
                <p className="mt-2 font-display text-base font-semibold text-brand-charcoal">
                  Message logged
                </p>
                <p className="mt-1 text-xs leading-relaxed text-brand-slate">
                  Your enquiry was recorded against {route.label} with an expected response time of{" "}
                  {route.responseTime}. This preview does not send email — the record is stored
                  locally and appears in the administrator panel.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSent(false);
                    setForm({ ...form, message: "" });
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Full name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  className={inputClass}
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  className={inputClass}
                  placeholder="Organisation (optional)"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  aria-label="Subject"
                >
                  {SUBJECTS[department].map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <textarea
                  className={`${inputClass} sm:col-span-2`}
                  rows={7}
                  placeholder="How can the desk help? Include reference numbers for existing campaigns, surveys or orders. *"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-brand-navy text-white hover:bg-brand-navy-light"
                    disabled={sending}
                  >
                    {sending ? "Sending…" : `Send to ${route.email}`}
                  </Button>
                  <p className="mt-2 text-[11px] text-brand-slate">
                    Simulated submission — your message is stored locally, not transmitted.
                  </p>
                </div>
              </div>
            )}
          </form>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">
              What each desk handles
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {contactRoutes.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-brand-border bg-brand-cream/50 p-4"
                >
                  <p className="text-sm font-semibold text-brand-charcoal">{entry.label}</p>
                  <ul className="mt-2 space-y-1">
                    {entry.handles.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-brand-slate">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold-dark">
              <MapPin className="h-4 w-4" /> {headquarters.label}
            </p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-brand-charcoal">
              {headquarters.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="mt-4 flex items-center gap-2 text-sm text-brand-slate">
              <Phone className="h-3.5 w-3.5 text-brand-navy" /> {headquarters.telephone}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-brand-slate">
              <Mail className="h-3.5 w-3.5 text-brand-navy" /> {route.email}
            </p>
            <p className="mt-4 flex items-start gap-2 border-t border-brand-border pt-3 text-xs text-brand-slate">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-navy" /> {headquarters.hours}
            </p>
            <a
              href={headquarters.mapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
            >
              <Building2 className="h-3.5 w-3.5" /> View on map
            </a>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h3 className="font-display text-base font-semibold text-brand-charcoal">
              Before you write
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-slate">
              <li>
                Campaign, survey and order references start with{" "}
                <span className="font-mono">FMIE-PR</span>,{" "}
                <span className="font-mono">FMIE-SRV</span> and{" "}
                <span className="font-mono">FMIE-ORD</span>. Include them and the desk can locate
                the record immediately.
              </li>
              <li>
                Corrections and rights of reply go to the editorial desk and are actioned under the{" "}
                <Link
                  to="/editorial-policy"
                  className="font-semibold text-brand-navy hover:underline"
                >
                  editorial policy
                </Link>
                .
              </li>
              <li>
                Commercial questions about tiers, distribution scope or pricing belong to the press
                desk, not editorial.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h3 className="font-display text-base font-semibold text-brand-charcoal">
              Follow F.M.I.E
            </h3>
            <ul className="mt-3 space-y-2">
              {socialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-between rounded-md border border-brand-border px-3 py-2 text-xs text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy"
                  >
                    <span className="font-semibold">{social.label}</span>
                    <span className="text-brand-slate">{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-brand-slate">
              {site.legalName} · {site.domain}. This preview does not post to social platforms; the
              links open the platform home pages only.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ContactPage;
