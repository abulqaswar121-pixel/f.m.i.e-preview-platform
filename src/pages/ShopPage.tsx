import { Link } from "@tanstack/react-router";
import { ArrowRight, Palette, ShieldCheck, Shirt, Truck, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactEmail } from "@/config/site";
import heroImg from "@/assets/shop/hero.webp";
import jerseyImg from "@/assets/shop/football-jersey.webp";
import basketballImg from "@/assets/shop/basketball.webp";
import trainingImg from "@/assets/shop/training.webp";
import corporateImg from "@/assets/shop/corporate.webp";
import accessoriesImg from "@/assets/shop/accessories.webp";
import courtProductImg from "@/assets/shop/product-court.webp";
import tracksuitProductImg from "@/assets/shop/product-tracksuit.webp";
import poloProductImg from "@/assets/shop/product-polo.webp";

type KitSport = "Football" | "Basketball" | "Corporate";

const categories: { label: string; line: string; img: string; pos?: string; sport?: KitSport }[] = [
  { label: "Football", line: "Match kits for clubs and schools", img: heroImg, pos: "object-[78%_center]", sport: "Football" },
  { label: "Basketball", line: "Vests and shorts for the court", img: basketballImg, sport: "Basketball" },
  { label: "Training", line: "Tracksuits for warm-ups and travel", img: trainingImg },
  { label: "Corporate", line: "Polos and hoodies for your staff", img: corporateImg, sport: "Corporate" },
];

const range: { name: string; tag: string; line: string; img: string; sport?: KitSport }[] = [
  { name: "Match jersey", tag: "Football", line: "Light, breathable shirt with your crest, names and numbers.", img: jerseyImg, sport: "Football" },
  { name: "Court set", tag: "Basketball", line: "Vest and shorts with side stripes in your team colours.", img: courtProductImg, sport: "Basketball" },
  { name: "Training tracksuit", tag: "Training", line: "Zip jacket and joggers for warm-ups, travel and media days.", img: tracksuitProductImg },
  { name: "Team polo & hoodie", tag: "Corporate", line: "Stitched logo wear for staff, events and brand days.", img: poloProductImg, sport: "Corporate" },
];

const steps = [
  { icon: Palette, title: "Pick your style", text: "Choose the sport, kit colours and how many you need." },
  { icon: Upload, title: "Add your crest", text: "Upload your logo, then add player names, numbers and sizes." },
  { icon: ShieldCheck, title: "Get your price", text: "We send a clear quote. You pay only when you are happy." },
  { icon: Truck, title: "We make & deliver", text: "Your kits are made to order and sent to your address." },
];

function KitLink({ sport, children, className }: { sport?: KitSport | undefined; children: React.ReactNode; className?: string }) {
  return (
    <Link to="/shop/team-kits" search={sport ? { sport } : {}} className={className}>
      {children}
    </Link>
  );
}

export function ShopPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-navy-dark">
        <img src={heroImg} alt="Three athletes wearing navy F.M.I.E football kits on a floodlit pitch" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy-dark via-brand-navy-dark/80 to-brand-navy-dark/10" />
        <div className="fmie-container flex min-h-[32rem] flex-col justify-end py-14 md:min-h-[38rem] md:justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">F.M.I.E Sportswear</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.05] text-brand-cream sm:text-5xl md:text-6xl">
            Kits for teams that mean business.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-brand-cream/85">
            Custom football, basketball, training and staff wear with your crest, your colours and your names.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand-gold text-brand-navy-dark hover:bg-brand-gold/90">
              <Link to="/shop/team-kits">Design your kit <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-brand-cream/60 bg-transparent text-brand-cream hover:bg-brand-cream/10 hover:text-brand-cream">
              <a href="#range">See the range</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-card">
        <div className="fmie-container grid grid-cols-2 gap-4 py-5 text-sm text-foreground md:grid-cols-4">
          {[
            { icon: Shirt, text: "Made to your order" },
            { icon: Users, text: "From small squads to big clubs" },
            { icon: ShieldCheck, text: "Price agreed before you pay" },
            { icon: Truck, text: "Delivered to your door" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-brand-gold-dark" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by sport */}
      <section className="fmie-container py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-semibold text-foreground">Shop by sport</h2>
          <Link to="/shop/team-kits" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Start a request</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {categories.map((c) => (
            <KitLink key={c.label} sport={c.sport} className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <img src={c.img} alt={`${c.label} kit with the F.M.I.E logo`} loading="lazy" width={800} height={1000} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${c.pos ?? ""}`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy-dark/90 to-transparent p-3 pt-12 md:p-4 md:pt-16">
                <p className="font-display text-lg font-semibold text-brand-cream md:text-xl">{c.label}</p>
                <p className="mt-1 hidden text-xs text-brand-cream/80 sm:block">{c.line}</p>
              </div>
            </KitLink>
          ))}
        </div>
      </section>

      {/* The range */}
      <section id="range" className="scroll-mt-24 border-t border-border bg-muted/40">
        <div className="fmie-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">The F.M.I.E range</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">Built for match day and every day</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {range.map((item) => (
              <article key={item.name} className="group flex flex-col">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-card">
                  <img src={item.img} alt={`${item.name} with the F.M.I.E logo`} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.tag}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{item.line}</p>
                <KitLink sport={item.sport} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">
                  Get a price <ArrowRight className="h-4 w-4" />
                </KitLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories banner */}
      <section className="fmie-container py-14">
        <div className="grid overflow-hidden rounded-xl bg-brand-navy md:grid-cols-2">
          <img src={accessoriesImg} alt="F.M.I.E cap, gym bag, bottle and socks" loading="lazy" width={1280} height={1024} className="h-full max-h-96 w-full object-cover md:max-h-none" />
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Finish the look</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-brand-cream">Caps, bags, bottles & socks</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-cream/80">Add matching extras to your kit order, or ask about branded items for events and staff gifts.</p>
            <Button asChild className="mt-6 w-fit bg-brand-gold text-brand-navy-dark hover:bg-brand-gold/90">
              <a href={`mailto:${contactEmail.general}?subject=${encodeURIComponent("Branded accessories")}`}>Ask about extras</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="fmie-container py-14">
          <h2 className="font-display text-3xl font-semibold text-foreground">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-lg border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-brand-cream">{i + 1}</span>
                  <Icon className="h-5 w-5 text-brand-gold-dark" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-navy-dark">
        <div className="fmie-container flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-brand-cream">Ready to kit out your team?</h2>
            <p className="mt-2 max-w-lg text-sm text-brand-cream/80">
              Big order or special design? Email <a className="break-all text-brand-gold underline-offset-4 hover:underline" href={`mailto:${contactEmail.general}`}>{contactEmail.general}</a>
            </p>
          </div>
          <Button asChild size="lg" className="bg-brand-gold text-brand-navy-dark hover:bg-brand-gold/90">
            <Link to="/shop/team-kits">Design your kit <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <p className="fmie-container py-4 text-center text-xs text-muted-foreground">
        Pictures show design ideas. Final kits are made to your chosen colours, crest and sizes.
      </p>
    </div>
  );
}
export default ShopPage;
