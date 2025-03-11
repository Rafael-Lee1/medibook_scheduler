
// Using relative path instead of alias
import type { Language } from "../context/LanguageContext";
import enTranslations from "./en";
import ptTranslations from "./pt";
import esTranslations from "./es";
import { exchangeRates, currencySymbols } from "./constants";

// Combine all translations
const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  pt: ptTranslations,
  es: esTranslations
};

export { translations, exchangeRates, currencySymbols };
