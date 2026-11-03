import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { languages, validLanguage } from "@/lib/i18n/translations";
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" aria-label="Language" className="shrink-0 gap-1 px-2"><Globe className="size-4" /><span className="text-xs uppercase">{language}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuRadioGroup value={language} onValueChange={(value) => { if (validLanguage(value)) setLanguage(value); }}>{languages.map((item) => <DropdownMenuRadioItem key={item.code} value={item.code} lang={item.code}>{item.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>;
}
