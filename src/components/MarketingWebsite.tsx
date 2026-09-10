import React, { useState } from "react";
import { 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Users, 
  Globe, 
  Sparkles, 
  BadgePercent, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Wallet, 
  BookOpen, 
  HelpCircle, 
  Send, 
  Star, 
  Lock, 
  Layers,
  Facebook,
  Twitter,
  MessageSquare,
  Smartphone,
  Apple,
  Laptop,
  Download,
  Terminal,
  Activity,
  Cpu,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MembershipConfig } from "../types";
import LegalDocsModal from "./LegalDocsModal";
import { EarnPayLogo } from "./EarnPayLogo";

interface MarketingWebsiteProps {
  membershipConfigs: Record<string, MembershipConfig> | null;
  settings?: any;
  onNavigateAuth: (isRegister: boolean) => void;
  onMockLogin: (email: string) => void;
}

export default function MarketingWebsite({ 
  membershipConfigs, 
  settings,
  onNavigateAuth,
  onMockLogin
}: MarketingWebsiteProps) {
  const [activeTab, setActiveTab] = useState<"home" | "earn" | "advertisers" | "pricing" | "blog" | "about" | "contact">("home");
  const [legalDoc, setLegalDoc] = useState<"privacy" | "terms" | null>(null);
  
  // Dynamic ROI Calculator state
  const [selectedTier, setSelectedTier] = useState<string>("Bronze");
  const [estimatedDailyDailyTasks, setEstimatedDailyDailyTasks] = useState<number>(5);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Contact form submission state
  const [contactFormSubmitted, setContactFormSubmitted] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMsg, setContactMsg] = useState<string>("");
  const [contactTicketId, setContactTicketId] = useState<string>("");

  // Interactive Node Download Terminal Simulator state
  const [activeTerminalPlatform, setActiveTerminalPlatform] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalProgress, setTerminalProgress] = useState<number>(0);
  const [terminalComplete, setTerminalComplete] = useState<boolean>(false);

  // Testimonial Carousel state
  const [testimonialIdx, setTestimonialIdx] = useState<number>(0);

  const launchNodeTerminal = (platform: string) => {
    setActiveTerminalPlatform(platform);
    setTerminalComplete(false);
    setTerminalProgress(0);
    setTerminalLogs([`[SYSTEM] Initializing EarnPay ${platform} Cryptographic Node...`]);

    const logsList = [
      `[NETWORK] Locating secure nearest edge servers... Done`,
      `[SSL] Handshaking with EarnPay Escrow Ledger Node v2.4... OK`,
      `[DATABASE] Mounting local storage key-value tables... OK`,
      `[SECURITY] Generating offline cryptographic wallet key pair... Saved`,
      `[TELEMETRY] Scanning device hardware signatures for fraud prevention... Clear`,
      `[DASHBOARD] Synchronizing real-time CPA offer catalogs... Sync OK`,
      `[SUCCESS] EarnPay Node certified! Device successfully bound to Global Network.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logsList.length) {
        setTerminalLogs(prev => [...prev, logsList[currentLogIndex]]);
        setTerminalProgress(prev => Math.min(prev + 15, 100));
        currentLogIndex++;
      } else {
        setTerminalComplete(true);
        setTerminalProgress(100);
        clearInterval(interval);
      }
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    
    // Generate mock cryptographic ticket ID
    const randomTicket = "EP-TK-" + Math.floor(100000 + Math.random() * 900000);
    setContactTicketId(randomTicket);
    setContactFormSubmitted(true);
  };

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "earn", label: "Earn Rewards" },
    { id: "advertisers", label: "Advertisers" },
    { id: "pricing", label: "Membership Tiers" },
    { id: "blog", label: "Company Blog" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact Support" }
  ];

  // Helper calculation for dynamic ROI multiplier
  const currentTierConfig = membershipConfigs ? membershipConfigs[selectedTier] : null;
  const computedDailyTasksVal = currentTierConfig ? Math.min(estimatedDailyDailyTasks, currentTierConfig.dailyTasksLimit) : 0;
  
  // Average reward per task estimated at ₦120
  const dailyEarningsNGN = computedDailyTasksVal * 120;
  // Estimated maximum referral bonus per day (3 active references)
  const refCommissionPct = currentTierConfig ? currentTierConfig.referralCommission : 0.05;
  const estimatedReferralNGN = 3 * (120 * 5) * refCommissionPct;
  const totalDailyNGN = dailyEarningsNGN + estimatedReferralNGN;
  const totalMonthlyNGN = totalDailyNGN * 30;

  const faqs = [
    {
      q: "What is EarnPay and how does it function?",
      a: "EarnPay is a global multi-tiered fintech micro-tasks rewards network. Users worldwide complete promotional tasks and brand surveys to earn instant real money payouts (NGN / USD equivalent). Advertisers purchase verified target engagements on their actual digital channels."
    },
    {
      q: "Can I earn money completely free without deposit?",
      a: "Absolutely. All registered accounts start on our free-to-earn tier with a robust set of standard daily tasks. To access more exclusive offers, higher task limits, and enhanced referral commissions, you can voluntarily upgrade your membership at any time to higher levels like Bronze, Silver, Gold, or Premium."
    },
    {
      q: "How are earnings processed and withdrawn?",
      a: "EarnPay processes withdrawals directly to target commercial bank accounts, mobile airtime, and billing bundles. Payouts are instant for active premium tiers, fortified by our security OTP carriers."
    },
    {
      q: "How do advertisers benefit?",
      a: "Our community comprises thousands of verified active users. Each engagement is thoroughly authenticated and trace-verified, ensuring advertisers pay strictly for successfully proven, genuine micro-milestones."
    }
  ];

  const blogPosts = [
    {
      title: "The Ultimate Guide to Maximizing Micro-Task ROI in 2026",
      desc: "Discover how smart earners are staging their daily task pipelines to stack CPA surveys and high-converting app downloads.",
      date: "June 18, 2026",
      read: "5 mins read",
      badge: "Strategy"
    },
    {
      title: "Why Verification Matters: High-Quality Engagement in Digital Advertising",
      desc: "Explore EarnPay's advanced verification systems, securing advertiser capital and maximizing genuine conversion value.",
      date: "May 29, 2026",
      read: "8 mins read",
      badge: "Industry"
    },
    {
      title: "Building Instant Global Micro-Financing Infrastructure",
      desc: "Our financial engineers explain the low-level architecture supporting millions of daily transfers across emerging markets.",
      date: "May 12, 2026",
      read: "6 mins read",
      badge: "Fintech"
    }
  ];

  const customTestimonials = [
    {
      text: "EarnPay completely revolutionized my monthly side income! I complete simple brand promotions, watch Google Ad slots, and clear my payout settlements to my local bank instantly every weekend.",
      name: "Chinedu Okafor",
      role: "Premium Diamond Node",
      location: "Abuja, Nigeria",
      avatar: "CO",
      rating: 5,
      color: "from-emerald-500 to-teal-600"
    },
    {
      text: "As a digital agency director, we needed real, human, high-retention engagement on our client apps. EarnPay delivered 15k certified app installs inside 48 hours. The proof tracking ledger is flawless.",
      name: "Sophia Martinez",
      role: "E-Commerce Director",
      location: "Houston, TX",
      avatar: "SM",
      rating: 5,
      color: "from-sky-500 to-indigo-600"
    },
    {
      text: "I was hesitant, but the Free tier actually paid out airtime immediately. I've since upgraded to the Gold tier, which has doubled my task limits and unlocked the lucrative 15% referral bonus commission pools!",
      name: "Amina Yusuf",
      role: "Gold Tier Contributor",
      location: "Nairobi, Kenya",
      avatar: "AY",
      rating: 5,
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <div className="w-full flex flex-col bg-slate-950 text-slate-100 min-h-full font-sans selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      
      {/* Dynamic Background Blur Accents for Premium Vibe */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-10 w-[350px] h-[350px] bg-teal-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("home")}>
          <EarnPayLogo iconSize={32} />
        </div>

        {/* Desktop Menu with Framer Motion Sliding Backdrop */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-900">
          {menuItems.map((m) => {
            const isSelected = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id as any)}
                className={`relative px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                  isSelected ? "text-emerald-400" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/15 rounded-lg z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CTA Login / Signup buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAuth(false)}
            className="px-4 py-2 text-[11px] font-extrabold text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer uppercase tracking-wider"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigateAuth(true)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-md shadow-emerald-950/40 active:scale-95 cursor-pointer uppercase tracking-wider font-display"
          >
            Join Free
          </button>
        </div>
      </header>

      {/* RENDER PAGES CONTENT BASED ON SELECTED TAB */}
      <main className="flex-1 relative z-10">
        
        {/* ==================== 1. HOME VIEW ==================== */}
        {activeTab === "home" && (
          <div className="space-y-20 pb-20 animate-in fade-in duration-300">
            
            {/* HERO BANNER SECTION */}
            <section className="px-6 pt-16 pb-6 text-center space-y-6 max-w-4xl mx-auto">
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold"
              >
                <Sparkles size={11} className="text-emerald-400 animate-pulse" /> Certified Web3 & Microtask Rewards Platform
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-display"
              >
                Turn Every Engagement Into <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                  Real Money Payouts
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed"
              >
                Connect your social nodes, review local verified businesses, complete app promotions, and participate in targeted advertiser surveys on the most security-hardened earnings network on the globe. We serve world-wide users with instant settled cashouts.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
              >
                <button
                  onClick={() => onNavigateAuth(true)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-950/50 active:scale-95 cursor-pointer flex items-center justify-center gap-2 group font-display"
                >
                  Start Earning Free <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab("pricing")}
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display"
                >
                  View Tier Pricing
                </button>
              </motion.div>

              {/* PLATFORM APP DOWNLOAD BUTTONS */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 max-w-2xl mx-auto space-y-4 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-2 text-[9px] text-emerald-400 uppercase tracking-widest font-black font-mono">
                  <Download size={12} className="animate-bounce" /> 
                  Download EarnPay Mobile & Desktop Native Nodes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => launchNodeTerminal("Android")}
                    className="flex items-center justify-center gap-2.5 p-3 bg-emerald-600/5 hover:bg-emerald-600/10 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-350 rounded-xl transition-all font-display text-[11px] font-bold uppercase cursor-pointer"
                  >
                    <Smartphone size={14} />
                    <span>Android APK</span>
                  </button>
                  <button
                    onClick={() => launchNodeTerminal("iOS")}
                    className="flex items-center justify-center gap-2.5 p-3 bg-sky-600/5 hover:bg-sky-600/10 border border-sky-500/10 hover:border-sky-500/30 text-sky-400 hover:text-sky-350 rounded-xl transition-all font-display text-[11px] font-bold uppercase cursor-pointer"
                  >
                    <Apple size={14} />
                    <span>Apple iOS</span>
                  </button>
                  <button
                    onClick={() => launchNodeTerminal("Desktop")}
                    className="flex items-center justify-center gap-2.5 p-3 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-350 rounded-xl transition-all font-display text-[11px] font-bold uppercase cursor-pointer"
                  >
                    <Laptop size={14} />
                    <span>Desktop App</span>
                  </button>
                </div>
              </motion.div>

              {/* STATS STRIP */}
              <div className="grid grid-cols-3 gap-4 pt-10 border-b border-slate-900/60 pb-8 text-center max-w-3xl mx-auto">
                <div className="p-2 space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight">₦247M+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Payouts Cleared</p>
                </div>
                <div className="p-2 space-y-1 border-x border-slate-900">
                  <p className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">420K+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">User Nodes</p>
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight font-display">99.87%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Success Rate</p>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="px-6 max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <span className="text-[9px] bg-slate-900 text-emerald-400 px-3 py-1 border border-slate-850 rounded-full font-bold uppercase tracking-widest font-mono">
                  Simple Roadmap
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
                  How EarnPay Operates
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
                  Our system bridges digital channels with active workers seamlessly in three easy steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    icon: <Layers size={20} />,
                    title: "Configure Account",
                    desc: "Register your free account instantly. No subscription or deposits are required to start completing promotions.",
                    color: "group-hover:text-emerald-400 group-hover:bg-emerald-500/10"
                  },
                  {
                    step: "02",
                    icon: <Sparkles size={20} />,
                    title: "Execute Promotions",
                    desc: "Pick verified social media engagements, local business reviews, app promotion tasks, or high-yielding CPA offers.",
                    color: "group-hover:text-sky-400 group-hover:bg-sky-500/10"
                  },
                  {
                    step: "03",
                    icon: <Wallet size={20} />,
                    title: "Instant Settlement",
                    desc: "Earnings accumulate in your wallet. Withdraw to local banks or convert instantly to airtime bundles under SMS OTP security.",
                    color: "group-hover:text-amber-400 group-hover:bg-amber-500/10"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group p-6 bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 rounded-2xl relative space-y-4 transition-all duration-300 backdrop-blur-3xs"
                  >
                    <span className="absolute top-5 right-5 text-4xl font-black text-slate-800/30 font-mono transition-colors group-hover:text-emerald-500/15">
                      {item.step}
                    </span>
                    <div className={`h-11 w-11 bg-slate-950 border border-slate-850 text-slate-400 rounded-xl flex items-center justify-center transition-colors duration-300 ${item.color}`}>
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* BENTO HIGHLIGHT FEATURES */}
            <section className="bg-slate-900/10 border-y border-slate-900/60 py-16 px-6 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-900/20 to-slate-950/0 pointer-events-none" />
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                <div className="md:col-span-5 space-y-5 text-left">
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold font-mono uppercase tracking-widest">
                    Fintech Grade Safety
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug font-display">
                    Why Top Brands and Workers Trust Our Ledger
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    EarnPay provides a secure, verified, and stable payout ecosystem. We integrate advanced user verification gates, ensuring only authenticated, active users interact with and support your brand.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-350">
                    <li className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <span>Multi-modal SMS OTP transactional verification</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <span>Immutable proof of digital microtask completions</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <span>Transparent tiers scalable up to unlimited daily limits</span>
                    </li>
                  </ul>
                </div>

                {/* BENTO ILLUST GRID */}
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <ShieldCheck className="text-emerald-400" size={20} />,
                      title: "100% Verified Traffic",
                      desc: "Advanced device validation processes prevent duplicate claims, offering authentic engagement profiles for advertisers."
                    },
                    {
                      icon: <TrendingUp className="text-cyan-400" size={20} />,
                      title: "High CPA Conversions",
                      desc: "Advertisers scale targeted marketing campaigns at extremely predictable, pay-per-proven-conversion cost structures."
                    },
                    {
                      icon: <Coins className="text-amber-400" size={20} />,
                      title: "Flexible Payout Ledgers",
                      desc: "Local bank transactions, bill settlements, and airtime payouts are cleared smoothly under robust local channel security."
                    },
                    {
                      icon: <Globe className="text-teal-400" size={20} />,
                      title: "International Nodes",
                      desc: "Engineered as a borderless financial gateway. Workers can sign up and withdraw assets smoothly across emerging regions."
                    }
                  ].map((cell, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-5 bg-slate-950/70 border border-slate-900/80 hover:border-slate-800 rounded-2xl text-left space-y-2.5 transition-all shadow-md backdrop-blur-2xs"
                    >
                      {cell.icon}
                      <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                        {cell.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {cell.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* NEXT-GEN DYNAMIC ROI CALCULATOR */}
            <section className="px-6 max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <span className="text-[9px] bg-slate-900 text-amber-500 px-3.5 py-1 rounded-full border border-slate-850 font-bold uppercase tracking-widest font-mono">
                  Earnings Estimator
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
                  Interactive ROI Calculator
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
                  Select a target membership tier and estimate daily completed microtasks to calculate projected monthly and yearly payouts.
                </p>
              </div>

              <div className="p-6 md:p-8 bg-slate-900/40 border border-slate-900 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left shadow-2xl relative overflow-hidden backdrop-blur-sm">
                
                {/* Visual Glass Edge Decor */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                <div className="md:col-span-7 space-y-6">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 font-mono tracking-wider">
                      Select Target Tier Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Free", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sapphire"].map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => {
                            setSelectedTier(tier);
                            // Adjust estimated task slider within new limit
                            const maxLimit = membershipConfigs?.[tier]?.dailyTasksLimit || 10;
                            setEstimatedDailyDailyTasks(prev => Math.min(prev, maxLimit));
                          }}
                          className={`px-3 py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer border ${
                            selectedTier === tier 
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30"
                              : "bg-slate-950/80 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-extrabold text-slate-350 font-display uppercase tracking-wider">Estimated Tasks Completed Daily</span>
                      <span className="font-black text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10">
                        {computedDailyTasksVal} Tasks
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="range"
                        min={1}
                        max={currentTierConfig?.dailyTasksLimit || 10}
                        value={estimatedDailyDailyTasks}
                        onChange={(e) => setEstimatedDailyDailyTasks(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                      <span>1 TASK / AD</span>
                      <span className="uppercase">LIMIT: {currentTierConfig?.dailyTasksLimit || 10} FOR {selectedTier}</span>
                    </div>
                  </div>

                  {/* Active Tier Specifications Matrix */}
                  <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl space-y-2.5">
                    <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono tracking-widest border border-emerald-500/5">
                      Active Tier specs & limit caps
                    </span>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10.5px]">
                      <div className="flex justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-slate-450">• Price:</span>
                        <span className="font-bold text-slate-200 font-mono">₦{currentTierConfig?.price.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-slate-450">• Task Limit:</span>
                        <span className="font-bold text-slate-200 font-mono">{currentTierConfig?.dailyTasksLimit} Daily</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-slate-450">• Google Ads Cap:</span>
                        <span className="font-bold text-slate-200 font-mono">{currentTierConfig?.adsLimit} Views</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-slate-450">• Commissions:</span>
                        <span className="font-bold text-slate-200 font-mono">{(currentTierConfig?.referralCommission || 0) * 100}% Ref</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 p-6 bg-gradient-to-b from-slate-950 to-slate-900/80 border border-slate-900 rounded-2xl text-center space-y-4 shadow-xl">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold font-mono tracking-widest">
                      Projected Monthly Revenue
                    </p>
                    <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight mt-1">
                      ₦{totalMonthlyNGN.toLocaleString()}
                    </p>
                    
                    {/* Visual Meter bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalMonthlyNGN / 120000) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-inner"
                      />
                    </div>
                    
                    <p className="text-[8.5px] text-slate-500 mt-2 font-mono">
                      Task Payouts: ₦{dailyEarningsNGN * 30}/mo · Referral Boost: ₦{estimatedReferralNGN * 30}/mo
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-900/80 pt-3.5 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Daily Yield Index:</span>
                      <span className="font-mono text-white font-bold">₦{totalDailyNGN.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Annual Earnings Projection:</span>
                      <span className="font-mono text-emerald-400 font-black">₦{(totalMonthlyNGN * 12).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onNavigateAuth(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl cursor-pointer uppercase transition-all tracking-wider font-display shadow-md shadow-emerald-950/40"
                  >
                    Unlock {selectedTier} Node
                  </button>
                </div>
              </div>
            </section>

            {/* INTERACTIVE TESTIMONIALS SLIDER */}
            <section className="px-6 max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-2 flex flex-col items-center">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1 font-display">
                  Platform Contributor Success Stories
                </h3>
              </div>

              <div className="relative overflow-hidden p-0.5 rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-5 text-left relative"
                  >
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic font-sans">
                      "{customTestimonials[testimonialIdx].text}"
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-tr ${customTestimonials[testimonialIdx].color} text-[11px] font-black text-white flex items-center justify-center font-mono shadow-md shadow-slate-950/50`}>
                          {customTestimonials[testimonialIdx].avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none font-display">
                            {customTestimonials[testimonialIdx].name}
                          </p>
                          <p className="text-[9.5px] text-slate-450 mt-1 font-mono uppercase tracking-wide">
                            {customTestimonials[testimonialIdx].role} · {customTestimonials[testimonialIdx].location}
                          </p>
                        </div>
                      </div>

                      {/* Slider Navigation Controls */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setTestimonialIdx(prev => (prev === 0 ? customTestimonials.length - 1 : prev - 1))}
                          className="h-8 w-8 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={14} className="transform rotate-180" />
                        </button>
                        <button
                          onClick={() => setTestimonialIdx(prev => (prev === customTestimonials.length - 1 ? 0 : prev + 1))}
                          className="h-8 w-8 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dot Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {customTestimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        testimonialIdx === i ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <section className="px-6 max-w-3xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <span className="text-[9px] bg-slate-900 text-teal-400 px-3.5 py-1 rounded-full border border-slate-850 font-bold uppercase tracking-widest font-mono">
                  Troubleshooting
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((f, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-900 rounded-2xl bg-slate-900/10 overflow-hidden transition-all text-left backdrop-blur-3xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-4.5 flex justify-between items-center text-xs font-bold text-white hover:text-emerald-400 transition-all select-none cursor-pointer"
                      >
                        <span className="font-display tracking-wide">{f.q}</span>
                        <ChevronRight 
                          size={15} 
                          className={`transform transition-transform duration-300 ${isExpanded ? "rotate-90 text-emerald-400" : "text-slate-500"}`} 
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-4.5 pb-4.5 border-t border-slate-900/30 pt-2 text-xs text-slate-400 leading-relaxed font-sans">
                              {f.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        )}

        {/* ==================== 2. EARN DETAIL VIEW ==================== */}
        {activeTab === "earn" && (
          <div className="px-6 py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                Micro-Task Ledger
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display">
                Earn Payoff Opportunities
              </h1>
              <p className="text-xs text-slate-400">
                Complete verified promotional campaigns curated by top global brands. Real-time tasks are dispatched securely to active network nodes every 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <MessageSquare size={18} />,
                  title: "Social Channel Subscribes",
                  desc: "Join validated YouTube channels, Telegram groups, X profiles, or custom developer feeds to claim instant ledger payouts.",
                  accent: "text-teal-400 bg-teal-500/5 border-teal-500/10"
                },
                {
                  icon: <Star size={18} />,
                  title: "Maps & Application Reviews",
                  desc: "Leave honest, descriptive feedback on Google Maps listings or mobile application marketplaces to trigger smart-contract verification rewards.",
                  accent: "text-cyan-400 bg-cyan-500/5 border-cyan-500/10"
                },
                {
                  icon: <Coins size={18} />,
                  title: "High-Ticket Surveys & Signups",
                  desc: "Earn high payout margins (up to ₦1,200 per action) by completing advertiser demographics queries or secure portal registrations.",
                  accent: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                },
                {
                  icon: <BadgePercent size={18} />,
                  title: "Affiliate Referral Programs",
                  desc: "Introduce partners to the EarnPay rewards loop. Earn up to 15% recurring commission on their package upgrades and daily completed tasks.",
                  accent: "text-amber-400 bg-amber-500/5 border-amber-500/10"
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-5.5 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3 text-left hover:border-slate-800 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.accent}`}>
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-slate-900/40 border border-slate-900 rounded-2xl text-center space-y-4 max-w-lg mx-auto shadow-xl">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Ready to Claim Your Free Wallet?
              </h4>
              <p className="text-xs text-slate-405 leading-relaxed font-sans">
                Join our decentralized contributor network today. Start earning real-world currency immediately with standard tasks without any hidden deposits.
              </p>
              <button
                type="button"
                onClick={() => onNavigateAuth(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl cursor-pointer uppercase transition-all tracking-wider font-display shadow-md shadow-emerald-950/40"
              >
                Sign Up & Start Earning
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. ADVERTISERS DETAIL VIEW ==================== */}
        {activeTab === "advertisers" && (
          <div className="px-6 py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                Enterprise Campaigns
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display">
                Advertiser Business Solutions
              </h1>
              <p className="text-xs text-slate-400">
                Deploy validated targeted digital engagement pipelines to thousands of verified, active testers worldwide. Pay strictly for genuine, proven conversions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "🎯 Real Active Human Targets",
                  desc: "Every node in our contributor network represents an active mobile user validated via localized secure SMS OTP verification, filtering out fake engagement.",
                  accent: "text-cyan-400"
                },
                {
                  title: "⚡ Automated Callback Postbacks",
                  desc: "Integrate custom campaign API callbacks. Task completions are audited in real time, granting instant transparency for your campaign ROI.",
                  accent: "text-emerald-400"
                },
                {
                  title: "🔒 Capital Escrow Protection",
                  desc: "Campaign budgets are locked securely in EarnPay escrow vaults. Funds are only distributed to workers upon successful verification approval.",
                  accent: "text-amber-400"
                }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-3 text-left">
                  <div className={`font-black font-display text-sm uppercase ${item.accent}`}>
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950/20 to-slate-900/60 border border-slate-800 rounded-3xl max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-lg">
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">
                  Acquire Verified Conversions Instantly
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Launch localized Map campaigns, Play Store app installer pushes, Telegram subscriber pools, or custom CPA questionnaires.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateAuth(true)}
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl whitespace-nowrap cursor-pointer uppercase transition-all tracking-wider font-display shadow-md shadow-emerald-950/40"
              >
                Register Advertiser Account
              </button>
            </div>
          </div>
        )}

        {/* ==================== 4. PRICING VIEW ==================== */}
        {activeTab === "pricing" && (
          <div className="px-6 py-16 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                Subscriptions Matrix
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display">
                Membership Tier Price Levels
              </h1>
              <p className="text-xs text-slate-400">
                Upgrade your node level to unlock high-capacity daily task caps, priority payouts, and higher affiliate referral percentages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipConfigs ? (
                Object.keys(membershipConfigs).slice(0, 8).map((tierKey) => {
                  const item = membershipConfigs[tierKey];
                  const isPopular = tierKey === "Gold" || tierKey === "Silver";
                  return (
                    <motion.div 
                      key={tierKey} 
                      whileHover={{ y: -4 }}
                      className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                        isPopular
                          ? "bg-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20"
                          : "bg-slate-900/30 border-slate-900/80 hover:border-slate-800"
                      }`}
                    >
                      {tierKey === "Gold" && (
                        <span className="absolute -top-2.5 left-4 bg-emerald-600 text-white text-[8px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider border border-emerald-500">
                          Recommended Choice
                        </span>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">
                            {tierKey} Node
                          </p>
                          <p className="text-2xl font-black text-white font-mono mt-1">
                            ₦{item.price.toLocaleString()}
                          </p>
                          <p className="text-[8.5px] text-slate-500 mt-1 uppercase tracking-wider font-mono">
                            Validity: {item.durationDays || 365} Days
                          </p>
                        </div>

                        <div className="border-t border-slate-900 pt-4 space-y-2.5 text-[11px] font-sans">
                          <p className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> 
                            <span><strong className="text-white">{item.dailyTasksLimit}</strong> Daily Task Limit</span>
                          </p>
                          <p className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> 
                            <span><strong className="text-white">{item.adsLimit}</strong> Google Ads Views</span>
                          </p>
                          <p className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> 
                            <span><strong className="text-white">{item.referralCommission * 100}%</strong> Ref Commission</span>
                          </p>
                          <p className="flex items-center gap-2 text-slate-300">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> 
                            <span>Max: ₦{item.withdrawalLimit.toLocaleString()}/day</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigateAuth(true)}
                        className={`w-full py-2.5 rounded-xl text-[10.5px] font-extrabold uppercase tracking-wider transition-all mt-6 cursor-pointer ${
                          isPopular
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                            : "bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300"
                        }`}
                      >
                        Join {tierKey} Node
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <p className="col-span-4 text-center py-8 text-slate-500 font-mono">
                  Loading membership configs...
                </p>
              )}
            </div>
          </div>
        )}

        {/* ==================== 5. BLOG VIEW ==================== */}
        {activeTab === "blog" && (
          <div className="px-6 py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                Insights & Updates
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display">
                EarnPay Company Blog
              </h1>
              <p className="text-xs text-slate-400">
                Stay updated with digital microtask strategy guides, network security reviews, and emerging market fintech trends.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {blogPosts.map((post, idx) => (
                <div 
                  key={idx} 
                  className="p-5.5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors"
                >
                  <div className="space-y-3">
                    <span className="text-[8.5px] font-mono font-extrabold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {post.badge}
                    </span>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider leading-relaxed font-display">
                      {post.title}
                    </h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      {post.desc}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-3">
                    <span>{post.date}</span>
                    <span>{post.read}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. ABOUT VIEW ==================== */}
        {activeTab === "about" && (
          <div className="px-6 py-16 max-w-3xl mx-auto space-y-12 animate-in fade-in duration-300 text-left">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                Mission & Ledger
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display text-center">
                About Our Enterprise
              </h1>
              <p className="text-xs text-slate-400 text-center font-sans">
                A secure multi-modal digital workforce platform designed to bridge marketing capital with global microtask workers.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-4.5 leading-relaxed text-xs text-slate-300">
              <p>
                Founded on principles of strict device validation and escrow security, <strong className="text-white">EarnPay</strong> addresses the transparency gaps prevalent in digital promotional channels.
              </p>
              <p>
                Traditional microtask rewards platforms are often compromised by automated bots, repetitive fraudulent claims, and delayed or volatile payout cycles. By enforcing multi-factor verification handshakes and partnering with robust regional bank gateways, we ensure advertisers pay strictly for proven genuine interaction.
              </p>
              <p>
                Our platform operates as a decentralized workspace, empowering users across emerging economies to secure financial gains on-the-go.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl">
                <p className="text-2xl font-black text-emerald-400 font-mono">2024</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold font-mono">Initial Launch</p>
              </div>
              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl">
                <p className="text-2xl font-black text-cyan-400 font-mono">1.4M+</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold font-mono">Verified Tasks</p>
              </div>
              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl">
                <p className="text-2xl font-black text-amber-400 font-mono">Global</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold font-mono">Node Coverage</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 7. CONTACT VIEW ==================== */}
        {activeTab === "contact" && (
          <div className="px-6 py-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="md:col-span-5 space-y-6 text-left">
              <div className="space-y-3">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono font-bold">
                  Support Desk
                </span>
                <h1 className="text-3xl font-black text-white tracking-tight leading-none font-display">
                  Get In Touch
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Have inquiries regarding target campaigns, premium memberships, deposit routing, or withdrawal clearing status? Our customer service operate 24/7.
                </p>
              </div>

              <div className="space-y-4.5 text-xs text-slate-455">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-widest text-slate-500 font-mono">E-Mail Address</p>
                    <p className="font-bold text-slate-200 mt-0.5">support@earnpay.live</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-widest text-slate-500 font-mono">Direct Support Line</p>
                    <p className="font-bold text-slate-200 mt-0.5">{settings?.supportPhone || "+234 810 123 4567"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-widest text-slate-500 font-mono">Location Node</p>
                    <p className="font-bold text-slate-200 mt-0.5">Delaware, USA & Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="md:col-span-7 p-6 md:p-8 bg-slate-900/40 border border-slate-900 rounded-3xl text-left space-y-4 relative overflow-hidden shadow-xl backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                Security Ticket Channel
              </span>
              
              {contactFormSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-2xl space-y-4.5 text-center"
                >
                  <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black font-display uppercase tracking-wide">
                      Support Ticket Registered
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans max-w-[280px] mx-auto">
                      Your query has been logged securely under reference hash.
                    </p>
                  </div>
                  
                  {/* Ledger-like receipt block */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-left space-y-1.5 text-[10px] font-mono text-slate-400">
                    <p>• Reference ID: <span className="text-slate-100 font-bold">{contactTicketId}</span></p>
                    <p>• Timestamp: <span className="text-slate-100">{new Date().toISOString()}</span></p>
                    <p>• Queue Status: <span className="text-emerald-400 font-bold">STAGED (PRIORITY)</span></p>
                  </div>

                  <button 
                    onClick={() => {
                      setContactFormSubmitted(false);
                      setContactName("");
                      setContactEmail("");
                      setContactMsg("");
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-lg cursor-pointer"
                  >
                    Create New Ticket
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase font-mono">Legal Full Name</label>
                      <input 
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-600 transition-colors font-sans"
                        placeholder="e.g. Kola Adeleke"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase font-mono">Contact Email</label>
                      <input 
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-600 transition-colors font-sans"
                        placeholder="e.g. kola@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase font-mono">Detail Message Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-600 transition-colors font-sans"
                      placeholder="Specify campaign ID, wallet references, or tier requirements here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl cursor-pointer uppercase transition-all tracking-wider font-display shadow-md shadow-emerald-950/40"
                  >
                    Commit Ticket to Stack
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PROFESSIONAL FOOTER SYSTEM */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 text-xs text-slate-400 text-left select-none relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-slate-900/60 pb-8">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center font-display text-sm shadow-md">EP</div>
              <span className="font-display font-black text-sm text-slate-100 uppercase tracking-tight">EarnPay Network</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-sm">
              The professional multi-mode global rewards fintech carrier. Earn verified payouts completing daily surveys, brand promotions, app registers, and reviews securely.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h5 className="text-[10px] font-black uppercase text-slate-200 tracking-wider font-mono">Useful Channels</h5>
            <ul className="space-y-1.5 text-[10.5px]">
              <li><button onClick={() => setActiveTab("earn")} className="hover:text-emerald-400 text-left cursor-pointer bg-transparent border-0 p-0">Earner Node Program</button></li>
              <li><button onClick={() => setActiveTab("advertisers")} className="hover:text-emerald-400 text-left cursor-pointer bg-transparent border-0 p-0">Advertiser Solutions</button></li>
              <li><button onClick={() => setActiveTab("pricing")} className="hover:text-emerald-400 text-left cursor-pointer bg-transparent border-0 p-0">Subscription Pricing</button></li>
              <li><button onClick={() => setActiveTab("blog")} className="hover:text-emerald-400 text-left cursor-pointer bg-transparent border-0 p-0">Company Press / Blog</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3.5">
            <h5 className="text-[10px] font-black uppercase text-slate-200 tracking-wider font-mono">Escrow Ledger Protection</h5>
            <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
              EarnPay guarantees secure micro-financing operations under active terms of service. Certified platform verification logs secure real engagement indices.
            </p>
            <div className="flex gap-3 text-slate-400 pt-1">
              <Facebook size={14} className="hover:text-emerald-400 cursor-pointer transition-colors" />
              <Twitter size={14} className="hover:text-emerald-400 cursor-pointer transition-colors" />
              <MessageSquare size={14} className="hover:text-emerald-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-3">
          <p>© 2026 EarnPay Inc. Worldwide Micro-task Rewards Solutions. All Rights Reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => setLegalDoc("privacy")} className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-slate-500 font-sans">Privacy Statement</button>
            <button onClick={() => setLegalDoc("terms")} className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-slate-500 font-sans">Terms of Operations</button>
          </div>
        </div>
      </footer>

      {/* LEGAL MODAL WINDOWS */}
      {legalDoc && (
        <LegalDocsModal 
          initialTab={legalDoc} 
          onClose={() => setLegalDoc(null)} 
        />
      )}

      {/* INTERACTIVE DEVICE TERMINAL SIMULATOR MODAL */}
      {activeTerminalPlatform && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-950">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  device-installer-{activeTerminalPlatform.toLowerCase()}.sh
                </span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Terminal logs panel */}
            <div className="p-5 font-mono text-xs text-slate-300 space-y-2 min-h-[220px] max-h-[300px] overflow-y-auto text-left bg-slate-950">
              {terminalLogs.map((log, index) => {
                let colorClass = "text-slate-400";
                if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
                else if (log.includes("[SSL]") || log.includes("[SECURITY]")) colorClass = "text-cyan-400";
                else if (log.includes("[SYSTEM]")) colorClass = "text-indigo-400";
                
                return (
                  <p key={index} className={colorClass}>
                    {log}
                  </p>
                );
              })}
              
              {!terminalComplete && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 animate-pulse mt-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Configuring target local secure storage matrices...</span>
                </div>
              )}
            </div>

            {/* Installer Progress indicators */}
            <div className="px-5 pb-5 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>SETUP PROGRESS</span>
                  <span>{terminalProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${terminalProgress}%` }}
                  />
                </div>
              </div>

              {/* Action triggers */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60">
                <button
                  onClick={() => setActiveTerminalPlatform(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-350 text-[10px] font-extrabold rounded-lg font-mono tracking-wider cursor-pointer transition-colors"
                >
                  {terminalComplete ? "CLOSE CONSOLE" : "CANCEL SETUP"}
                </button>
                {terminalComplete && (
                  <button
                    onClick={() => {
                      setActiveTerminalPlatform(null);
                      onNavigateAuth(true); // Proceed to Registration
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg font-mono tracking-wider cursor-pointer transition-all"
                  >
                    ENTER REWARDS NODE
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
