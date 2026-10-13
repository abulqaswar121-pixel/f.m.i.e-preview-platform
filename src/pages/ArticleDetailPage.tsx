import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { CalendarDays, Clock, Link2, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { DisclosureBadge, SectionHeading } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { contactEmail, formatDate } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { RichText } from "@/components/common/RichText";
import { api } from "@/services/api";

export function ArticleDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const article = useAsyncResource(() => api.articles.getBySlug(slug), undefined, [slug]);
  const related = useAsyncResource(
    () => (article.data ? api.articles.related(article.data, 3) : Promise.resolve([])),
    [],
    [article.data?.id],
  );
  const [canonical, setCanonical] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setCanonical(window.location.href);
  }, []);

  const data = article.data;

  if (article.loading) {
    return (
      <div className="fmie-container py-16">
        <div className="h-4 w-32 animate-pulse rounded bg-brand-slate/15" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-brand-slate/15" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-brand-slate/15" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fmie-container py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-charcoal">Article not found</h1>
        <p className="mt-3 text-sm text-brand-slate">
          The article may have been moved or unpublished.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/news">Back to News &amp; Insights</Link>
        </Button>
      </div>
    );
  }

  const isCommercial = data.contentType === "press_release" || data.contentType === "sponsored";

  const share = (network: "copy" | "email" | "x" | "linkedin") => {
    const url = canonical || `https://fmie.co.uk/news/${data.slug}`;
    const subject = encodeURIComponent(data.title);
    if (network === "copy") {
      void navigator.clipboard?.writeText(url).then(() => toast.success("Link copied"));
      return;
    }
    if (network === "email") {
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(url)}`;
      return;
    }
    if (network === "x") {
      window.open(
        `https://x.com/intent/post?text=${subject}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener",
      );
      return;
    }
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <div>
      <header className="border-b border-brand-border bg-white">
        <div className="fmie-container max-w-4xl py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-brand-slate"
          >
            <Link to="/" className="hover:text-brand-navy hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/news" className="hover:text-brand-navy hover:underline">
              News &amp; Insights
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-brand-charcoal">{data.category}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="navy">{data.category}</Badge>
            {data.disclosureTag ? <DisclosureBadge tag={data.disclosureTag} /> : null}
            {data.isEditorialChoice ? <Badge tone="gold">Editor's choice</Badge> : null}
            {data.isFeatured ? <Badge tone="cream">Featured</Badge> : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl lg:text-[2.6rem]">
            {data.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-brand-slate">{data.subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-brand-border pt-5">
            <img
              src={data.author.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full border border-brand-border"
            />
            <div>
              <p className="text-sm font-semibold text-brand-charcoal">{data.author.name}</p>
              <p className="text-xs text-brand-slate">{data.author.title}</p>
            </div>
            <span className="hidden h-8 w-px bg-brand-border sm:block" />
            <p className="flex items-center gap-1.5 text-xs text-brand-slate">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(data.publishedAt)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-brand-slate">
              <Clock className="h-3.5 w-3.5" /> {data.readTime}
            </p>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => share("copy")}
                aria-label="Copy link"
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => share("email")}
                aria-label="Share by email"
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => share("x")}
                aria-label="Share on X"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => share("linkedin")}
                aria-label="Share on LinkedIn"
              >
                <Share2 className="h-4 w-4 rotate-90" />
              </Button>
            </div>
          </div>

          {data.author.credential ? (
            <p className="mt-3 rounded-md border border-brand-gold/40 bg-brand-gold/10 px-4 py-2 text-xs text-brand-charcoal">
              <span className="font-semibold">Author credential: </span>
              {data.author.credential}
            </p>
          ) : null}
        </div>
      </header>

      <div className="fmie-container max-w-4xl py-10">
        <figure>
          <img
            src={data.featuredImage}
            alt={data.title}
            className="w-full rounded-lg border border-brand-border"
          />
          <figcaption className="mt-2 text-[11px] text-brand-slate">{data.imageCredit}</figcaption>
        </figure>

        {isCommercial ? (
          <ComplianceBanner
            variant={data.contentType === "sponsored" ? "survey" : "distribution"}
            className="mt-8"
          />
        ) : null}

        <div className="mt-8">
          <RichText content={data.content} />
        </div>

        {data.correctionNote ? (
          <aside className="mt-8 rounded-lg border border-warning/40 bg-warning/8 p-5">
            <h2 className="text-sm font-semibold text-brand-charcoal">
              Corrections &amp; clarifications
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-slate">{data.correctionNote}</p>
            <p className="mt-2 text-xs text-brand-slate">
              Report an error to the corrections desk at {contactEmail.editorial}.
            </p>
          </aside>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <Badge key={tag} tone="cream">
              #{tag}
            </Badge>
          ))}
        </div>

        <aside className="mt-8 rounded-lg border border-brand-border bg-white p-5">
          <h2 className="text-sm font-semibold text-brand-charcoal">About the author</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-slate">{data.author.bio}</p>
          <p className="mt-3 border-t border-brand-border pt-3 text-xs leading-relaxed text-brand-slate">
            {data.contentType === "press_release" || data.contentType === "sponsored"
              ? "This content was supplied or funded by a third party and is not F.M.I.E journalism. See the Editorial & Media Policy for how paid content is separated and labelled."
              : "F.M.I.E editorial content is produced independently of the commercial desks. See the Editorial & Media Policy."}{" "}
            <Link to="/editorial-policy" className="font-semibold text-brand-navy hover:underline">
              Read the policy
            </Link>
          </p>
        </aside>
      </div>

      {related.data.length > 0 ? (
        <section className="border-t border-brand-border bg-white py-12">
          <div className="fmie-container">
            <SectionHeading eyebrow="Related reading" title="Continue across the desks" />
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.data.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-brand-border bg-brand-cream"
                >
                  <Link to="/news/$slug" params={{ slug: item.slug }}>
                    <img
                      src={item.featuredImage}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Badge tone="cream">{item.category}</Badge>
                    <h3 className="mt-2 font-display text-base font-semibold leading-snug text-brand-charcoal">
                      <Link
                        to="/news/$slug"
                        params={{ slug: item.slug }}
                        className="hover:text-brand-navy"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-brand-slate">{item.readTime}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ArticleDetailPage;
