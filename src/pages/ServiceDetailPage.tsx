import { useState, type FormEvent } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, KeyedList, PageHeader } from "@/components/common/Primitives";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { budgetBands, contactEmail, countries } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const TIMEZONES = [
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Asia/Dubai",
  "America/New_York",
];
const SLOTS = [
  "Weekday morning (09:00–12:00)",
  "Weekday afternoon (13:00–17:00)",
  "Early evening (17:00–19:00)",
];

export function ServiceDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const service = useAsyncResource(() => api.services.getBySlug(slug), undefined, [slug]);
  const { user } = useAuth();
  const [tab, setTab] = useState("consultation");
  const [sent, setSent] = useState<"consultation" | "enquiry" | null>(null);

  const [consultation, setConsultation] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    organization: user?.organization ?? "",
    timezone: TIMEZONES[0] ?? "Europe/London",
    preferredSlot: SLOTS[0] ?? "Weekday morning (09:00–12:00)",
    agenda: "",
  });

  const [enquiry, setEnquiry] = useState<{
    name: string;
    email: string;
    organization: string;
    country: string;
    budgetBand: string;
    preferredDate: string;
    message: string;
  }>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    organization: user?.organization ?? "",
    country: countries[0] ?? "United Kingdom",
    budgetBand: budgetBands[0] ?? "To be scoped",
    preferredDate: "",
    message: "",
  });

  const data = service.data;

  if (service.loading) {
    return (
      <div className="fmie-container py-16">
        <div className="h-9 w-2/3 animate-pulse rounded bg-brand-slate/15" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fmie-container py-20">
        <EmptyState
          title="Service not found"
          description="The service may have been renamed. Browse the current directory instead."
          action={{ label: "All services", to: "/services" }}
        />
      </div>
    );
  }

  const submitConsultation = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(consultation.email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (consultation.agenda.trim().length < 20) {
      toast.error(
        "Give the desk a short agenda (at least 20 characters) so the right specialist joins.",
      );
      return;
    }
    await api.services.bookConsultation({ ...consultation, serviceId: data.id });
    setSent("consultation");
    toast.success("Consultation requested", {
      description: "A specialist will confirm a slot by email within one working day.",
    });
  };

  const submitEnquiry = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(enquiry.email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (enquiry.message.trim().length < 30) {
      toast.error("Describe what you need in a little more detail (at least 30 characters).");
      return;
    }
    if (!enquiry.preferredDate) {
      toast.error("Add a preferred start date so the desk can scope availability.");
      return;
    }
    await api.services.submitEnquiry({ ...enquiry, serviceId: data.id });
    setSent("enquiry");
    toast.success("Enquiry received", {
      description: `Routed to ${contactEmail.services} with your reference.`,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Professional services"
        title={data.title}
        description={data.tagline}
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Services", to: "/services" },
          { label: data.title },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {data.engagementTypes.map((engagement) => (
            <Badge key={engagement} tone="cream">
              {engagement}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-brand-charcoal">
              About this engagement
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">{data.description}</p>
            <p className="mt-4 rounded-md border border-brand-border bg-white px-4 py-3 text-sm text-brand-slate">
              <span className="font-semibold text-brand-charcoal">Target audience: </span>
              {data.targetAudience}
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-charcoal">Deliverables</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.deliverables.map((deliverable) => (
                <li
                  key={deliverable}
                  className="flex gap-2 rounded-md border border-brand-border bg-white px-4 py-3 text-xs leading-relaxed text-brand-slate"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {deliverable}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-charcoal">Workflow</h2>
            <ol className="mt-4 space-y-4">
              {data.processSteps.map((step) => (
                <li
                  key={step.step}
                  className="flex gap-4 rounded-lg border border-brand-border bg-white p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display text-sm font-bold text-white">
                    {step.step}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-baseline gap-2 text-sm font-semibold text-brand-charcoal">
                      {step.title}
                      <span className="text-[11px] font-normal text-brand-slate">
                        {step.duration}
                      </span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-brand-slate">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <KeyedList
            items={[
              { label: "Timeline", value: data.timeline },
              { label: "Pricing", value: data.pricingNote },
              { label: "Disclosure", value: data.disclosure },
            ]}
          />

          {data.complianceWarning ? <ComplianceBanner variant="pitching" /> : null}
          {data.slug.includes("wikipedia") ? <ComplianceBanner variant="wikipedia" /> : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-brand-border bg-white p-5">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full rounded-lg border border-brand-border bg-brand-cream p-1">
                <TabsTrigger value="consultation" className="flex-1">
                  Book consultation
                </TabsTrigger>
                <TabsTrigger value="enquiry" className="flex-1">
                  Send enquiry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="consultation" className="mt-4">
                {sent === "consultation" ? (
                  <div className="rounded-md border border-success/40 bg-success/8 p-4 text-center">
                    <CalendarCheck className="mx-auto h-8 w-8 text-success" />
                    <p className="mt-2 text-sm font-semibold text-brand-charcoal">
                      Consultation requested
                    </p>
                    <p className="mt-1 text-xs text-brand-slate">
                      The desk will confirm a slot by email. This is a simulated booking — no
                      calendar invite is sent.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSent(null)}
                    >
                      Book another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submitConsultation} className="space-y-3">
                    <input
                      className={inputClass}
                      placeholder="Full name"
                      value={consultation.name}
                      onChange={(e) => setConsultation({ ...consultation, name: e.target.value })}
                      required
                    />
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="Work email"
                      value={consultation.email}
                      onChange={(e) => setConsultation({ ...consultation, email: e.target.value })}
                      required
                    />
                    <input
                      className={inputClass}
                      placeholder="Organisation"
                      value={consultation.organization}
                      onChange={(e) =>
                        setConsultation({ ...consultation, organization: e.target.value })
                      }
                    />
                    <select
                      className={inputClass}
                      value={consultation.timezone}
                      onChange={(e) =>
                        setConsultation({ ...consultation, timezone: e.target.value })
                      }
                    >
                      {TIMEZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputClass}
                      value={consultation.preferredSlot}
                      onChange={(e) =>
                        setConsultation({ ...consultation, preferredSlot: e.target.value })
                      }
                    >
                      {SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className={inputClass}
                      rows={4}
                      placeholder="What should the consultation cover?"
                      value={consultation.agenda}
                      onChange={(e) => setConsultation({ ...consultation, agenda: e.target.value })}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                    >
                      Request consultation
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="enquiry" className="mt-4">
                {sent === "enquiry" ? (
                  <div className="rounded-md border border-success/40 bg-success/8 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                    <p className="mt-2 text-sm font-semibold text-brand-charcoal">
                      Enquiry received
                    </p>
                    <p className="mt-1 text-xs text-brand-slate">
                      A written summary and next-step proposal follow within one working day.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSent(null)}
                    >
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submitEnquiry} className="space-y-3">
                    <input
                      className={inputClass}
                      placeholder="Full name"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      required
                    />
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="Work email"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      required
                    />
                    <input
                      className={inputClass}
                      placeholder="Organisation"
                      value={enquiry.organization}
                      onChange={(e) => setEnquiry({ ...enquiry, organization: e.target.value })}
                    />
                    <select
                      className={inputClass}
                      value={enquiry.country}
                      onChange={(e) => setEnquiry({ ...enquiry, country: e.target.value })}
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputClass}
                      value={enquiry.budgetBand}
                      onChange={(e) => setEnquiry({ ...enquiry, budgetBand: e.target.value })}
                    >
                      {budgetBands.map((band) => (
                        <option key={band} value={band}>
                          {band}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs text-brand-slate">
                      Preferred start date
                      <input
                        className={`${inputClass} mt-1`}
                        type="date"
                        value={enquiry.preferredDate}
                        onChange={(e) => setEnquiry({ ...enquiry, preferredDate: e.target.value })}
                      />
                    </label>
                    <textarea
                      className={inputClass}
                      rows={5}
                      placeholder="Describe the engagement you have in mind"
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      required
                    />
                    <Button type="submit" variant="outline" className="w-full">
                      Send enquiry
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-cream p-5 text-xs leading-relaxed text-brand-slate">
            <p className="font-semibold text-brand-charcoal">How engagements are priced</p>
            <p className="mt-2">{data.pricingNote}</p>
            <p className="mt-3 border-t border-brand-border pt-3">
              Every engagement is scoped in writing before work begins, with a named owner and dated
              deliverables. Questions before booking? Write to{" "}
              <Link
                to="/contact"
                search={{ department: "services" }}
                className="font-semibold text-brand-navy hover:underline"
              >
                the services desk
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
