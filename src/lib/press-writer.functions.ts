import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const draftInput = z.object({
  mode: z.literal("draft"),
  companyName: z.string().max(160),
  industry: z.string().max(120),
  country: z.string().max(80),
  announcementType: z.string().max(80),
  keyPoints: z.string().trim().min(3, "Add a few key points first.").max(4000),
  quote: z.string().max(800),
  quoteAttribution: z.string().max(160),
  contactName: z.string().max(120),
  contactEmail: z.string().max(200),
});

const polishInput = z.object({
  mode: z.literal("polish"),
  headline: z.string().max(300),
  subhead: z.string().max(500),
  body: z.string().trim().min(80, "Write at least a short story (80+ characters) before polishing.").max(30_000),
});

const writerInput = z.discriminatedUnion("mode", [draftInput, polishInput]);

const RULES = [
  "You are a senior press-release editor for F.M.I.E, a business media platform.",
  "Write in clear, simple British English that a busy editor can read fast.",
  "Use a standard press-release shape: dateline and strong lead, key facts, one quote, a short 'About' paragraph, and a media contact line.",
  "Never invent numbers, names, awards, customers or facts that the member did not give. If something is missing, leave it out.",
  "Never promise or suggest guaranteed publication, and never claim any outlet endorses the company.",
  "Return JSON only.",
].join(" ");

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "subhead", "body"],
  properties: {
    headline: { type: "string", description: "Short news headline, no full stop." },
    subhead: { type: "string", description: "One sentence that adds the key detail." },
    body: { type: "string", description: "Full release body. Paragraphs separated by a blank line." },
  },
} as const;

const resultSchema = z.object({
  headline: z.string().trim().min(1).max(300),
  subhead: z.string().trim().max(500),
  body: z.string().trim().min(40).max(30_000),
});

/**
 * Real AI help for press releases. "draft" writes a fresh release from the brief
 * (replacing what is there); "polish" rewrites the member's current article so
 * each run returns a newly refined version. Sign-in is required so this cannot
 * be used as a free public AI endpoint.
 */
export const writePressRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => writerInput.parse(input))
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const task =
      data.mode === "draft"
        ? [
            "Write a brand-new press release from this brief. Return JSON.",
            `Today's date: ${today}.`,
            `Company: ${data.companyName || "(not given)"}`,
            `Industry: ${data.industry || "(not given)"}`,
            `Country: ${data.country || "(not given)"}`,
            `Announcement type: ${data.announcementType}`,
            `Key points:\n${data.keyPoints}`,
            data.quote.trim() ? `Quote to use: "${data.quote.trim()}" — ${data.quoteAttribution || "spokesperson"}` : "No quote given: write one short, modest quote from a spokesperson without inventing a name.",
            `Media contact: ${[data.contactName, data.contactEmail].filter(Boolean).join(", ") || "Press office"}`,
          ].join("\n")
        : [
            "Polish this press release. Keep every fact, name and number the same. Improve the headline, flow, grammar and clarity, cut repetition, and make it sound ready for a news editor. Return JSON.",
            `Headline: ${data.headline}`,
            `Subhead: ${data.subhead}`,
            `Body:\n${data.body}`,
          ].join("\n");

    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: RULES,
        input: [{ role: "user", content: task }],
        text: { format: { type: "json_schema", name: "press_release", schema: outputSchema, strict: true } },
      });
      const text = extractText(response.output);
      const parsed = resultSchema.safeParse(JSON.parse(text));
      if (!parsed.success) throw new Error("bad-shape");
      return parsed.data;
    } catch (error) {
      if (error instanceof GatewayError) {
        if (error.httpStatus === 429) throw new Error("The AI writer is busy. Please wait a moment and try again.");
        if (error.httpStatus === 402) throw new Error("AI writing is paused for now. Please write or edit by hand.");
      }
      throw new Error("The AI writer could not finish. Your text is unchanged — please try again.");
    }
  });

function extractText(output: unknown): string {
  if (!Array.isArray(output)) return "";
  for (const item of output) {
    if (!item || typeof item !== "object" || (item as { type?: unknown }).type !== "message") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && (part as { type?: unknown }).type === "output_text") {
        const value = (part as { text?: unknown }).text;
        if (typeof value === "string") return value;
      }
    }
  }
  return "";
}
