import { MapPin } from "lucide-react";
import { presenceLine } from "@/config/site";
export function OfficeList() {
  return <section className="border-t border-brand-border py-6"><h3 className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal"><MapPin className="h-4 w-4" />Our presence</h3><p className="mt-3 text-sm text-brand-slate">{presenceLine}</p></section>;
}
