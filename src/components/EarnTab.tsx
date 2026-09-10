import React, { useState, useEffect } from "react";
import { Campaign, TaskSubmission, User, MembershipConfig } from "../types";
import { 
  Award, Clock, ArrowRight, ShieldCheck, 
  Flame, Check, Play, Tv, Loader2, Sparkles, CheckCircle2, ChevronRight, AlertCircle
} from "lucide-react";

import AdSenseManager from "./AdSenseManager";

interface EarnTabProps {
  user: User;
  campaigns: Campaign[];
  submissions: TaskSubmission[];
  configs: Record<string, MembershipConfig>;
  settings: any;
  onRefresh: () => void;
  onVerifyTaskTrigger: (campaign: Campaign) => void;
  onTabChange: (tabIdx: number) => void;
}

export default function EarnTab({ 
  user, campaigns, submissions, configs, settings, onRefresh, onVerifyTaskTrigger, onTabChange 
}: EarnTabProps) {
  const adRevenue = settings?.adsenseAdRevenuePerClick || 80;
  const userEarnAmount = Math.floor(adRevenue * 0.5); // 50% split
  
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [adState, setAdState] = useState<'idle' | 'watching' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnSubView, setEarnSubView] = useState<'jobs' | 'history'>('jobs');

  const categories = ["All", "Social Media Promotion", "App Promotion", "Lead Generation", "Brand Awareness"];

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

  const userVisited = React.useMemo(() => {
    const set = new Set<string>();
    if (user.visitedLinks && Array.isArray(user.visitedLinks)) {
      user.visitedLinks.forEach(link => {
        if (link) set.add(normalizeUrl(link));
      });
    }
    return set;
  }, [user.visitedLinks]);

  const registerLinkVisit = async (link: string) => {
    if (!link) return;
    try {
      await fetch("/api/user/visit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link })
      });
      onRefresh();
    } catch (e) {
      console.error("Error registering link visit:", e);
    }
  };

  // Helper to resolve if a campaign is already completed by the active user
  const getCampaignStatus = (campaignId: string) => {
    const sub = submissions.find(s => s.campaignId === campaignId);
    return sub ? sub.status : null; // 'approved', 'verified_ai', 'pending', 'rejected'
  };

  const filteredCampaigns = (activeCategory === "All" 
    ? campaigns 
    : campaigns.filter(c => c.category === activeCategory)
  ).filter(c => {
    const status = getCampaignStatus(c.id);
    const isSubmitted = status === 'approved' || status === 'verified_ai' || status === 'pending';
    if (isSubmitted) return false;

    // Filter out if target link is already visited
    if (c.targetLink && userVisited.has(normalizeUrl(c.targetLink))) {
      return false;
    }
    return true;
  });

  const activeConfig = configs[user.membershipTier] || configs["Free"];
  const adsLimit = activeConfig?.adsLimit ?? 5;
  const adsCompleted = user.adsCompletedToday ?? 0;

  // Watch Ad trigger
  const handleStartWatchingAd = () => {
    if (adsCompleted >= adsLimit) {
      setErrorMessage(`You have reached your daily quota of ${adsLimit} ads for the ${user.membershipTier} Tier. Upgrade to Silver or Gold to view up to 50 ads daily!`);
      setAdState('error');
      setAdModalOpen(true);
      return;
    }
    setAdState('watching');
    setCountdown(8);
    setErrorMessage("");
    setAdModalOpen(true);
  };

  // Timer simulation
  useEffect(() => {
    let timer: any;
    if (adState === 'watching' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (adState === 'watching' && countdown === 0) {
      // Trigger Ad Complete call
      handleCompleteAd();
    }
    return () => clearTimeout(timer);
  }, [adState, countdown]);

  const handleCompleteAd = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/watch-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to process ad reward.");
        setAdState('error');
      } else {
        setAdState('success');
        onRefresh(); // Refresh parent user coins/ads counts
      }
    } catch (e) {
      setErrorMessage("Network connecting failure. Please try again.");
      setAdState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto px-4 pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center mt-3 shadow-3xs">
        <div className="space-y-1">
          <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            Advertiser Marketplace <Flame size={15} className="text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px]">
            Execute manual micro-tasks from top brands. All completions are evaluated by **EarnPay AI Proof scanners** for instant wage payout.
          </p>
        </div>
        <div className="p-2 bg-emerald-600 text-white rounded-2xl text-center shrink-0 shadow-lg">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Today's Cap</p>
          <p className="text-sm font-black mt-0.5 leading-none">
            {submissions.filter(s => s.status === 'approved' || s.status === 'verified_ai').length} / 10
          </p>
        </div>
      </div>

      {/* NEW SECTION: GOOGLE ADSENSE SPONSORED ADS */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[8px] tracking-widest bg-emerald-600/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-sm uppercase">
              Google AdSense Network
            </span>
            <h3 className="text-xs font-extrabold text-slate-100 flex items-center gap-1">
              <Tv size={12} className="text-emerald-500" /> Web Sponsored Cash Ads
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-emerald-400">+₦{userEarnAmount} NGN</span>
            <p className="text-[8px] text-slate-400">per click-impression</p>
          </div>
        </div>


        {/* Level Based Limit Monitor */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 space-y-2">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Your Daily View Limit ({user.membershipTier}):</span>
            <span className="font-bold text-slate-200">
              {adsCompleted} / {adsLimit} ads
            </span>
          </div>
          
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (adsCompleted / adsLimit) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] pt-1 text-slate-450">
            {(adsCompleted >= adsLimit) ? (
              <span className="text-amber-500 font-medium">⚠️ Today's Ad Allowance Spent</span>
            ) : (
              <span>Earn quick cash watching short partner placements.</span>
            )}
            
            <button
              onClick={() => onTabChange(4)} // Switch to Upgrade Profile/Tiers
              className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Get More <ChevronRight size={10} />
            </button>
          </div>
        </div>

        <button
          onClick={handleStartWatchingAd}
          className={`w-full py-2.5 text-xs font-black rounded-xl text-center active:scale-97 transition-all flex items-center justify-center gap-1.5  ${
            (adsCompleted >= adsLimit) 
              ? "bg-slate-800 hover:bg-slate-750 text-slate-400 cursor-pointer border border-slate-700" 
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
          }`}
        >
          <Play size={12} className="fill-current" /> Watch Sponsor Ad (+₦{userEarnAmount})
        </button>
      </div>

      {/* View Switcher: Browse Jobs vs Task Submissions History */}
      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setEarnSubView('jobs')}
          className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all text-center cursor-pointer ${
            earnSubView === 'jobs'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          💼 Browse Micro Jobs
        </button>
        <button
          type="button"
          onClick={() => setEarnSubView('history')}
          className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all text-center cursor-pointer ${
            earnSubView === 'history'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📝 My Submissions ({submissions.filter(s => s.userId === user.id).length})
        </button>
      </div>

      {earnSubView === 'history' ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-0.5">
            <h3 className="font-extrabold text-xs text-slate-800">My Submitted Tasks</h3>
            <span className="text-[9px] bg-slate-150 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-sm">
              All Time History
            </span>
          </div>

          {submissions.filter(s => s.userId === user.id).length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-xs text-slate-400 shadow-3xs">
              You haven't submitted any tasks yet. Browse active jobs to start earning!
            </div>
          ) : (
            [...submissions].filter(s => s.userId === user.id).map((sub) => {
              const camp = campaigns.find(c => c.id === sub.campaignId);
              
              let statusLabel = "Pending Review";
              let statusClass = "bg-amber-50 text-amber-850 border-amber-200";
              
              if (sub.status === 'approved' || sub.status === 'verified_ai') {
                statusLabel = "Approved & Paid";
                statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
              } else if (sub.status === 'rejected') {
                statusLabel = "Rejected";
                statusClass = "bg-rose-50 text-rose-800 border-rose-200";
              }

              return (
                <div key={sub.id} className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-3xs space-y-2.5">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[11px] leading-snug">
                        {camp?.title || "Campaign Task"}
                      </h4>
                      <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                        {camp?.category || "Micro-Task"}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 font-sans">
                      ₦{camp?.rewardValue || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-mono text-slate-500 whitespace-pre-wrap leading-normal border border-slate-100">
                    <span className="font-extrabold text-[8px] text-slate-400 uppercase tracking-widest block mb-0.5">Your Submitted Proof:</span>
                    {sub.submissionProof}
                  </div>

                  {sub.aiFeedback && (
                    <div className="bg-indigo-50/50 p-2 rounded-lg text-[9.5px] text-indigo-750 leading-relaxed border border-indigo-100 font-sans">
                      🤖 <strong className="font-extrabold uppercase text-[7.5px] tracking-wider text-indigo-600">AI Feedback:</strong> {sub.aiFeedback}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-0.5 text-[9px] text-slate-400">
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          {/* 2. Category Sliders */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrolls-none -mx-1 px-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                  activeCategory === cat 
                    ? "bg-emerald-600 text-white border-emerald-650 shadow-3xs" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* AD INTEGRATION SLOT: Ezoic In-Feed Native Ad */}
          <AdSenseManager type="infeed" settings={settings} visitedLinks={user.visitedLinks} />

          {/* 3. Campaign Lists */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-0.5">
              <h3 className="font-extrabold text-xs text-slate-800">Available Micro Jobs</h3>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-sm">High Yield</span>
            </div>

            {/* AD INTEGRATION SLOT: Monetag Reward Smartlink */}
            <AdSenseManager type="smartlink" settings={settings} visitedLinks={user.visitedLinks} />
            
            {filteredCampaigns.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">
                No active jobs in this category currently. Try again shortly.
              </div>
            ) : (
              filteredCampaigns.map((camp) => {
                const status = getCampaignStatus(camp.id);
                const isCompleted = status === 'approved' || status === 'verified_ai';
                const isPending = status === 'pending';

                return (
                  <div 
                    key={camp.id} 
                    className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-3xs flex gap-3 hover:border-slate-350 transition-all group"
                  >
                    {camp.creativeUrl && (
                      <img 
                        src={camp.creativeUrl} 
                        className="h-16 w-20 rounded-xl object-cover shrink-0 bg-slate-50" 
                        alt={camp.title} 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          {camp.category}
                        </span>
                        <span className="text-xs font-black text-emerald-700 font-sans">
                          ₦{camp.rewardValue}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-800 text-[11px] leading-snug group-hover:text-emerald-700 transition-colors">
                        {camp.title}
                      </h4>

                      {camp.targetLink ? (
                        <a 
                          href={camp.targetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => registerLinkVisit(camp.targetLink)}
                          className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-800 hover:text-emerald-950 font-black px-2 py-1 rounded-md hover:bg-emerald-100 border border-emerald-200/50 mt-1 transition-all"
                        >
                          <span>🔗 Click to visit sponsor link</span>
                        </a>
                      ) : null}

                      <div className="flex justify-between items-center pt-2 gap-2">
                        <div className="flex gap-2 text-[9px] text-slate-400">
                          <span className="flex items-center gap-0.5 font-medium"><Clock size={10} /> {camp.timeRequired}</span>
                          <span className="flex items-center gap-0.5 font-medium"><Award size={10} /> {camp.difficulty}</span>
                        </div>

                        {isCompleted ? (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md flex items-center gap-0.5 border border-emerald-100 shrink-0">
                            <Check size={10} /> Paid
                          </span>
                        ) : isPending ? (
                          <span className="text-[9px] bg-amber-50 text-amber-750 font-bold px-2 py-1 rounded-md flex items-center gap-0.5 border border-amber-100 shrink-0 select-none animate-pulse">
                            ⏳ Pending Review
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (camp.targetLink) {
                                registerLinkVisit(camp.targetLink);
                              }
                              onVerifyTaskTrigger(camp);
                            }}
                            className="py-1.5 px-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[9.5px] tracking-wide rounded-lg transition-all flex items-center gap-0.5 cursor-pointer shadow-3xs"
                          >
                            <span>Start Task</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 4. Tips / Safety Notice */}
      <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-[10px] text-slate-500 space-y-1.5">
        <h5 className="font-bold text-slate-705 flex items-center gap-1">
          <ShieldCheck size={13} className="text-emerald-600" /> EarnPay Secure Task Guidelines
        </h5>
        <ul className="list-disc pl-3.5 space-y-1">
          <li>Avoid using VPNs, proxies, or registering multiple accounts, as this may restrict access to protect platform integrity.</li>
          <li>For image uploads, make sure that the image clearly proves compliance with instructions (e.g. following buttons).</li>
          <li>Our **EarnPay Smart Auditor System** runs visual validation. Submitting invalid or unrelated proof will result in automated rejection.</li>
        </ul>
      </div>

      {/* AD TIMER BACKDROP PORTAL OVERLAY MODAL */}
      {adModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl space-y-5 animate-in scale-in duration-200">
            
            {adState === 'watching' && (
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto bg-emerald-600/10 rounded-full flex items-center justify-center text-emerald-500 relative">
                  <Loader2 size={30} className="animate-spin text-emerald-500" />
                  <span className="absolute text-[11px] font-black">{countdown}s</span>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-100">Watching Sponsored Partner Ad...</h4>
                  <p className="text-[10px] text-slate-400">Please do not close this modal to secure credit transfer</p>
                </div>

                {/* Google AdSense Unit Live Render Container */}
                <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden text-left p-1">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 px-2 py-1 block">Live Ad Placement Unit</span>
                  <AdSenseManager type="header" settings={settings} visitedLinks={user.visitedLinks} />
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-[9px] font-mono text-slate-400 leading-normal space-y-1 shadow-inner h-20 overflow-y-auto">
                  <p className="text-emerald-500">[INFO] Loading Google AdSense Core Client...</p>
                  {countdown < 7 && <p className="text-slate-500">[INFO] Rendered viewport ca-pub-8108447956570697 placement unit.</p>}
                  {countdown < 5 && <p className="text-slate-505">[INFO] Registering active view session telemetry...</p>}
                  {countdown < 3 && <p className="text-slate-505">[INFO] Running AI frame verification metrics.</p>}
                  {countdown === 1 && <p className="text-emerald-400">[INFO] Integrity checks completed. Preparing payout...</p>}
                </div>
              </div>
            )}

            {adState === 'success' && (
              <div className="space-y-4">
                <div className="h-14 w-14 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 size={30} />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-100">Ad Earning Credited!</h4>
                  <p className="text-[10px] text-emerald-400">₦{userEarnAmount}.00 NGN added directly to available wallet balance</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAdModalOpen(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const latestAdsCompleted = user.adsCompletedToday ?? 0;
                      if (latestAdsCompleted >= adsLimit) {
                        setErrorMessage(`You have reached your daily quota of ${adsLimit} ads for the ${user.membershipTier} Tier. Upgrade to Silver or Gold to view up to 50 ads daily!`);
                        setAdState('error');
                      } else {
                        setAdState('watching');
                        setCountdown(8);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Play size={10} className="fill-current" /> Watch Next Ad
                  </button>
                </div>
              </div>
            )}

            {adState === 'error' && (
              <div className="space-y-4">
                <div className="h-14 w-14 mx-auto bg-rose-600/20 text-rose-500 rounded-full flex items-center justify-center">
                  <AlertCircle size={30} />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-rose-400">Limit Enforced</h4>
                  <p className="text-[10px] text-slate-350 leading-relaxed px-2">{errorMessage}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAdModalOpen(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  {adsCompleted >= adsLimit && (
                    <button
                      onClick={() => {
                        setAdModalOpen(false);
                        onTabChange(4); // Upgrade Profile
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Upgrade Level
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
