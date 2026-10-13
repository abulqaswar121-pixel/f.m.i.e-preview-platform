/**
 * Minimal editorial parser for article bodies.
 *
 * Article copy in `src/data/articles.json` is authored with a tiny subset of
 * markdown so it can be edited as plain text: `##` headings, `>` pull quotes
 * (with an optional `— attribution` line), `-` and `1.` lists, and inline
 * `**bold**` / `*italic*` spans. No external markdown dependency and no HTML
 * injection — the renderer in `@/components/common/RichText` turns these
 * structures into React text nodes only.
 */

export type InlineToken = { type: "bold" | "italic" | "text"; value: string };

export function tokenizeInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(line);
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("**")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) });
    } else {
      tokens.push({ type: "italic", value: raw.slice(1, -1) });
    }
    lastIndex = match.index + raw.length;
    match = pattern.exec(line);
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
}

export interface Block {
  kind: "heading" | "subheading" | "quote" | "list" | "ordered" | "paragraph";
  lines: string[];
  attribution?: string | undefined;
}

export function parseRichText(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";
    if (!line) continue;

    if (line.startsWith("### ")) {
      blocks.push({ kind: "subheading", lines: [line.slice(4)] });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", lines: [line.slice(3)] });
      continue;
    }
    if (line.startsWith("> ")) {
      const quoteLines = [line.slice(2)];
      let cursor = index + 1;
      while (cursor < lines.length && (lines[cursor] ?? "").trim().startsWith("> ")) {
        quoteLines.push((lines[cursor] ?? "").trim().slice(2));
        cursor += 1;
      }
      const attribution = quoteLines.length > 1 ? quoteLines.pop() : undefined;
      index = cursor - 1;
      blocks.push({ kind: "quote", lines: quoteLines, attribution });
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length && (lines[cursor] ?? "").trim().startsWith("- ")) {
        items.push((lines[cursor] ?? "").trim().slice(2));
        cursor += 1;
      }
      index = cursor - 1;
      blocks.push({ kind: "list", lines: items });
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length && /^\d+\.\s/.test((lines[cursor] ?? "").trim())) {
        items.push((lines[cursor] ?? "").trim().replace(/^\d+\.\s/, ""));
        cursor += 1;
      }
      index = cursor - 1;
      blocks.push({ kind: "ordered", lines: items });
      continue;
    }

    const paragraphLines = [line];
    let cursor = index + 1;
    while (
      cursor < lines.length &&
      (lines[cursor] ?? "").trim() !== "" &&
      !/^(##\s|###\s|>\s|-\s|\d+\.\s)/.test((lines[cursor] ?? "").trim())
    ) {
      paragraphLines.push((lines[cursor] ?? "").trim());
      cursor += 1;
    }
    index = cursor - 1;
    blocks.push({ kind: "paragraph", lines: paragraphLines });
  }

  return blocks;
}
