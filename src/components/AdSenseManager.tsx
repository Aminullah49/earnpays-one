import React, { useEffect, useRef } from "react";
import { ExternalLink, Sparkles, HelpCircle, Shield } from "lucide-react";

interface AdSenseManagerProps {
  type: "header" | "infeed" | "sidebar" | "footer" | "popunder" | "smartlink";
  settings: any;
  visitedLinks?: string[];
}

// --- NIGERIAN / AFRICAN HIGH-CONVERTING AD MOCKUPS & REAL SMARTLINKS ---
const AD_POOL = [
  {
    network: "OPay Sponsored",
    tagline: "OPAY MOBILE BANKING CO.",
    title: "OPay 10% Instant Cashback on MTN & Airtel Airtime",
    desc: "Never pay full price for airtime or data again. Open your OPay app to claim daily instant recharge bonuses.",
    cta: "Recharge Now",
    link: "https://opayweb.com",
    logoText: "OP",
    logoBg: "bg-emerald-600",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-100",
  },
  {
    network: "PalmPay Promo",
    tagline: "PALMPAY NIGERIA LTD",
    title: "Get ₦5,000 Sign-up Voucher & Free Transfers",
    desc: "Join PalmPay today to enjoy unlimited free money transfers to any bank and earn points for discounts.",
    cta: "Download App",
    link: "https://palmpay.com",
    logoText: "PP",
    logoBg: "bg-purple-650",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-100",
  },
  {
    network: "PiggyVest Secure Savings",
    tagline: "PIGGYVEST SAVINGS",
    title: "Earn 15% Interest Safelocking Funds Daily",
    desc: "Start saving with PiggyVest. Automate your daily, weekly or monthly savings and lock it to earn high interest yields.",
    cta: "Start Saving",
    link: "https://piggyvest.com",
    logoText: "PV",
    logoBg: "bg-blue-600",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-100",
  },
  {
    network: "Carbon Microfinance",
    tagline: "CARBON INSTANT LOANS",
    title: "Access Instant Credit Up to ₦500,500 Without Collateral",
    desc: "Get an instant loan on Carbon within minutes. Pay bills, buy airtime, and build your credit rating today.",
    cta: "Get Loan",
    link: "https://getcarbon.co",
    logoText: "CB",
    logoBg: "bg-indigo-600",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-100",
  },
  {
    network: "Moniepoint Agent Portal",
    tagline: "MONIEPOINT CAPITAL MFB",
    title: "Apply for Moniepoint POS Terminal in Lagos & Abuja",
    desc: "Start your lucrative agency banking POS business today. High speed, reliable network, low service fees.",
    cta: "Order POS",
    link: "https://moniepoint.com",
    logoText: "MP",
    logoBg: "bg-amber-600",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-100",
  },
  {
    network: "Kuda Digital Bank",
    tagline: "KUDA BANK - BANK OF THE FREE",
    title: "Get 25 Free Transfers Monthly & Save Automatically",
    desc: "Kuda gives you a free debit card, zero card maintenance fee, and smart budgeting options directly on your phone.",
    cta: "Open Account",
    link: "https://kuda.com",
    logoText: "KD",
    logoBg: "bg-indigo-900",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-100",
  },
  {
    network: "FairMoney MFB",
    tagline: "FAIRMONEY CREDIT PORTAL",
    title: "FairMoney: Loans disbursed in 5 minutes safely",
    desc: "Apply for swift digital personal loans with FairMoney Microfinance Bank. 100% online, stress-free.",
    cta: "Claim Cash",
    link: "https://fairmoney.io",
    logoText: "FM",
    logoBg: "bg-blue-500",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-100",
  },
  {
    network: "Cowrywise Finance",
    tagline: "COWRYWISE INVESTMENT CO.",
    title: "Invest in Premium Mutual Funds with ₦1,000",
    desc: "Diversify your wealth portfolio. Access high-yielding Nigerian treasury bills and mutual funds.",
    cta: "Start Investing",
    link: "https://cowrywise.com",
    logoText: "CW",
    logoBg: "bg-sky-600",
    badgeColor: "bg-sky-50 text-sky-800 border-sky-100",
  },
  {
    network: "Flutterwave Gate",
    tagline: "FLUTTERWAVE PAYMENTS",
    title: "Accept Global Card Payments in USD & NGN",
    desc: "Integrate Flutterwave payment gateway to seamlessly collect card, transfer, and mobile money transactions.",
    cta: "Create Account",
    link: "https://flutterwave.com",
    logoText: "FW",
    logoBg: "bg-amber-500",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-100",
  },
  {
    network: "Jumia Marketplace",
    tagline: "JUMIA ONLINE SHOPPING",
    title: "Get Up to 60% Off Trending Mobile Phones",
    desc: "Shop genuine smartphones and electronics on Jumia Nigeria. Cash on delivery supported in major cities.",
    cta: "Shop Deals",
    link: "https://jumia.com.ng",
    logoText: "JM",
    logoBg: "bg-orange-550",
    badgeColor: "bg-orange-50 text-orange-850 border-orange-100",
  },
  {
    network: "MTN Nigeria Broadband",
    tagline: "MTN NIGERIA NETWORK",
    title: "MTN 5G Fiber Broadband: Experience High Speeds",
    desc: "Upgrade your household router connection. Stream ultra-HD movies, download gigabytes in seconds.",
    cta: "Check Coverage",
    link: "https://mtnonline.com",
    logoText: "MT",
    logoBg: "bg-yellow-500",
    badgeColor: "bg-yellow-50 text-yellow-800 border-yellow-100",
  },
  {
    network: "Airtel SmartCASH",
    tagline: "AIRTEL AFRICA PLC",
    title: "Airtel SmartCASH PSB: Secure Wallet Activation",
    desc: "Open a secure mobile financial wallet with your phone number. Instant fund deposits and cash-out.",
    cta: "Get SmartCASH",
    link: "https://airtel.com.ng",
    logoText: "AT",
    logoBg: "bg-rose-600",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-100",
  }
];

const normalizeUrl = (url?: string) => {
  if (!url) return "";
  try {
    let trimmed = url.trim().toLowerCase();
    trimmed = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "");
    if (trimmed.endsWith("/")) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed;
  } catch {
    return (url || "").trim().toLowerCase();
  }
};

export default function AdSenseManager({ type, settings, visitedLinks }: AdSenseManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to detect if a string is a raw URL
  const isDirectUrl = (str: string) => {
    if (!str) return false;
    const trimmed = str.trim();
    return /^https?:\/\/[^\s<>\"]+$/i.test(trimmed);
  };

  const [adCode, setAdCode] = React.useState("");

  const filteredAdPool = React.useMemo(() => {
    if (!visitedLinks || visitedLinks.length === 0) {
      return AD_POOL;
    }
    const visitedSet = new Set(visitedLinks.map(lnk => normalizeUrl(lnk)));
    const remaining = AD_POOL.filter(ad => !visitedSet.has(normalizeUrl(ad.link)));
    return remaining.length > 0 ? remaining : AD_POOL;
  }, [visitedLinks, visitedLinks?.length]);

  // Pick a random, fresh ad from the filtered pool
  const [selectedAdIdx] = React.useState<number>(() => {
    const poolSize = filteredAdPool?.length || 12;
    return Math.floor(Math.random() * poolSize);
  });

  // Update adCode dynamically with fallback and mixing/rotation logic
  useEffect(() => {
    if (!settings) {
      setAdCode("");
      return;
    }
    
    // Collect all configured custom ad carriers
    const customProviders = (settings.customAdTags || [])
      .map((t: any) => ({ name: t.type || "any", code: t.code }))
      .filter((p: any) => p.code && p.code.trim() !== "");

    // Collect all configured codes on the platform
    const allProviders = [
      { name: "adsense", code: settings.adsenseCode },
      { name: "infeed", code: settings.adsenseInfeedCode },
      { name: "sidebar", code: settings.adsenseSidebarCode },
      { name: "footer", code: settings.adsenseHeaderCode },
      { name: "popunder", code: settings.adsensePopunderCode || settings.adsenseFooterCode },
      { name: "smartlink", code: settings.adsenseSmartlinkCode },
      ...customProviders
    ].filter(p => p.code && p.code.trim() !== "");

    let resolvedCode = "";

    if (type === "header") {
      const hasAdSense = settings.adsenseCode && settings.adsenseCode.trim() !== "";
      
      // Filter for header/any custom tags
      const headerCustomTags = (settings.customAdTags || [])
        .filter((t: any) => t.type === "header" || t.type === "any")
        .map((t: any) => t.code)
        .filter((c: any) => c && c.trim() !== "");

      if (!hasAdSense && headerCustomTags.length === 0) {
        // Fallback: Google AdSense is not available. Rotate or select from other active providers.
        const otherProviders = allProviders.filter(p => p.name !== "adsense");
        if (otherProviders.length > 0) {
          const randomIndex = Math.floor(Math.random() * otherProviders.length);
          resolvedCode = otherProviders[randomIndex].code || "";
        }
      } else {
        // Mix Google AdSense, direct header, and custom header tags
        const availableHeaderOptions = [
          ...(hasAdSense ? [settings.adsenseCode] : []),
          ...headerCustomTags
        ];
        const otherProviders = allProviders.filter(p => p.name !== "adsense" && !headerCustomTags.includes(p.code));

        if (otherProviders.length > 0 && Math.random() < 0.4) {
          // 40% chance to rotate to a different slot's provider as fallback rotation
          const randomIndex = Math.floor(Math.random() * otherProviders.length);
          resolvedCode = otherProviders[randomIndex].code || "";
        } else if (availableHeaderOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableHeaderOptions.length);
          resolvedCode = availableHeaderOptions[randomIndex] || "";
        }
      }
    } else {
      let targetCode = "";
      switch (type) {
        case "infeed":
          targetCode = settings.adsenseInfeedCode || "";
          break;
        case "sidebar":
          targetCode = settings.adsenseSidebarCode || "";
          break;
        case "footer":
          targetCode = settings.adsenseHeaderCode || "";
          break;
        case "popunder":
          targetCode = settings.adsensePopunderCode || settings.adsenseFooterCode || "";
          break;
        case "smartlink":
          targetCode = settings.adsenseSmartlinkCode || "";
          break;
        default:
          targetCode = "";
      }

      // Collect specific custom tags for this slot or "any"
      const matchedCustomCodes = (settings.customAdTags || [])
        .filter((t: any) => t.type === type || t.type === "any")
        .map((t: any) => t.code)
        .filter((c: any) => c && c.trim() !== "");

      let targetCodes = [targetCode].filter(c => c && c.trim() !== "");
      targetCodes = [...targetCodes, ...matchedCustomCodes];

      if (targetCodes.length > 0) {
        const randomIndex = Math.floor(Math.random() * targetCodes.length);
        resolvedCode = targetCodes[randomIndex] || "";
      } else {
        // Fallback: If no code for this position is configured, load from any other active ad provider
        if (allProviders.length > 0) {
          const randomIndex = Math.floor(Math.random() * allProviders.length);
          resolvedCode = allProviders[randomIndex].code || "";
        }
      }
    }

    setAdCode(resolvedCode);
  }, [settings, type]);

  const isUrl = isDirectUrl(adCode);

  // Try to safely load the script code if provided (only if it is NOT a direct URL)
  useEffect(() => {
    if (!adCode || isUrl || !containerRef.current) return;

    // Clear previous children
    containerRef.current.innerHTML = "";

    try {
      // Check if it's just a raw HTML/JS block
      const range = document.createRange();
      const documentFragment = range.createContextualFragment(adCode);
      containerRef.current.appendChild(documentFragment);

      // Find any scripts and execute them manually (React doesn't execute script tags added via innerHTML)
      const scripts = containerRef.current.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr: any) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    } catch (err) {
      console.error("Failed to inject ad network code:", err);
    }
  }, [adCode, isUrl]);

  // If live script code is injected, render the script container
  if (adCode && !isUrl) {
    return (
      <div 
        ref={containerRef} 
        className="w-full flex justify-center items-center overflow-hidden my-3 mx-auto min-h-[50px] bg-slate-900/5 border border-slate-100 rounded-xl"
        id={`live-ad-${type}`}
      />
    );
  }

  const getMockAdData = () => {
    if (isUrl) {
      // Direct custom ad URL / Smartlink configured by the administrator
      const targetUrl = adCode.trim();
      switch (type) {
        case "header":
          return {
            network: "Adsterra Smartlink",
            tagline: "SPONSORED GLOBAL PARTNER",
            title: "Claim Instant Special Reward Bonus",
            desc: "Complete a quick partner campaign action (app download, free signup, or quick vote) to instantly verify your connection and multiply earnings.",
            cta: "Claim Now",
            link: targetUrl,
            logoText: "SR",
            logoBg: "bg-emerald-600",
            badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-100",
          };
        case "infeed":
          return {
            network: "Sponsor Native",
            tagline: "HIGH-YIELD PARTNER DEAL",
            title: "Access Custom Paid Tasks & Promos",
            desc: "Unlock premium rewards curated exclusively for active users. Take a minute to complete simple offers to boost your wallet payout threshold.",
            cta: "Claim Bonus",
            link: targetUrl,
            logoText: "AD",
            logoBg: "bg-blue-600",
            badgeColor: "bg-blue-50 text-blue-800 border-blue-100",
          };
        case "sidebar":
          return {
            network: "Adsterra Campaign",
            tagline: "FAST PASSIVE INCOME",
            title: "Earn ₦5,000+ Extra Cash Today",
            desc: "Support the platform and earn higher daily yields by exploring commercial promotions from our verified sponsors.",
            cta: "View Offer",
            link: targetUrl,
            logoText: "SL",
            logoBg: "bg-amber-500",
            badgeColor: "bg-amber-50 text-amber-800 border-amber-100",
          };
        case "footer":
          return {
            network: "Ad Network Promo",
            tagline: "PARTNER DISCOVERY DEALS",
            title: "Supercharge Your Digital Pocket Account",
            desc: "Get secure, instant access to highest-paying survey options and reward multipliers verified for Nigeria.",
            cta: "Unlock Now",
            link: targetUrl,
            logoText: "PW",
            logoBg: "bg-orange-500",
            badgeColor: "bg-orange-50 text-orange-850 border-orange-100",
          };
        case "smartlink":
          return {
            network: "Adsterra Smartlink",
            tagline: "HIGH-REWARD MULTIPLIER",
            title: "Claim ₦2,500 PalmPay/OPay Cashback Bonus",
            desc: "Complete our certified sponsor partner verification steps. Processing is instant and takes less than 2 minutes!",
            cta: "Claim Cashback",
            link: targetUrl,
            logoText: "SL",
            logoBg: "bg-purple-600",
            badgeColor: "bg-purple-50 text-purple-850 border-purple-100",
          };
        default:
          return {
            network: "Sponsor Campaign",
            tagline: "EARNPAY AD_NETWORK PARTNER",
            title: "Complete Verified Sponsor Tasks to Earn",
            desc: "Support our ecosystem by visiting high-yield commercial campaigns from our global digital advertising networks.",
            cta: "Visit Campaign",
            link: targetUrl,
            logoText: "AD",
            logoBg: "bg-emerald-600",
            badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-100",
          };
      }
    } else {
      // Pick dynamically and freshly from the filtered pool
      const ad = filteredAdPool[selectedAdIdx] || filteredAdPool[0] || AD_POOL[0];
      return ad;
    }
  };

  const mock = getMockAdData();

  // Render highly-polished responsive advertisement box
  return (
    <div 
      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs mx-4 my-3 text-left space-y-3 font-sans relative overflow-hidden transition hover:shadow-2xs select-none"
      id={`ad-card-${type}`}
    >
      {/* Background brand overlay */}
      <div className="absolute right-0 bottom-0 top-0 w-24 bg-slate-50/50 rounded-l-full blur-xl pointer-events-none" />

      {/* Header bar stating which network is active */}
      <div className="flex justify-between items-center border-b border-slate-50 pb-2 text-[9.5px]">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold">
          <Shield size={10} className="text-slate-400" />
          <span>{mock.network} Slot</span>
          <span className="text-[7.5px] uppercase font-mono tracking-wider text-slate-350">
            {isUrl ? "(Active Campaign Link)" : "(Concurrent Mode)"}
          </span>
        </div>
        <span className={`px-2 py-0.5 text-[8.5px] font-black rounded-full border ${mock.badgeColor} uppercase tracking-wider font-mono`}>
          Ad
        </span>
      </div>

      {/* Main content body with beautiful typography and brand info */}
      <div className="flex items-start gap-3">
        <div className={`h-11 w-11 rounded-xl shrink-0 ${mock.logoBg} text-white font-sans font-black text-sm flex items-center justify-center shadow-xs`}>
          {mock.logoText}
        </div>
        <div className="space-y-1 flex-1">
          <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block">
            {mock.tagline}
          </span>
          <h4 className="text-xs font-bold text-slate-800 leading-tight">
            {mock.title}
          </h4>
          <p className="text-[10.5px] text-slate-500 leading-relaxed">
            {mock.desc}
          </p>
        </div>
      </div>

      {/* Call to action & Educational help */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="flex items-center gap-1 text-[8.5px] text-slate-450 font-medium">
          <HelpCircle size={10.5} className="text-slate-450 animate-pulse" />
          <span>{isUrl ? "EarnPay Verified Task Integration" : "Nigeria Target Segment"}</span>
        </div>
        <a
          href={mock.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (mock.link) {
              fetch("/api/user/visit-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ link: mock.link })
              }).catch(err => console.error("Error registering visit:", err));
            }
          }}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer active:scale-95 shadow-3xs"
        >
          <span>{mock.cta}</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
