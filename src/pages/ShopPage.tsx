import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Palette, Upload, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShopShowcase } from "@/components/shop/ShopShowcase";
import { collections, kitConcepts, type Collection, type KitConcept } from "@/components/shop/catalogue";
import accessories from "@/assets/shop/accessories.webp";
import basketball from "@/assets/shop/basketball.webp";
import training from "@/assets/shop/training.webp";
import corporate from "@/assets/shop/corporate.webp";
import football from "@/assets/shop/hero.webp";

export function ShopPage() {
  const [collection, setCollection] = useState<Collection>("All");
  const [selected, setSelected] = useState<KitConcept | null>(null);
  const [photo, setPhoto] = useState(0);
  const showKit = (item: KitConcept) => { setPhoto(0); setSelected(item); };
  const visible = kitConcepts.filter(item => collection === "All" || item.category === collection);

  return (
    <div className="sportswear bg-background">
      <div className="border-b border-border bg-card">
        <div className="fmie-container flex items-center justify-between gap-3 py-4">
          <p className="text-sm font-black uppercase">F.M.I.E / Teamwear</p>
          <a href="#range" className="flex items-center gap-1 text-xs font-semibold">The collection <ArrowRight className="size-4" /></a>
        </div>
      </div>
      <ShopShowcase />
      <div className="border-b border-border bg-card">
        <div className="fmie-container grid grid-cols-1 gap-3 py-5 text-xs font-medium sm:grid-cols-3">
          {["Your colours & crest", "Made to order", "Get a quote before you pay"].map(text => <p key={text} className="flex items-center gap-2"><Check className="size-4 text-brand-gold-dark" />{text}</p>)}
        </div>
      </div>

      <section id="range" className="fmie-container scroll-mt-24 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase text-muted-foreground">The teamwear edit</p><h2 className="mt-2 text-3xl font-black uppercase md:text-4xl">Find your team look.</h2></div>
          <span className="text-xs text-muted-foreground">Made-to-order design ideas</span>
        </div>
        <div role="group" aria-label="Filter sportswear" className="mt-6 flex flex-wrap gap-2">
          {collections.map(value => <Button key={value} variant={collection === value ? "secondary" : "ghost"} aria-pressed={collection === value} onClick={() => setCollection(value)} className={`rounded-full border shadow-none ${collection === value ? "border-foreground bg-foreground text-background hover:bg-foreground/90" : "border-border"}`}>{value}</Button>)}
        </div>
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {visible.map(item => <article key={item.name} className="group min-w-0">
            <Button variant="ghost" aria-label={`View ${item.name}`} onClick={() => showKit(item)} className="relative block h-auto w-full overflow-hidden rounded-none p-0 hover:bg-muted">
              <img src={item.images[0]?.src} alt={`${item.name}, F.M.I.E design concept`} width={800} height={1000} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105" />
              <span className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-background text-foreground"><Plus className="size-4" /></span>
            </Button>
            <div className="mt-3 flex items-start justify-between gap-2"><h3 className="text-sm font-bold md:text-base">{item.name}</h3><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" /></div>
            <p className="mt-1 text-xs text-muted-foreground">{item.category} / Custom teamwear</p>
            <Button variant="link" onClick={() => showKit(item)} className="mt-1 h-auto justify-start p-0 text-xs">View kit & get a quote</Button>
          </article>)}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="fmie-container py-12 md:py-16">
          <h2 className="text-3xl font-black uppercase md:text-4xl">Every team. Every arena.</h2>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { name: "Football" as const, image: football, sport: "Football" as const },
              { name: "Basketball" as const, image: basketball, sport: "Basketball" as const },
              { name: "Training" as const, image: training, sport: undefined },
              { name: "Corporate" as const, image: corporate, sport: "Corporate" as const },
            ].map(item => <Link key={item.name} to="/shop/team-kits" search={item.sport ? { sport: item.sport } : {}} className="group relative block overflow-hidden bg-muted">
              <img src={item.image} alt={`${item.name} F.M.I.E teamwear`} width={800} height={1000} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-brand-navy-dark to-transparent px-3 pb-4 pt-16 text-brand-cream"><h3 className="text-base font-bold md:text-xl">{item.name}</h3><ArrowUpRight className="size-5 shrink-0" /></div>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-brand-navy-dark text-brand-cream">
        <img src={accessories} alt="F.M.I.E bags, cap, socks and bottle design ideas" width={1280} height={1024} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[30%_center]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-dark via-brand-navy-dark/50 to-transparent md:bg-gradient-to-r md:from-brand-navy-dark/95 md:to-transparent" />
        <div className="fmie-container flex min-h-[30rem] flex-col justify-end py-10 md:min-h-[32rem] md:justify-center"><p className="text-xs font-semibold uppercase text-brand-gold">Beyond the jersey</p><h2 className="mt-3 max-w-sm text-4xl font-black uppercase leading-none md:text-5xl">One team.<br />The whole look.</h2><p className="mt-4 max-w-sm text-sm text-brand-cream/90">Ask about matching bags, caps and team extras with your kit request.</p><Button asChild variant="secondary" className="mt-6 w-fit rounded-full bg-brand-cream text-brand-navy-dark hover:bg-brand-gold"><Link to="/shop/team-kits">Build your team look <ArrowRight /></Link></Button></div>
      </section>

      <section className="fmie-container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]"><h2 className="max-w-xs text-3xl font-black uppercase">Your kit.<br />Your way.</h2><ol className="grid gap-6 sm:grid-cols-3">{[
          { icon: Palette, title: "Choose your look", text: "Pick your sport, colours and team sizes." },
          { icon: Upload, title: "Make it yours", text: "Add your crest, player names and numbers." },
          { icon: MessageSquare, title: "Get your quote", text: "Our team confirms your design and price." },
        ].map(({ icon: Icon, title, text }, i) => <li key={title} className="border-t border-border pt-5"><div className="flex items-center justify-between"><Icon className="size-5 text-brand-gold-dark" /><span className="text-xs text-muted-foreground">0{i + 1}</span></div><h3 className="mt-4 text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></li>)}</ol></div>
        <p className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Images are AI-made design ideas, not photos of available stock. Final designs, fabric, sizes and delivery are confirmed with your quote.</p>
      </section>

      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="sportswear max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto p-5 sm:p-7">
          {selected && <div className="grid min-w-0 gap-6 md:grid-cols-2">
            <div className="min-w-0"><img src={selected.images[photo]?.src} alt={`${selected.name} — ${selected.images[photo]?.label}`} width={800} height={1000} className="aspect-[4/5] max-h-[48dvh] w-full bg-muted object-contain" /><div className="mt-3 flex gap-2">{selected.images.map((image, i) => <Button key={image.label} variant="outline" onClick={() => setPhoto(i)} aria-label={`Show ${image.label}`} aria-pressed={photo === i} className={`h-16 w-14 rounded-none p-0 ${photo === i ? "border-primary ring-1 ring-primary" : ""}`}><img src={image.src} alt={image.label} width={56} height={64} className="h-full w-full object-cover" /></Button>)}</div></div>
            <div className="min-w-0 py-3"><p className="text-xs uppercase text-muted-foreground">{selected.category} / Design concept</p><DialogTitle className="mt-3 text-2xl font-black uppercase">{selected.name}</DialogTitle><DialogDescription className="mt-4 leading-relaxed">{selected.description}</DialogDescription><ul className="mt-6 space-y-3 text-sm">{selected.details.map(detail => <li key={detail} className="flex gap-2"><Check className="size-4 shrink-0 text-brand-gold-dark" />{detail}</li>)}</ul><p className="mt-6 border-t border-border pt-4 text-sm font-semibold">Made to order. Price confirmed by quote.</p><Button asChild size="lg" className="mt-5 w-full"><Link to="/shop/team-kits" search={selected.sport ? { sport: selected.sport } : {}}>Customise & request a quote <ArrowRight /></Link></Button><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Each photo is a design idea. Final details are agreed with you before production.</p></div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default ShopPage;
