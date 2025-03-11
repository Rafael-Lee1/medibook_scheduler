
// Using relative path instead of alias
import type { Language } from "../context/LanguageContext";
import enTranslations from "./en.ts";
import ptTranslations from "./pt.ts";
import esTranslations from "./es.ts";
import { exchangeRates, currencySymbols } from "./constants.ts";

// Combine all translations
const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  pt: ptTranslations,
  es: esTranslations
};

export { translations, exchangeRates, currencySymbols };
