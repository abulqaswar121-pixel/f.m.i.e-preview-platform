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

export function productImages(row: ShopProductRow): ProductImage[] {
  return Array.isArray(row.images) ? (row.images as ProductImage[]).filter((i) => i && typeof i.url === "string") : [];
}

export function toConcept(row: ShopProductRow): KitConcept {
  const category = (PRODUCT_CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as KitConcept["category"])
    : "Football";
  const sport: KitSport | undefined = category === "Training" ? undefined : category;
  return {
    name: row.name,
    category,
    sport,
    description: row.description,
    images: productImages(row).map((i) => ({ src: i.url, label: i.label || "Photo" })),
    details: Array.isArray(row.details) ? (row.details as string[]) : [],
  };
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
