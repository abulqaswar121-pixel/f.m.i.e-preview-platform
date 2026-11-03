import { supabase } from "@/integrations/supabase/client";
import { kitConcepts, type KitConcept, type KitSport } from "@/components/shop/catalogue";

export const PRODUCT_CATEGORIES = ["Football", "Basketball", "Training", "Corporate"] as const;
export type ProductImage = { url: string; path: string | null; label: string };
export interface ShopProductRow {
  id: string;
  name: string;
  category: string;
  description: string;
  details: unknown;
  images: unknown;
  active: boolean;
  sort_order: number;
}

/** Old seeded Vite asset paths expire on each deploy; resolve them from current imports. */
export function resolveProductImage(url: string): string {
  if (!url.startsWith("/assets/") && !url.startsWith("/src/assets/shop/")) return url;
  const filename = url.split("/").pop()?.split("?")[0] ?? "";
  const stem = filename.replace(/\.(webp|jpg|png)$/, "").replace(/-[A-Za-z0-9_-]{8}$/, "");
  const assets = import.meta.glob("/src/assets/shop/*", { eager: true, query: "?url", import: "default" });
  for (const [path, current] of Object.entries(assets)) {
    const name = path.split("/").pop()?.replace(/\.(webp|jpg|png)$/, "");
    if (name === stem && typeof current === "string") return current;
  }
  return url;
}

export function productImages(row: ShopProductRow): ProductImage[] {
  return Array.isArray(row.images) ? (row.images as ProductImage[]).filter((i) => i && typeof i.url === "string").map((i) => ({ ...i, url: resolveProductImage(i.url) })) : [];
}

export function toConcept(row: ShopProductRow): KitConcept {
  const category = (PRODUCT_CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as KitConcept["category"])
    : "Football";
  const base = {
    name: row.name,
    category,
    description: row.description,
    images: productImages(row).map((i) => ({ src: i.url, label: i.label || "Photo" })),
    details: Array.isArray(row.details) ? (row.details as string[]) : [],
  };
  return category === "Training" ? base : { ...base, sport: category as KitSport };
}

export async function fetchShopProducts(): Promise<ShopProductRow[]> {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShopProductRow[];
}

/** Live items with photos; falls back to the built-in designs until the admin adds any. */
export async function fetchShopConcepts(): Promise<KitConcept[]> {
  try {
    const live = (await fetchShopProducts()).filter((r) => r.active).map(toConcept).filter((c) => c.images.length > 0);
    return live.length ? live : kitConcepts;
  } catch {
    return kitConcepts;
  }
}
