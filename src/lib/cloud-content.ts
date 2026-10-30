import { supabase } from "@/integrations/supabase/client";
import type { Article, NewsCategory } from "@/types";

export const SITE_MEDIA_BUCKET = "site-media";
/** Saved links to site media stay valid for ten years. */
const LINK_SECONDS = 60 * 60 * 24 * 365 * 10;

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Finance",
  "Energy & Oil",
  "Tech & AI",
  "African Trade",
  "Policy",
  "Global Markets",
];

export interface CloudArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  content: string;
  cover_url: string;
  author_name: string;
  tags: unknown;
  is_featured: boolean;
  newsletter: boolean;
  published: boolean;
  published_at: string;
  updated_at: string;
}

export interface CloudVideoRow {
  id: string;
  title: string;
  video_url: string;
  storage_path: string | null;
  active: boolean;
  created_at: string;
}

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "story"}-${Math.random().toString(36).slice(2, 7)}`;
}

function readTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/** Turn plain paragraphs typed by an admin into simple safe article markup. */
export function paragraphsToHtml(text: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escape(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function toArticle(row: CloudArticleRow): Article {
  const category = (NEWS_CATEGORIES as string[]).includes(row.category)
    ? (row.category as NewsCategory)
    : "Finance";
  return {
    id: `cloud-${row.id}`,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    category,
    contentType: "news_report",
    author: { name: row.author_name || "F.M.I.E Newsroom", title: "F.M.I.E Newsroom", avatarUrl: "/art/logo-on-light.png" },
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readTime: readTime(row.content.replace(/<[^>]+>/g, " ")),
    featuredImage: row.cover_url || "/media/story-1.webp",
    imageCredit: "F.M.I.E",
    hidden: !row.published,
    content: row.content,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    isFeatured: row.is_featured,
  };
}

export async function fetchCloudArticles(): Promise<CloudArticleRow[]> {
  const { data, error } = await supabase
    .from("site_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as CloudArticleRow[];
}

export async function fetchCloudVideos(): Promise<CloudVideoRow[]> {
  const { data, error } = await supabase
    .from("site_videos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CloudVideoRow[];
}

/** Pick one of the switched-on homepage films at random for this visit. */
export function pickVideo(videos: CloudVideoRow[]): string | null {
  const live = videos.filter((video) => video.active);
  if (live.length === 0) return null;
  return live[Math.floor(Math.random() * live.length)]?.video_url ?? null;
}

/** Upload a picture or film for the public site and return a lasting link. */
export async function uploadSiteMedia(
  file: File,
  folder: "covers" | "videos" | "products",
): Promise<{ path: string; url: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: linkError } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .createSignedUrl(path, LINK_SECONDS);
  if (linkError || !data) throw linkError ?? new Error("Could not create a link for the file.");
  return { path, url: data.signedUrl };
}
