import { Link } from "@tanstack/react-router";
import { Shirt } from "lucide-react";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { contactEmail } from "@/config/site";

export function ShopPage() {
  return <div>
    <PageHeader eyebrow="F.M.I.E Shop" title="Team kits & merchandise" description="Ask for custom kits for your club, team or company." breadcrumb={[{ label: "Home", to: "/" }, { label: "Shop" }]} />
    <div className="fmie-container grid items-center gap-8 py-12 md:grid-cols-2">
      <div className="flex aspect-square max-h-80 items-center justify-center bg-muted"><img src="/art/logo-on-light.png" width="664" height="464" alt="F.M.I.E" className="max-h-48 w-2/3 object-contain" /></div>
      <section>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground"><Shirt className="h-6 w-6" /> Custom team kits</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Choose your team colours, upload a crest and add player names and sizes. We will confirm the price and delivery before you pay.</p>
        <Button asChild className="mt-6"><Link to="/shop/team-kits">Request team kits</Link></Button>
      </section>
    </div>
    <section className="border-t border-border bg-muted/40"><div className="fmie-container py-10">
      <h2 className="font-display text-xl font-semibold text-foreground">Other merchandise</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Online sales are not open yet. Contact us for clothing, stationery or bulk orders.</p>
      <Button asChild variant="link" className="mt-3 h-auto whitespace-normal break-all px-0"><a href={`mailto:${contactEmail.general}`}>{contactEmail.general}</a></Button>
    </div></section>
  </div>;
}
export default ShopPage;
