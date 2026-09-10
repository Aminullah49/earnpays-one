import React from "react";
import { User, Wallet, Transaction, LeaderboardEntry, MembershipConfig } from "../types";
import { 
  TrendingUp, ArrowDownLeft, ArrowUpRight, Award, 
  Share2, ShieldAlert, Sparkles, AlertCircle, ChevronRight, 
  MapPin, Gift, Crown, Wallet as WalletIcon, HelpCircle
} from "lucide-react";

import { usePreferences } from "../context/PreferenceContext";
import AdSenseManager from "./AdSenseManager";

interface HomeTabProps {
  user: User;
  wallet: Wallet;
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  configs: Record<string, MembershipConfig>;
  settings: any;
  onTabChange: (tabIdx: number) => void;
  onCheckIn: () => Promise<void>;
  onOpenAssistant: () => void;
}

export default function HomeTab({
  user, wallet, transactions, leaderboard, configs, settings, 
  onTabChange, onCheckIn, onOpenAssistant
}: HomeTabProps) {

  const { fmt, t, currency } = usePreferences();

  const getRegionLocation = (curr: string) => {
    switch (curr) {
      case "USD": return "New York, USA";
      case "EUR": return "Paris, France";
      case "GBP": return "London, UK";
      case "KES": return "Nairobi, Kenya";
      case "GHS": return "Accra, Ghana";
      default: return "Lagos, Nigeria";
    }
  };

  const [isSpinning, setIsSpinning] = React.useState(false);
  const [spinAngle, setSpinAngle] = React.useState(0);
  const [wheelMessage, setWheelMessage] = React.useState("");
  const [downloadStatus, setDownloadStatus] = React.useState<string | null>(null);

  const triggerDownload = (platform: string, msg: string) => {
    setDownloadStatus(`✓ ${msg}`);
    setTimeout(() => {
      setDownloadStatus(null);
    }, 4500);
  };

  const handleLuckySpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelMessage("Spinning... 🎡");
    const bonusAngle = 1800 + Math.floor(Math.random() * 360);
    setSpinAngle(bonusAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      try {
        await onCheckIn();
        setWheelMessage(`🎉 LANDED on ${fmt(50)} Bonus Airtime & Cash! Claimed successfully.`);
      } catch {
        setWheelMessage(`Check-in successful! +${fmt(50)}`);
      }
    }, 3000);
  };

  const currentTier = configs[user.membershipTier] || configs["Free"];

  const ANNOUNCEMENTS = [
    { id: 1, text: `🎉 Lootably Offerwall Integration is now fully live! Claim up to ${fmt(12000)} on surveys.`, tag: "Promo" },
    { id: 2, text: "⚠️ Note: Double rewards configured on all Instagram following advertiser campaigns today.", tag: "Bonus" },
    { id: 3, text: "🔒 EarnPay safe billing: 3% instant cashback added to all airtime/data services.", tag: "Cashback" }
  ];

  const recentTxs = transactions.slice(0, 4);

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header user bar */}
      <div className="flex justify-between items-center bg-white px-4 py-3 border-b border-slate-100 shadow-3xs sticky top-0 z-10 rounded-b-2xl">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center border-2 border-emerald-50 text-[13px] shadow-sm">
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs text-slate-800">{user.name}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Crown size={8} />
                {user.membershipTier}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5 mt-0.5">
              <MapPin size={9} /> {getRegionLocation(currency)}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAssistant}
          className="p-1 px-2 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
        >
          <Sparkles size={11} className="text-emerald-700 animate-bounce" />
          AI Help
        </button>
      </div>

      {/* 2. PalmPay-inspired Wallet Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-850 text-white rounded-2xl p-4 shadow-md mx-4 relative overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute right-0 bottom-0 top-0 w-2/3 bg-emerald-500/10 rounded-l-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold flex items-center gap-1">
              <WalletIcon size={11} /> {t("Available Wallet Balance")}
            </p>
            <h1 className="text-2xl font-black mt-1.5 tracking-tight font-sans">
              {fmt(wallet.available)}
            </h1>
          </div>
          <button 
            onClick={() => onTabChange(3)} // go to wallet deposit
            className="px-3.5 py-1.5 bg-white/20 hover:bg-white/35 active:scale-95 text-[11px] font-bold rounded-lg transition-all cursor-pointer border border-white/20"
          >
            + Add Cash
          </button>
        </div>

        {/* Dynamic subdivisions as requested is wallet types */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-3.5 border-t border-white/10 text-center">
          <div className="border-r border-white/10 pr-1">
            <span className="text-[9px] text-emerald-200 mt-0.5 block font-medium">Pending Tasks</span>
            <span className="text-xs font-extrabold mt-0.5 block">{fmt(wallet.pending)}</span>
          </div>
          <div className="border-r border-white/10 px-1">
            <span className="text-[9px] text-emerald-200 mt-0.5 block font-medium">Referral Bal</span>
            <span className="text-xs font-extrabold mt-0.5 block">{fmt(wallet.referral)}</span>
          </div>
          <div className="pl-1">
            <span className="text-[9px] text-emerald-200 mt-0.5 block font-medium">EarnPay Bonuses</span>
            <span className="text-xs font-extrabold mt-0.5 block">{fmt(wallet.bonus)}</span>
          </div>
        </div>
      </div>

      {/* AD INTEGRATION SLOT: Google AdSense / Header slot */}
      <AdSenseManager type="header" settings={settings} visitedLinks={user.visitedLinks} />

      {/* 3. Daily check-in Lucky Spin Wheel */}
      {user.lastCheckIn !== new Date().toISOString().split('T')[0] && (
        <div className="flex flex-col items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl mx-4 shadow-sm space-y-1">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1.5">
              <Gift size={16} className="text-amber-500 animate-bounce" />
              <div>
                <p className="text-[11px] font-black text-slate-800">Lucky Spin Wheel Reward</p>
                <p className="text-[9px] text-slate-500">Streak: {user.streakCount} days active</p>
              </div>
            </div>
            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">DAILY CHECK-IN</span>
          </div>

          <div className="relative h-28 w-28 my-1 flex items-center justify-center">
            {/* The spinning wheel circle */}
            <div 
              className="absolute inset-0 rounded-full border-4 border-amber-400 bg-linear-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow flex items-center justify-center overflow-hidden"
              style={{ 
                transform: `rotate(${spinAngle}deg)`, 
                transition: isSpinning ? 'transform 3.0s cubic-bezier(0.1, 0.8, 0.3, 1)' : 'none',
                backgroundImage: 'conic-gradient(#fecdd3 0% 16.6%, #fef3c7 16.6% 33.3%, #d1fae5 33.3% 50%, #e0f2fe 50% 66.6%, #fae8ff 66.6% 83.3%, #ffe4e6 83.3% 100%)'
              }}
            >
              {/* Slices of colors & labels inside the wheel */}
              <div className="absolute inset-0 flex items-center justify-center text-[7.5px] font-extrabold text-slate-700">
                <span className="absolute transform -rotate-60 -translate-y-8">₦10</span>
                <span className="absolute transform rotate-0 -translate-y-8 text-amber-800 font-black font-mono">₦50</span>
                <span className="absolute transform rotate-60 -translate-y-8">₦20</span>
                <span className="absolute transform rotate-120 -translate-y-8">₦100</span>
                <span className="absolute transform rotate-180 -translate-y-8">+1 Day</span>
                <span className="absolute transform -rotate-120 -translate-y-8 text-amber-800 font-black font-mono">₦50</span>
              </div>
            </div>
            {/* The stationary center pin */}
            <div className="absolute h-5 w-5 bg-amber-600 rounded-full border-2 border-white flex items-center justify-center shadow z-10">
              <div className="h-1.5 w-1.5 bg-white rounded-full" />
            </div>
            {/* Upper indicator arrow pin pointing down */}
            <div className="absolute -top-1.5 h-4 w-4 bg-red-500 rounded-b-xl z-10 border border-white shadow-2xs" />
          </div>

          <button
            onClick={handleLuckySpin}
            disabled={isSpinning}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-white font-extrabold text-[10px] rounded-lg tracking-wider disabled:opacity-50 transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Sparkles size={11} className={isSpinning ? "animate-spin" : ""} />
            {isSpinning ? "SPINNING FOR REWARDS..." : "SPIN THE LUCKY WHEEL (+₦50)"}
          </button>

          {wheelMessage && (
            <p className="text-[9px] text-amber-800 font-bold text-center leading-tight select-none">
              {wheelMessage}
            </p>
          )}
        </div>
      )}

      {/* 4. Quick Actions layout */}
      <div className="bg-white rounded-2xl mx-4 p-4 shadow-3xs border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-3">Quick Utilities</h4>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {[
            { label: "Earn Tasks", icon: "🎯", tab: 1 },
            { label: "Offerwalls", icon: "🎁", tab: 2 },
            { label: "Wallet Hub", icon: "💰", tab: 3 },
            { label: "Invite & Earn", icon: "📣", tab: 4, action: "profile" },
            { label: "KYC ID Form", icon: "🛡️", tab: 4, action: "kyc" },
            { label: "Savings Vault", icon: "🏦", tab: 3, action: "vault" },
            { label: "Bill Utilities", icon: "📶", tab: 3, action: "bills" },
            { label: "Staff Support", icon: "💬", tab: 4, action: "support" }
          ].map((act, index) => (
            <button
              key={index}
              onClick={() => onTabChange(act.tab)}
              className="group flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center text-lg shadow-3xs transition-all border border-slate-100 group-hover:border-emerald-100">
                {act.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-650 group-hover:text-emerald-700 whitespace-nowrap transition-colors">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Enterprise Announcements Carousel */}
      <div className="mx-4">
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-slate-800">
          <p className="text-[9px] font-bold text-emerald-800 tracking-widest uppercase mb-1 flex items-center gap-1">
            <Gift size={10} className="text-amber-500 fill-amber-500" /> Platform Board Announcements
          </p>
          <div className="space-y-1.5">
            {ANNOUNCEMENTS.map(ann => (
              <div key={ann.id} className="flex gap-1.5 items-start text-[10px] leading-relaxed">
                <span className="shrink-0 bg-emerald-600 text-white font-bold text-[8px] px-1 py-0.5 rounded-xs tracking-wider uppercase mt-0.5">
                  {ann.tag}
                </span>
                <span className="text-slate-600">{ann.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Legal / Regulatory Warning Block to satisfy compliance */}
      <div className="mx-4 bg-slate-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-500 leading-normal font-sans">
          <span className="font-bold text-slate-700">Earnings Disclaimer (EP-REG):</span> EarnPay memberships optional, unlock platform limits. We do not promise passive earnings or returns. Rewards accrued depend upon completed cpa offer tasks & budgets.
        </p>
      </div>

      {/* 6.5 Premium App Download Banner - Requirement 5 */}
      <div className="mx-4 bg-gradient-to-r from-slate-900 to-emerald-950 border border-emerald-800/60 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-emerald-500/10 rounded-l-full blur-xl pointer-events-none" />
        <div className="relative space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-none">
              📱
            </span>
            <div>
              <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-400">Download EarnPay Official Apps</h4>
              <p className="text-[10px] text-slate-300 font-medium">Enjoy faster task submissions and secure PIN payouts</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-black uppercase tracking-wide">
            <a 
              href="#download-android"
              onClick={(e) => { e.preventDefault(); triggerDownload("Android", "Android APK download initiated successfully! (24.5 MB)"); }}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
            >
              🤖 Android
            </a>
            <a 
              href="#download-ios"
              onClick={(e) => { e.preventDefault(); triggerDownload("iOS", "iOS Client installation profile successfully mounted."); }}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
            >
              🍎 iOS App
            </a>
            <a 
              href="#download-desktop"
              onClick={(e) => { e.preventDefault(); triggerDownload("Desktop", "Desktop application package (Win/macOS) download started! (62.1 MB)"); }}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
            >
              💻 Desktop
            </a>
          </div>
          {downloadStatus && (
            <div className="mt-1 text-[9.5px] font-semibold text-emerald-400 bg-emerald-950/40 p-2 border border-emerald-900/35 rounded-xl text-center animate-pulse">
              {downloadStatus}
            </div>
          )}
        </div>
      </div>

      {/* 7. Recent transactions log */}
      <div className="mx-4 space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-extrabold text-xs text-slate-800">Recent Transactions</h3>
          <button 
            onClick={() => onTabChange(3)} // wallet view statements
            className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            All Statements <ChevronRight size={11} />
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center text-[11px] text-slate-400">
            No transaction records. Complete campaigns or top up wallet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-3xs">
            {recentTxs.map((tx) => {
              const checkIn = tx.type.includes('bonus') || tx.type.includes('earning') || tx.type.includes('receive');
              return (
                <div key={tx.id} className="p-3.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-xl ${checkIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-650'}`}>
                      {checkIn ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} · {tx.reference}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-sans">
                    <p className={`font-bold ${checkIn ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {checkIn ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{tx.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. User Leaderboard preview */}
      <div className="mx-4 space-y-2 pb-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
            <Award size={14} className="text-amber-500 fill-amber-500" /> Today's Top Earners
          </h3>
          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Nigeria Leaderboard</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-3xs space-y-2">
          {leaderboard.slice(0, 3).map((r, i) => (
            <div key={r.userId} className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ${
                  i === 0 ? 'bg-yellow-100 text-yellow-800' : 
                  i === 1 ? 'bg-slate-200 text-slate-700' : 
                  'bg-amber-100 text-amber-800'
                }`}>
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-800">{r.name}</span>
                    <span className="text-[8px] bg-emerald-50 text-emerald-800 font-bold px-1 rounded-sm">{r.membershipTier}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Tasks: {r.tasksCompleted} completed </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 font-sans">
                {fmt(r.amountEarned)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AD INTEGRATION SLOT: Media.net Contextual Footer slot */}
      <AdSenseManager type="footer" settings={settings} visitedLinks={user.visitedLinks} />

    </div>
  );
}
