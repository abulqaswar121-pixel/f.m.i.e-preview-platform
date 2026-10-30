import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import campaign from "@/assets/shop/campaign.jpg";

export function ShopShowcase({ homepage = false }: { homepage?: boolean }) {
  return (
    <section aria-label="F.M.I.E sportswear" className="sportswear relative isolate overflow-hidden bg-brand-navy-dark text-brand-cream">
      <img src={campaign} alt="Athletes in navy and gold F.M.I.E kit on an outdoor court" width={1920} height={1080} loading={homepage ? "lazy" : "eager"} fetchPriority={homepage ? "auto" : "high"} className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-dark via-brand-navy-dark/25 to-transparent md:bg-gradient-to-r md:from-brand-navy-dark/95 md:via-brand-navy-dark/50 md:to-transparent" />
      <div className={`fmie-container flex flex-col justify-end py-10 md:justify-center md:py-16 ${homepage ? "min-h-[34rem] md:min-h-[32rem]" : "min-h-[34rem] md:min-h-[36rem]"}`}>
        <p className="text-xs font-semibold uppercase text-brand-gold">Made for your team</p>
        {homepage ? <h2 className="mt-3 max-w-lg text-4xl font-black uppercase leading-none md:text-5xl">Wear your<br />team spirit.</h2> : <h1 className="mt-3 max-w-xl text-4xl font-black uppercase leading-none sm:text-5xl md:text-6xl">F.M.I.E<br />Sportswear.</h1>}
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-cream/90">Your colours. Your crest. Your team.<br />Custom kits for the pitch, the court and beyond.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="rounded-full bg-brand-cream text-brand-navy-dark hover:bg-brand-gold">
            <Link to={homepage ? "/shop" : "/shop/team-kits"}>{homepage ? "Explore sportswear" : "Create your team kit"}<ArrowRight /></Link>
          </Button>
          {!homepage && <Button asChild size="lg" variant="ghost" className="rounded-full border border-brand-cream/60 text-brand-cream hover:bg-brand-cream/10 hover:text-brand-cream"><a href="#range">Explore the range</a></Button>}
        </div>
      </div>
    </section>
  );
}