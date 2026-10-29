import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone, type DropzoneItem } from "@/components/common/FileDropzone";
import { notifyCloudContentChanged } from "@/components/providers/CloudContentSync";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_MEDIA_BUCKET, fetchCloudVideos, uploadSiteMedia, type CloudVideoRow } from "@/lib/cloud-content";

/** Upload homepage films. Every switched-on film takes turns: visitors see one at random. */
export function VideoLibraryPanel() {
  const [videos, setVideos] = useState<CloudVideoRow[]>([]);
  const [items, setItems] = useState<DropzoneItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    try {
      setVideos(await fetchCloudVideos());
    } catch {
      toast.error("Could not load homepage videos.");
    }
  }
  useEffect(() => {
    void reload();
  }, []);

  async function upload() {
    if (!file) return toast.error("Choose a video first.");
    setBusy(true);
    try {
      const { path, url } = await uploadSiteMedia(file, "videos");
      const { error } = await supabase
        .from("site_videos")
        .insert({ title: title.trim() || file.name, video_url: url, storage_path: path });
      if (error) throw error;
      toast.success("Video added to the homepage.");
      setFile(null);
      setItems([]);
      setTitle("");
      await reload();
      notifyCloudContentChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(video: CloudVideoRow) {
    const { error } = await supabase.from("site_videos").update({ active: !video.active }).eq("id", video.id);
    if (error) return toast.error("Could not update the video.");
    await reload();
    notifyCloudContentChanged();
  }

  async function remove(video: CloudVideoRow) {
    if (!window.confirm("Delete this video for good?")) return;
    if (video.storage_path) await supabase.storage.from(SITE_MEDIA_BUCKET).remove([video.storage_path]);
    const { error } = await supabase.from("site_videos").delete().eq("id", video.id);
    if (error) return toast.error("Could not delete the video.");
    toast.success("Video deleted.");
    await reload();
    notifyCloudContentChanged();
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-border bg-white p-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">Homepage videos</h2>
        <p className="mt-1 max-w-2xl text-xs text-brand-slate">
          Upload as many videos as you like. Each visitor sees one of the switched-on videos at
          random. Switch a video off to rest it without deleting it. With no videos here, the
          original F.M.I.E film plays.
        </p>
      </div>
      <div className="space-y-3 rounded-md border border-brand-border bg-muted/30 p-4">
        <label className="block text-xs font-semibold text-brand-slate">
          Video name
          <input
            className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <FileDropzone
          label="Video file"
          hint="MP4 or WebM, up to 200 MB."
          accept={["video/mp4", "video/webm", "video/quicktime"]}
          maxSizeMb={200}
          maxFiles={1}
          items={items}
          onAdd={(files) => {
            const next = files[0];
            if (!next) return;
            setFile(next);
            setItems([{ id: "new", name: next.name, size: next.size, type: next.type, previewUrl: URL.createObjectURL(next) }]);
          }}
          onRemove={() => {
            setFile(null);
            setItems([]);
          }}
        />
        <Button size="sm" disabled={busy || !file} onClick={() => void upload()}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-1 h-4 w-4" />}
          {busy ? "Uploading…" : "Upload video"}
        </Button>
      </div>
      {videos.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {videos.map((video) => (
            <li key={video.id} className="overflow-hidden rounded-md border border-brand-border">
              <video src={video.video_url} muted playsInline controls preload="metadata" className="aspect-video w-full bg-black object-cover" />
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                <p className="min-w-0 truncate text-sm font-semibold text-brand-charcoal">
                  {video.title} {video.active ? "" : "(off)"}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void toggle(video)}>
                    {video.active ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                    {video.active ? "Switch off" : "Switch on"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void remove(video)}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-brand-slate">No uploaded videos yet.</p>
      )}
    </section>
  );
}
