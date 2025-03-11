
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, exchangeRates, currencySymbols } from "@/translations";

// Define the available languages
export type Language = "en" | "pt" | "es";

// Define the context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
}

// Create a default context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Initialize with browser language or default to English
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'pt' || browserLang === 'es') {
      return browserLang as Language;
    }
    return 'en';
  };

  // Try to get language from localStorage or use browser language
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || getBrowserLanguage();
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Format price according to current language
  const formatPrice = (price: number): string => {
    const rate = exchangeRates[language];
    const symbol = currencySymbols[language];
    
    const convertedPrice = price * rate;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    // Set the html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    formatPrice,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
