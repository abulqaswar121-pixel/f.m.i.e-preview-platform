import { Fragment, type ReactNode } from "react";

import { parseRichText, tokenizeInline } from "@/lib/rich-text";

/** Editorial renderer for the markdown subset parsed by `@/lib/rich-text`. */

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  return tokenizeInline(line).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.type === "bold") return <strong key={key}>{token.value}</strong>;
    if (token.type === "italic") return <em key={key}>{token.value}</em>;
    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

export function RichText({ content, className = "" }: { content: string; className?: string }) {
  const blocks = parseRichText(content);

  return (
    <div className={`fmie-prose ${className}`}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;
        switch (block.kind) {
          case "heading":
            return <h2 key={key}>{renderInline(block.lines[0] ?? "", key)}</h2>;
          case "subheading":
            return <h3 key={key}>{renderInline(block.lines[0] ?? "", key)}</h3>;
          case "quote":
            return (
              <blockquote
                key={key}
                className="my-8 border-l-4 border-brand-gold bg-white px-6 py-5 shadow-sm sm:px-8"
              >
                <p className="font-display text-xl leading-relaxed text-brand-navy sm:text-2xl">
                  {renderInline(block.lines.join(" "), key)}
                </p>
                {block.attribution ? (
                  <footer className="mt-3 text-sm font-medium uppercase tracking-wider text-brand-slate">
                    — {block.attribution.replace(/^—\s*/, "")}
                  </footer>
                ) : null}
              </blockquote>
            );
          case "list":
            return (
              <ul key={key}>
                {block.lines.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ul>
            );
          case "ordered":
            return (
              <ol className="mb-5 list-decimal pl-5 text-brand-slate">
                {block.lines.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className="mb-2 leading-relaxed">
                    {renderInline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={key} className={index === 0 ? "fmie-dropcap" : undefined}>
                {block.lines.map((line, lineIndex) => (
                  <Fragment key={`${key}-${lineIndex}`}>
                    {lineIndex > 0 ? " " : null}
                    {renderInline(line, `${key}-${lineIndex}`)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
