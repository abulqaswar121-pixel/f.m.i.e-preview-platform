import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Pencil, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone, type DropzoneItem } from "@/components/common/FileDropzone";
import { notifyCloudContentChanged } from "@/components/providers/CloudContentSync";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  NEWS_CATEGORIES,
  fetchCloudArticles,
  paragraphsToHtml,
  slugify,
  uploadSiteMedia,
  type CloudArticleRow,
} from "@/lib/cloud-content";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

interface Draft {
  id: string | null;
  title: string;
  subtitle: string;
  category: string;
  body: string;
  author: string;
  tags: string;
  coverUrl: string;
  featured: boolean;
  newsletter: boolean;
}

const EMPTY: Draft = {
  id: null,
  title: "",
  subtitle: "",
  category: NEWS_CATEGORIES[0] ?? "Finance",
  body: "",
  author: "F.M.I.E Newsroom",
  tags: "",
  coverUrl: "",
  featured: false,
  newsletter: false,
};

function htmlToParagraphs(html: string): string {
  return html
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/** Admins write new stories here; they show on the homepage and news pages straight away. */
export function NewsroomPanel() {
  const [rows, setRows] = useState<CloudArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [cover, setCover] = useState<DropzoneItem[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      setRows(await fetchCloudArticles());
    } catch {
      toast.error("Could not load your stories.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
  }, []);

  function open(next: Draft) {
    setDraft(next);
    setCoverFile(null);
    setCover(
      next.coverUrl
        ? [{ id: "current", name: "Current cover", size: 0, type: "image/jpeg", previewUrl: next.coverUrl, status: "done" }]
        : [],
    );
  }

  async function save(publish: boolean) {
    if (!draft) return;
    if (draft.title.trim().length < 6) return toast.error("Add a headline (at least 6 letters).");
    if (draft.body.trim().length < 40) return toast.error("Write the story (at least a few sentences).");
    setSaving(true);
    try {
      let coverUrl = cover.length ? draft.coverUrl : "";
      if (coverFile) coverUrl = (await uploadSiteMedia(coverFile, "covers")).url;
      const record = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        category: draft.category,
        content: paragraphsToHtml(draft.body),
        author_name: draft.author.trim() || "F.M.I.E Newsroom",
        tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        cover_url: coverUrl,
        is_featured: draft.featured,
        newsletter: draft.newsletter,
        published: publish,
      };
      const { error } = draft.id
        ? await supabase.from("site_articles").update(record).eq("id", draft.id)
        : await supabase.from("site_articles").insert({ ...record, slug: slugify(record.title) });
      if (error) throw error;
      toast.success(publish ? "Story published on the site." : "Story saved as a draft.");
      setDraft(null);
      await reload();
      notifyCloudContentChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the story.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(row: CloudArticleRow) {
    const { error } = await supabase.from("site_articles").update({ published: !row.published }).eq("id", row.id);
    if (error) return toast.error("Could not update the story.");
    toast.success(row.published ? "Story hidden from the site." : "Story is live again.");
    await reload();
    notifyCloudContentChanged();
  }

  async function remove(row: CloudArticleRow) {
    if (!window.confirm(`Delete “${row.title}” for good?`)) return;
    const { error } = await supabase.from("site_articles").delete().eq("id", row.id);
    if (error) return toast.error("Could not delete the story.");
    toast.success("Story deleted.");
    await reload();
    notifyCloudContentChanged();
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-brand-charcoal">Newsroom</h2>
          <p className="mt-1 max-w-2xl text-xs text-brand-slate">
            Write a new story. Once published it shows on the homepage and the news page. Tick
            “Add to newsletter” to keep it for the next email newsletter.
          </p>
        </div>
        {!draft ? (
          <Button size="sm" onClick={() => open(EMPTY)}>
            <PenLine className="mr-1 h-4 w-4" /> Write new story
          </Button>
        ) : null}
      </div>

      {draft ? (
        <div className="space-y-3 rounded-md border border-brand-border bg-muted/30 p-4">
          <label className="block text-xs font-semibold text-brand-slate">
            Headline *
            <input className={`${inputClass} mt-1`} maxLength={160} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Short summary
            <input className={`${inputClass} mt-1`} maxLength={240} value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-brand-slate">
              Category
              <select className={`${inputClass} mt-1`} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {NEWS_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Writer's name
              <input className={`${inputClass} mt-1`} maxLength={80} value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
            </label>
          </div>
          <FileDropzone
            label="Cover photo"
            hint="JPG, PNG or WebP, up to 10 MB."
            accept={["image/jpeg", "image/png", "image/webp"]}
            maxSizeMb={10}
            maxFiles={1}
            items={cover}
            onAdd={(files) => {
              const file = files[0];
              if (!file) return;
              setCoverFile(file);
              setCover([{ id: "new", name: file.name, size: file.size, type: file.type, previewUrl: URL.createObjectURL(file) }]);
            }}
            onRemove={() => {
              setCover([]);
              setCoverFile(null);
            }}
          />
          <label className="block text-xs font-semibold text-brand-slate">
            Story * <span className="font-normal">(leave an empty line between paragraphs)</span>
            <textarea className={`${inputClass} mt-1 min-h-64`} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Tags <span className="font-normal">(separate with commas)</span>
            <input className={`${inputClass} mt-1`} value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-brand-charcoal">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.newsletter} onChange={(e) => setDraft({ ...draft, newsletter: e.target.checked })} />
              Add to newsletter
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={saving} onClick={() => void save(true)}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Publish
            </Button>
            <Button size="sm" variant="outline" disabled={saving} onClick={() => void save(false)}>
              Save as draft
            </Button>
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-xs text-brand-slate">Loading stories…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-brand-slate">No stories written here yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-charcoal">{row.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-brand-slate">
                  {row.category} · {new Date(row.published_at).toLocaleDateString()} · {row.published ? "Live" : "Draft / hidden"}
                  {row.newsletter ? (
                    <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> Newsletter</span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    open({
                      id: row.id,
                      title: row.title,
                      subtitle: row.subtitle,
                      category: row.category,
                      body: htmlToParagraphs(row.content),
                      author: row.author_name,
                      tags: Array.isArray(row.tags) ? (row.tags as string[]).join(", ") : "",
                      coverUrl: row.cover_url,
                      featured: row.is_featured,
                      newsletter: row.newsletter,
                    })
                  }
                >
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => void togglePublished(row)}>
                  {row.published ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  {row.published ? "Hide" : "Publish"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => void remove(row)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
