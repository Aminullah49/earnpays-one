import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  LanguageCode, 
  CurrencyCode, 
  SUPPORTED_CURRENCIES, 
  translateText 
} from "../utils/translator";

export interface PreferenceContextType {
  language: LanguageCode;
  currency: CurrencyCode;
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (curr: CurrencyCode) => void;
  t: (text: string) => string;
  fmt: (amountInNGN: number) => string;
  rates: Record<CurrencyCode, number>;
  ratesSource: "default" | "live" | "error";
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export const PreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [currency, setCurrencyState] = useState<CurrencyCode>("NGN");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>({
    NGN: 1.0,
    USD: 1 / 1500,
    EUR: 1 / 1600,
    GBP: 1 / 1900,
    KES: 1 / 12,
    GHS: 1 / 100
  });
  const [ratesSource, setRatesSource] = useState<"default" | "live" | "error">("default");

  // Load saved preferences on boot and retrieve live market exchange rates
  useEffect(() => {
    const savedLang = localStorage.getItem("earnpay_pref_lang") as LanguageCode;
    const savedCurr = localStorage.getItem("earnpay_pref_curr") as CurrencyCode;
    
    if (savedLang) setLanguageState(savedLang);
    if (savedCurr) setCurrencyState(savedCurr);

    const fetchRates = async () => {
      try {
        const res = await fetch("/api/exchange-rates");
        const data = await res.json();
        if (data && data.success && data.rates) {
          setRates(data.rates);
          setRatesSource("live");
          console.log("[PreferenceContext] Live market exchange rates active:", data.rates);
        } else {
          setRatesSource("error");
        }
      } catch (err) {
        console.error("[PreferenceContext] Failed to fetch live exchange rates", err);
        setRatesSource("error");
      }
    };

    fetchRates();
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("earnpay_pref_lang", lang);
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem("earnpay_pref_curr", curr);
  };

  const t = (text: string): string => {
    return translateText(text, language);
  };

  const fmt = (amountInNGN: number): string => {
    const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.NGN;
    const rate = rates[currency] !== undefined ? rates[currency] : config.rate;
    const converted = amountInNGN * rate;
    
    // If rate conversion drops value to very small, support decimals
    const hasDecimals = currency !== "NGN";
    return `${config.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })}`;
  };

  return (
    <PreferenceContext.Provider value={{ language, currency, setLanguage, setCurrency, t, fmt, rates, ratesSource }}>
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferenceProvider");
  }
  return context;
};
