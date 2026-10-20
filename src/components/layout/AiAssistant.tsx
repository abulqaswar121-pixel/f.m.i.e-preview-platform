import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import { contactEmail, headquarters, socialLinks, westAfricaDesk } from "@/config/site";
import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

interface AssistantMessage {
  id: number;
  from: "assistant" | "user";
  text: string;
  link?: { href: string; label: string };
}

interface KnowledgeEntry {
  match: RegExp;
  answer: string;
  link?: { href: string; label: string };
}

function buildKnowledge(minWithdrawal: number): KnowledgeEntry[] {
  return [
    {
      match: /(earn|reward|cash|naira|₦|withdraw|bank|payout)/i,
      answer: `Survey earners are credited the moment a submission is recorded, and can withdraw from ₦${minWithdrawal.toLocaleString()} to any Nigerian bank account from the wallet. Payouts are simulated in this preview.`,
      link: { href: "/wallet", label: "Open wallet" },
    },
    {
      match: /(survey|respond|question|take)/i,
      answer:
        "Live paid surveys are open to every signed-in persona. Each listing shows category, estimated minutes and the cash reward before you start.",
      link: { href: "/surveys", label: "Browse live surveys" },
    },
    {
      match: /(point|pack|paystack|researcher|escrow|budget)/i,
      answer:
        "Researchers buy points through a simulated Paystack checkout (₦5,000 = 50 pts, ₦20,000 = 250 pts, ₦75,000 = 1,000 pts). Points for respondent rewards are locked in escrow when a survey goes live and unused points return automatically.",
      link: { href: "/wallet", label: "Buy points" },
    },
    {
      match: /(press|release|outlet|newspaper|publish|media|distribution)/i,
      answer:
        "The booking desk lists Nigerian national, premium and international titles with exact ₦/$ rates. You select outlets, settle the simulated checkout, then submit the story — editors always retain final discretion.",
      link: { href: "/press-releases/book", label: "Book distribution" },
    },
    {
      match: /(track|pipeline|status|stage)/i,
      answer:
        "Every release moves through Draft → Submitted → Under Review → Approved → In Production → Published. The tracker shows your live pipeline and the published link once recorded.",
      link: { href: "/press-releases/tracker", label: "Open tracker" },
    },
    {
      match: /(kit|jersey|club|team|crest|roster)/i,
      answer:
        "The team-kit builder takes club details, colours, crest and a player roster (S–XXL), prices an instant quote and sends the request to the kit desk for an official invoice.",
      link: { href: "/shop/team-kits", label: "Build a kit" },
    },
    {
      match: /(shop|merch|polo|hoodie|cap|folio|mug|buy|order)/i,
      answer:
        "Official merchandise — polo £65/₦75,000, hoodie £95/₦110,000, cap £35/₦40,000, leather folio £185/₦215,000, mug £22/₦25,000 — is in the shop with cart and simulated checkout.",
      link: { href: "/shop", label: "Visit the shop" },
    },
    {
      match: /(news|article|story|desk|category)/i,
      answer:
        "The newsroom runs six desks — Finance, Energy & Oil, Tech & AI, African Trade, Policy and Global Markets — with author credentials and clear Editorial vs Sponsored labelling.",
      link: { href: "/news", label: "Read the newsroom" },
    },
    {
      match: /(contact|email|phone|office|address|social|instagram|facebook|linkedin|tiktok)/i,
      answer: `Reach the desks at ${contactEmail.general}, ${contactEmail.editorial}, ${contactEmail.press}, ${contactEmail.surveys} or ${contactEmail.services}. Offices: ${headquarters.addressOneLine} and ${westAfricaDesk.addressOneLine}. Socials: ${socialLinks.map((s) => s.label).join(", ")}.`,
      link: { href: "/contact", label: "Contact page" },
    },
    {
      match: /(service|autobiography|biography|marketing|wikipedia|pitch|represent)/i,
      answer:
        "Professional services cover executive biography writing, corporate digital marketing, media pitching & representation, and Wikipedia editorial advisory — each with its own disclosures.",
      link: { href: "/services", label: "Explore services" },
    },
    {
      match: /(demo|sample|real|preview|disclaimer)/i,
      answer:
        "This is a demonstration preview: all editorial, prices, wallets and transactions are sample data stored in your browser. Nothing here is live journalism or a real payment.",
    },
  ];
}

const QUICK_CHIPS = [
  "How do I earn?",
  "Withdrawal minimum?",
  "Press release prices",
  "Build a team kit",
];

/**
 * Ada — the F.M.I.E client assistant. A demonstration concierge for the public
 * site: she answers from the platform's own configuration and walks visitors to
 * the right page. Deliberately absent inside portals, checkout and auth, where
 * the interface must stay focused.
 */
export function AiAssistant() {
  const database = useDatabase();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      from: "assistant",
      text: "Good day, I'm Ada, your F.M.I.E client assistant. Ask me about surveys, earnings, press distribution, kits or anything else on the platform.",
    },
  ]);
  const nextId = useRef(2);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  function push(message: Omit<AssistantMessage, "id">): void {
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);
  }

  function answer(question: string): void {
    push({ from: "user", text: question });
    setThinking(true);
    const knowledge = buildKnowledge(database.settings.minWithdrawalNaira);
    const hit = knowledge.find((entry) => entry.match.test(question));
    window.setTimeout(() => {
      setThinking(false);
      if (hit) {
        push({ from: "assistant", text: hit.answer, ...(hit.link ? { link: hit.link } : {}) });
      } else {
        push({
          from: "assistant",
          text: `I can help with surveys & earnings, point packs, press release booking and tracking, team kits, the shop, the newsroom and contact details. Which of those shall we start with? You can also reach a human desk at ${contactEmail.general}.`,
        });
      }
    }, 450);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close the F.M.I.E assistant" : "Chat with Ada, the F.M.I.E assistant"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-navy shadow-xl transition-transform hover:scale-105"
      >
        <img
          src="/media/ai-assistant-avatar.png"
          alt=""
          className={cn("h-full w-full rounded-full object-cover", open && "opacity-0")}
        />
        {open ? <X className="absolute h-5 w-5 text-brand-gold" /> : null}
        {!open ? (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border border-white bg-brand-gold" />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="F.M.I.E assistant"
          className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-brand-border bg-white shadow-2xl"
        >
          <header className="flex items-center gap-3 bg-brand-navy px-4 py-3 text-white">
            <img
              src="/media/ai-assistant-avatar.png"
              alt="Ada, F.M.I.E client assistant"
              className="h-10 w-10 rounded-full border-2 border-brand-gold object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">Ada — F.M.I.E Client Assistant</p>
              <p className="text-[11px] text-white/70">Online · demonstration concierge</p>
            </div>
            <MessageCircle className="h-4 w-4 text-brand-gold" />
          </header>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-brand-cream px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  message.from === "assistant"
                    ? "bg-white text-brand-charcoal shadow-sm"
                    : "ml-auto bg-brand-navy text-white",
                )}
              >
                {message.text}
                {message.link ? (
                  <a
                    href={message.link.href}
                    className="mt-1.5 block font-semibold text-brand-navy underline decoration-brand-gold decoration-2 underline-offset-2 hover:text-brand-gold-dark"
                  >
                    {message.link.label}
                  </a>
                ) : null}
              </div>
            ))}
            {thinking ? (
              <p className="w-fit rounded-lg bg-white px-3 py-2 text-xs text-brand-slate shadow-sm">
                Ada is typing…
              </p>
            ) : null}
          </div>

          <div className="border-t border-brand-border bg-white px-3 py-2">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => answer(chip)}
                  className="rounded-full border border-brand-border px-2.5 py-1 text-[10px] font-semibold text-brand-navy hover:border-brand-gold"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const question = input.trim();
                if (!question) return;
                setInput("");
                answer(question);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Ada anything…"
                aria-label="Message the assistant"
                className="flex-1 rounded-md border border-brand-border px-3 py-2 text-xs focus:border-brand-gold focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="rounded-md bg-brand-navy px-3 py-2 text-white hover:bg-brand-navy-dark"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AiAssistant;
