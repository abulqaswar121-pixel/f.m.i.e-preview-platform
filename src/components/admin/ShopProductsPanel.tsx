import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone, type DropzoneItem } from "@/components/common/FileDropzone";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_MEDIA_BUCKET, uploadSiteMedia } from "@/lib/cloud-content";
import { PRODUCT_CATEGORIES, fetchShopProducts, productImages, type ProductImage, type ShopProductRow } from "@/lib/shop-products";

type Draft = { id: string | null; name: string; category: string; description: string; details: string; sort: string; images: ProductImage[] };
const empty: Draft = { id: null, name: "", category: "Football", description: "", details: "", sort: "0", images: [] };
const field = "mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm";

/** Add, edit, hide and delete shop items, with photo upload, remove and replace. */
export function ShopProductsPanel() {
  const [rows, setRows] = useState<ShopProductRow[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newFiles, setNewFiles] = useState<{ item: DropzoneItem; file: File }[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function reload() {
    try { setRows(await fetchShopProducts()); } catch { toast.error("Could not load shop items."); }
  }
  useEffect(() => { void reload(); }, []);

  function open(row?: ShopProductRow) {
    setNewFiles([]); setRemoved([]);
    setDraft(row ? {
      id: row.id, name: row.name, category: row.category, description: row.description,
      details: Array.isArray(row.details) ? (row.details as string[]).join("\n") : "",
      sort: String(row.sort_order), images: productImages(row),
    } : { ...empty });
  }

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) { toast.error("Add a name."); return; }
    if (draft.images.length + newFiles.length === 0) { toast.error("Add at least one photo."); return; }
    setBusy(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const { file } of newFiles) {
        const { path, url } = await uploadSiteMedia(file, "products");
        uploaded.push({ url, path, label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) });
      }
      const payload = {
        name: draft.name.trim().slice(0, 120), category: draft.category,
        description: draft.description.trim().slice(0, 600),
        details: draft.details.split("\n").map((d) => d.trim()).filter(Boolean).slice(0, 8),
        images: [...draft.images, ...uploaded], sort_order: Number(draft.sort) || 0,
      };
      const { error } = draft.id
        ? await supabase.from("shop_products").update(payload).eq("id", draft.id)
        : await supabase.from("shop_products").insert(payload);
      if (error) throw error;
      if (removed.length) await supabase.storage.from(SITE_MEDIA_BUCKET).remove(removed);
      toast.success("Shop item saved.");
      setDraft(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally { setBusy(false); }
  }

  async function toggle(row: ShopProductRow) {
    const { error } = await supabase.from("shop_products").update({ active: !row.active }).eq("id", row.id);
    if (error) toast.error("Could not update."); else await reload();
  }

  async function remove(row: ShopProductRow) {
    if (!window.confirm(`Delete "${row.name}" for good?`)) return;
    const paths = productImages(row).map((i) => i.path).filter((p): p is string => !!p);
    const { error } = await supabase.from("shop_products").delete().eq("id", row.id);
    if (error) { toast.error("Could not delete."); return; }
    if (paths.length) await supabase.storage.from(SITE_MEDIA_BUCKET).remove(paths);
    toast.success("Shop item deleted.");
    await reload();
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-brand-charcoal">Shop items</h2>
          <p className="mt-1 max-w-2xl text-xs text-brand-slate">
            Items here show on the shop page and homepage. Until you add one, the starter designs show.
            Hide an item to rest it without deleting.
          </p>
        </div>
        <Button size="sm" onClick={() => open()}><Plus className="mr-1 h-4 w-4" /> Add item</Button>
      </div>

      {draft && (
        <div className="space-y-3 rounded-md border border-brand-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-brand-slate">Name
              <input className={field} maxLength={120} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">Category
              <select className={field} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-brand-slate">Short description
            <textarea className={field} rows={2} maxLength={600} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <label className="block text-xs font-semibold text-brand-slate">Key points (one per line)
              <textarea className={field} rows={3} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">Order (lower first)
              <input type="number" className={field} value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })} />
            </label>
          </div>
          {draft.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-slate">Current photos (first is the cover)</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {draft.images.map((img, i) => (
                  <li key={img.url} className="relative">
                    <img src={img.url} alt={img.label} className="h-24 w-20 rounded object-cover" />
                    <button type="button" aria-label="Remove photo" className="absolute right-1 top-1 rounded-full bg-background p-1 shadow"
                      onClick={() => { if (img.path) setRemoved([...removed, img.path]); setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) }); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <FileDropzone
            label="Add photos"
            hint="JPG, PNG or WebP, up to 10 MB each. To replace a photo, remove it and add the new one."
            accept={["image/jpeg", "image/png", "image/webp"]}
            maxSizeMb={10}
            maxFiles={8}
            items={newFiles.map((f) => f.item)}
            onAdd={(files) => setNewFiles([...newFiles, ...files.map((file) => ({
              file, item: { id: `${file.name}-${file.size}-${Math.random()}`, name: file.name, size: file.size, type: file.type, previewUrl: URL.createObjectURL(file) },
            }))])}
            onRemove={(id) => setNewFiles(newFiles.filter((f) => f.item.id !== id))}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => void save()}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{busy ? "Saving…" : "Save item"}
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {rows.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const cover = productImages(row)[0];
            return (
              <li key={row.id} className="min-w-0 overflow-hidden rounded-md border border-brand-border">
                {cover ? <img src={cover.url} alt={row.name} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-muted" />}
                <div className="space-y-2 p-3">
                  <p className="text-sm font-semibold text-brand-charcoal">{row.name} {row.active ? "" : "(hidden)"}</p>
                  <p className="text-xs text-brand-slate">{row.category} · {productImages(row).length} photo(s)</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => open(row)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => void toggle(row)}>
                      {row.active ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}{row.active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void remove(row)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-brand-slate">No shop items added yet. The starter designs are showing.</p>
      )}
    </section>
  );
}
