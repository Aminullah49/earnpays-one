import React from "react";
import { usePreferences } from "../context/PreferenceContext";
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES, LanguageCode, CurrencyCode } from "../utils/translator";
import { Globe, DollarSign } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, currency, setLanguage, setCurrency, t, rates, ratesSource } = usePreferences();

  return (
    <div className="bg-slate-900 text-slate-100 p-4 border-b border-slate-800 space-y-3 shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider flex items-center gap-1">
          <Globe size={11} className="animate-spin duration-3000" />
          {t("Worldwide Language & Region Setup")}
        </span>
        <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
          🌍 Global Gateway Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Language dropdown */}
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wide">
            Preferred Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-[10px] rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 font-bold cursor-pointer transition-all appearance-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-slate-200 font-bold">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-2.5 pointer-events-none text-[8px] text-slate-500">▼</span>
          </div>
        </div>

        {/* Currency selection dropdown */}
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wide">
            Region Currency
          </label>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-[10px] rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 font-bold cursor-pointer transition-all appearance-none"
            >
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, details]) => (
                <option key={code} value={code} className="bg-slate-950 text-slate-200 font-bold">
                  {details.symbol} {code} ({details.name})
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-2.5 pointer-events-none text-[8px] text-slate-500">▼</span>
          </div>
        </div>
      </div>

      {currency !== "NGN" && (
        <div className="text-[9px] bg-slate-950 text-indigo-300 border border-slate-800 rounded p-2 flex items-center justify-between font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
            <span>Rate: ₦1.00 = {rates[currency] ? rates[currency].toFixed(6) : "..."} {currency} ({rates[currency] ? (1 / rates[currency]).toFixed(2) : "..."} NGN/{currency})</span>
          </div>
          <span className="text-[7.5px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
            {ratesSource === "live" ? "📡 Live Market" : ratesSource === "default" ? "⚙️ Fallback" : "⚠️ Cached"}
          </span>
        </div>
      )}
    </div>
  );
};
