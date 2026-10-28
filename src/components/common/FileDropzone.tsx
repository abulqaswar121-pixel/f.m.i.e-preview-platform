import { useRef, useState } from "react";
import { FileText, Film, Loader2, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DropzoneItem {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status?: "uploading" | "done" | "error";
}

interface FileDropzoneProps {
  label: string;
  hint: string;
  /** MIME types, e.g. ["image/png", "image/jpeg", "video/mp4"]. */
  accept: string[];
  maxSizeMb: number;
  maxFiles?: number;
  items: DropzoneItem[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  disabledText?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * One upload box used everywhere members add files: tap or drag files in,
 * see a preview with name and size, and remove any file before sending.
 */
export function FileDropzone({
  label,
  hint,
  accept,
  maxSizeMb,
  maxFiles = 1,
  items,
  onAdd,
  onRemove,
  disabled = false,
  disabledText,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const full = items.length >= maxFiles;
  const blocked = disabled || (full && maxFiles > 1);

  function take(list: FileList | null): void {
    if (!list || list.length === 0) return;
    setError("");
    const room = maxFiles === 1 ? 1 : Math.max(0, maxFiles - items.length);
    const picked: File[] = [];
    for (const file of Array.from(list)) {
      if (!accept.includes(file.type)) {
        setError(`"${file.name}" is not a supported file type.`);
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`"${file.name}" is too big. The limit is ${maxSizeMb} MB.`);
        continue;
      }
      if (picked.length >= room) {
        setError(`You can add up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`);
        break;
      }
      picked.push(file);
    }
    if (picked.length) onAdd(picked);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-brand-slate">{label}</p>
      <button
        type="button"
        disabled={blocked}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!blocked) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!blocked) take(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-brand-gold bg-brand-gold/10" : "border-brand-border bg-brand-cream/60 hover:border-brand-gold",
          blocked && "cursor-not-allowed opacity-60 hover:border-brand-border",
        )}
      >
        <UploadCloud className="h-6 w-6 text-brand-gold-dark" />
        <span className="text-sm font-semibold text-brand-charcoal">
          {disabled && disabledText
            ? disabledText
            : full && maxFiles > 1
              ? "Limit reached — remove a file to add another"
              : maxFiles === 1 && items.length
                ? "Tap to replace the file"
                : "Tap to choose, or drag files here"}
        </span>
        <span className="text-[11px] text-brand-slate">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept.join(",")}
        multiple={maxFiles > 1}
        onChange={(event) => take(event.target.files)}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {items.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-brand-border bg-white p-2"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-brand-cream">
                {item.previewUrl && item.type.startsWith("image/") ? (
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : item.previewUrl && item.type.startsWith("video/") ? (
                  <video src={item.previewUrl} muted playsInline className="h-full w-full object-cover" />
                ) : item.type.startsWith("video/") ? (
                  <Film className="h-5 w-5 text-brand-slate" />
                ) : (
                  <FileText className="h-5 w-5 text-brand-slate" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-brand-charcoal">{item.name}</span>
                <span className="block text-[11px] text-brand-slate">
                  {formatFileSize(item.size)}
                  {item.status === "uploading" ? " · uploading…" : item.status === "error" ? " · upload failed" : item.status === "done" ? " · saved" : ""}
                </span>
              </span>
              {item.status === "uploading" ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-slate" />
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="shrink-0 rounded-full p-1.5 text-brand-slate hover:bg-brand-cream hover:text-danger"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default FileDropzone;
