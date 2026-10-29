import { useEffect } from "react";

import { applyCloudContent } from "@/services/api";
import { fetchCloudArticles, fetchCloudVideos, pickVideo, toArticle } from "@/lib/cloud-content";

export const CLOUD_CONTENT_EVENT = "fmie:cloud-content-changed";

/** Loads newsroom articles and homepage films saved by admins, once per visit and after admin edits. */
export function CloudContentSync() {
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [articles, videos] = await Promise.all([fetchCloudArticles(), fetchCloudVideos()]);
        if (cancelled) return;
        applyCloudContent({ articles: articles.map(toArticle), videoUrl: pickVideo(videos) });
      } catch (error) {
        console.warn("Saved site content could not be loaded", error);
      }
    }
    void load();
    const reload = () => void load();
    window.addEventListener(CLOUD_CONTENT_EVENT, reload);
    return () => {
      cancelled = true;
      window.removeEventListener(CLOUD_CONTENT_EVENT, reload);
    };
  }, []);
  return null;
}

export function notifyCloudContentChanged(): void {
  window.dispatchEvent(new Event(CLOUD_CONTENT_EVENT));
}
