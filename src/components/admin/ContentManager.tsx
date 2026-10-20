import { useState } from "react";
import { Eye, EyeOff, Pencil, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { api, useDatabase } from "@/services/api";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-brand-charcoal">{title}</h3>
      <p className="mt-1 text-xs text-brand-slate">{hint}</p>
    </div>
  );
}

function RowShell({
  title,
  meta,
  hidden,
  editing,
  onEdit,
  onHide,
  onDelete,
  children,
}: {
  title: string;
  meta: string;
  hidden?: boolean | undefined;
  editing: boolean;
  onEdit: () => void;
  onHide: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="fmie-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-charcoal">{title}</p>
          <p className="mt-0.5 text-[11px] text-brand-slate">{meta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hidden ? <Badge tone="cream">Hidden</Badge> : null}
          <Button size="sm" variant="outline" onClick={onEdit} aria-expanded={editing}>
            <Pencil className="mr-1 h-3 w-3" /> {editing ? "Close" : "Edit"}
          </Button>
          <Button size="sm" variant="outline" onClick={onHide}>
            {hidden ? (
              <>
                <Eye className="mr-1 h-3 w-3" /> Unhide
              </>
            ) : (
              <>
                <EyeOff className="mr-1 h-3 w-3" /> Hide
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={confirming ? "border-red-400 text-red-600" : undefined}
            onClick={() => {
              if (!confirming) {
                setConfirming(true);
                setTimeout(() => setConfirming(false), 3000);
                return;
              }
              setConfirming(false);
              onDelete();
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" /> {confirming ? "Confirm?" : "Delete"}
          </Button>
        </div>
      </div>
      {editing ? (
        <div className="mt-4 space-y-3 border-t border-brand-border pt-4">{children}</div>
      ) : null}
    </li>
  );
}

/**
 * Client self-service content manager: every public entity can be viewed,
 * edited, hidden/unhidden and deleted from here — no developer required.
 * Hidden items disappear from the public site but stay listed here.
 */
export function ContentManagerPanel() {
  const database = useDatabase();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  function startEdit(id: string, fields: Record<string, string>): void {
    setEditing(editing === id ? null : id);
    setDraft(fields);
  }
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  async function hide(
    kind: "article" | "survey" | "product" | "service" | "channel" | "press",
    id: string,
    hidden: boolean,
  ): Promise<void> {
    try {
      if (kind === "article") await api.contentAdmin.updateArticle(id, { hidden: !hidden });
      if (kind === "survey") await api.contentAdmin.updateSurvey(id, { hidden: !hidden });
      if (kind === "product") await api.contentAdmin.updateProduct(id, { hidden: !hidden });
      if (kind === "service") await api.contentAdmin.updateService(id, { hidden: !hidden });
      if (kind === "channel") await api.pressReleases.updateChannel(id, { hidden: !hidden });
      if (kind === "press") await api.contentAdmin.updatePressRelease(id, { hidden: !hidden });
      toast.success(hidden ? "Now visible on the site." : "Hidden from the site.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">Content manager</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
          View, edit, hide, unhide and delete anything on the public site from this page. Hiding
          keeps the record here but removes it from every public list; deleting removes it
          permanently from this demonstration database.
        </p>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Newsroom articles"
          hint="Edit headline/subtitle, hide from the news desk or delete."
        />
        <ul className="space-y-3">
          {database.articles.map((article) => (
            <RowShell
              key={article.id}
              title={article.title}
              meta={`${article.category} · ${article.contentType} · ${article.hidden ? "hidden" : "live"}`}
              hidden={article.hidden}
              editing={editing === article.id}
              onEdit={() =>
                startEdit(article.id, {
                  title: article.title,
                  subtitle: article.subtitle,
                  featuredImage: article.featuredImage,
                })
              }
              onHide={() => void hide("article", article.id, Boolean(article.hidden))}
              onDelete={() =>
                void api.contentAdmin
                  .removeArticle(article.id)
                  .then(() => toast.success("Article deleted."))
              }
            >
              <label className="block text-xs font-semibold text-brand-slate">
                Headline
                <input
                  className={inputClass}
                  value={draft["title"] ?? ""}
                  onChange={set("title")}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Subtitle
                <input
                  className={inputClass}
                  value={draft["subtitle"] ?? ""}
                  onChange={set("subtitle")}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Cover image path
                <input
                  className={inputClass}
                  value={draft["featuredImage"] ?? ""}
                  onChange={set("featuredImage")}
                />
              </label>
              <Button
                size="sm"
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                onClick={() =>
                  void api.contentAdmin
                    .updateArticle(article.id, {
                      title: draft["title"] ?? article.title,
                      subtitle: draft["subtitle"] ?? article.subtitle,
                      featuredImage: draft["featuredImage"] ?? article.featuredImage,
                    })
                    .then(() => toast.success("Article updated."))
                }
              >
                <Save className="mr-1 h-3 w-3" /> Save changes
              </Button>
            </RowShell>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Surveys"
          hint="Hide a survey from the marketplace, rename it, or delete it."
        />
        <ul className="space-y-3">
          {database.surveys.map((survey) => (
            <RowShell
              key={survey.id}
              title={survey.title}
              meta={`${survey.category} · ${survey.status} · ${survey.tier}`}
              hidden={survey.hidden}
              editing={editing === survey.id}
              onEdit={() =>
                startEdit(survey.id, { title: survey.title, objective: survey.objective })
              }
              onHide={() => void hide("survey", survey.id, Boolean(survey.hidden))}
              onDelete={() =>
                void api.contentAdmin
                  .removeSurvey(survey.id)
                  .then(() => toast.success("Survey deleted."))
              }
            >
              <label className="block text-xs font-semibold text-brand-slate">
                Title
                <input
                  className={inputClass}
                  value={draft["title"] ?? ""}
                  onChange={set("title")}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Objective
                <input
                  className={inputClass}
                  value={draft["objective"] ?? ""}
                  onChange={set("objective")}
                />
              </label>
              <Button
                size="sm"
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                onClick={() =>
                  void api.contentAdmin
                    .updateSurvey(survey.id, {
                      title: draft["title"] ?? survey.title,
                      objective: draft["objective"] ?? survey.objective,
                    })
                    .then(() => toast.success("Survey updated."))
                }
              >
                <Save className="mr-1 h-3 w-3" /> Save changes
              </Button>
            </RowShell>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Shop products"
          hint="Reprice merch, hide it from the shop, or delete it."
        />
        <ul className="space-y-3">
          {database.products.map((product) => (
            <RowShell
              key={product.id}
              title={product.name}
              meta={`${product.category} · $${product.price} · ${product.hidden ? "hidden" : "live"}`}
              hidden={product.hidden}
              editing={editing === product.id}
              onEdit={() =>
                startEdit(product.id, {
                  name: product.name,
                  price: String(product.price),
                  priceNaira: String(product.priceNaira ?? ""),
                })
              }
              onHide={() => void hide("product", product.id, Boolean(product.hidden))}
              onDelete={() =>
                void api.contentAdmin
                  .removeProduct(product.id)
                  .then(() => toast.success("Product deleted."))
              }
            >
              <label className="block text-xs font-semibold text-brand-slate">
                Name
                <input className={inputClass} value={draft["name"] ?? ""} onChange={set("name")} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-brand-slate">
                  USD price
                  <input
                    className={inputClass}
                    value={draft["price"] ?? ""}
                    onChange={set("price")}
                  />
                </label>
                <label className="block text-xs font-semibold text-brand-slate">
                  Naira price
                  <input
                    className={inputClass}
                    value={draft["priceNaira"] ?? ""}
                    onChange={set("priceNaira")}
                  />
                </label>
              </div>
              <Button
                size="sm"
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                onClick={() =>
                  void api.contentAdmin
                    .updateProduct(product.id, {
                      name: draft["name"] ?? product.name,
                      price: Number(draft["price"] || product.price),
                      priceNaira: draft["priceNaira"] ? Number(draft["priceNaira"]) : undefined,
                    })
                    .then(() => toast.success("Product updated."))
                }
              >
                <Save className="mr-1 h-3 w-3" /> Save changes
              </Button>
            </RowShell>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Professional services"
          hint="Hide a service page or delete it entirely."
        />
        <ul className="space-y-3">
          {database.services.map((service) => (
            <RowShell
              key={service.id}
              title={service.title}
              meta={service.tagline}
              hidden={service.hidden}
              editing={editing === service.id}
              onEdit={() =>
                startEdit(service.id, { title: service.title, tagline: service.tagline })
              }
              onHide={() => void hide("service", service.id, Boolean(service.hidden))}
              onDelete={() =>
                void api.contentAdmin
                  .removeService(service.id)
                  .then(() => toast.success("Service deleted."))
              }
            >
              <label className="block text-xs font-semibold text-brand-slate">
                Title
                <input
                  className={inputClass}
                  value={draft["title"] ?? ""}
                  onChange={set("title")}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Tagline
                <input
                  className={inputClass}
                  value={draft["tagline"] ?? ""}
                  onChange={set("tagline")}
                />
              </label>
              <Button
                size="sm"
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                onClick={() =>
                  void api.contentAdmin
                    .updateService(service.id, {
                      title: draft["title"] ?? service.title,
                      tagline: draft["tagline"] ?? service.tagline,
                    })
                    .then(() => toast.success("Service updated."))
                }
              >
                <Save className="mr-1 h-3 w-3" /> Save changes
              </Button>
            </RowShell>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Distribution channels (press catalogue)"
          hint="Reprice outlets, change verification status, or hide them from the catalogue. Prices feed the booking wizard live."
        />
        <ul className="space-y-3">
          {database.distributionChannels.map((channel) => (
            <RowShell
              key={channel.id}
              title={channel.label}
              meta={`${channel.group} · ${channel.status} · ₦${(channel.priceNaira ?? 0).toLocaleString("en-NG")}`}
              hidden={channel.hidden}
              editing={editing === channel.id}
              onEdit={() =>
                startEdit(channel.id, {
                  priceNaira: String(channel.priceNaira ?? ""),
                  priceUsd: String(channel.priceUsd ?? ""),
                  status: channel.status,
                })
              }
              onHide={() => void hide("channel", channel.id, Boolean(channel.hidden))}
              onDelete={() => toast.info("Catalogue outlets are hidden, never deleted.")}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs font-semibold text-brand-slate">
                  Naira price
                  <input
                    className={inputClass}
                    value={draft["priceNaira"] ?? ""}
                    onChange={set("priceNaira")}
                  />
                </label>
                <label className="block text-xs font-semibold text-brand-slate">
                  USD price
                  <input
                    className={inputClass}
                    value={draft["priceUsd"] ?? ""}
                    onChange={set("priceUsd")}
                  />
                </label>
                <label className="block text-xs font-semibold text-brand-slate">
                  Status
                  <select
                    className={inputClass}
                    value={draft["status"] ?? channel.status}
                    onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="verified">verified</option>
                    <option value="pending_verification">pending_verification</option>
                    <option value="suspended">suspended</option>
                  </select>
                </label>
              </div>
              <Button
                size="sm"
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                onClick={() =>
                  void api.pressReleases
                    .updateChannel(channel.id, {
                      priceNaira: draft["priceNaira"]
                        ? Number(draft["priceNaira"])
                        : channel.priceNaira,
                      priceUsd: draft["priceUsd"] ? Number(draft["priceUsd"]) : channel.priceUsd,
                      status: (draft["status"] as typeof channel.status) ?? channel.status,
                    })
                    .then(() => toast.success("Channel updated."))
                }
              >
                <Save className="mr-1 h-3 w-3" /> Save changes
              </Button>
            </RowShell>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Press release bookings"
          hint="Hide a campaign from public showcases or delete its record."
        />
        <ul className="space-y-3">
          {database.pressReleases.map((booking) => (
            <RowShell
              key={booking.id}
              title={booking.title}
              meta={`${booking.referenceNumber} · ${booking.status} · ${booking.companyName}`}
              hidden={booking.hidden}
              editing={false}
              onEdit={() => toast.info("Bookings are managed in the Press campaigns tab.")}
              onHide={() => void hide("press", booking.id, Boolean(booking.hidden))}
              onDelete={() =>
                void api.contentAdmin
                  .removePressRelease(booking.id)
                  .then(() => toast.success("Booking deleted."))
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ContentManagerPanel;
