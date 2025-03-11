
import { Language } from "../context/LanguageContext";

// Exchange rates (approximate)
export const exchangeRates: Record<Language, number> = {
  en: 1,      // USD (base)
  pt: 5.5,    // BRL to USD
  es: 0.85    // EUR to USD
};

// Currency symbols
export const currencySymbols: Record<Language, string> = {
  en: "$",    // USD
  pt: "R$",   // BRL
  es: "€"     // EUR
};
