import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { languages, translate, validLanguage, type Language } from "./translations";
const LanguageContext = createContext({ language: "en" as Language, setLanguage: (_: Language) => {}, t: (text: string) => text });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try { const saved = localStorage.getItem("fmie-language"); if (validLanguage(saved)) setLanguage(saved); } catch { /* Storage can be blocked. */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languages.find((item) => item.code === language)?.direction ?? "ltr";
  }, [language]);
  const changeLanguage = (next: Language) => {
    setLanguage(next);
    try { localStorage.setItem("fmie-language", next); } catch { /* Keep the current choice in memory. */ }
  };
  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: (text) => translate(text, language) }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
