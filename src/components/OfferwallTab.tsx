import React, { useState } from "react";
import { Offer, User, OfferCompletion, Campaign } from "../types";
import { 
  Gift, Layers, Filter, ExternalLink, RefreshCw, 
  CheckCircle, ArrowRight, Play, Loader2, Star, Sparkles
} from "lucide-react";

interface OfferwallTabProps {
  user: User;
  offers: Offer[];
  campaigns?: Campaign[];
  offerCompletions?: OfferCompletion[];
  onCompleteOffer: (offerId: string) => Promise<void>;
  onRegisterClick?: (offerId: string, network: string, amountNGN: number) => Promise<void>;
  settings?: any;
}

export default function OfferwallTab({ user, offers, campaigns = [], offerCompletions = [], onCompleteOffer, onRegisterClick, settings }: OfferwallTabProps) {
  const [activeNetwork, setActiveNetwork] = useState<string>("All");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Tracking simulator states
  const [trackingOffer, setTrackingOffer] = useState<Offer | null>(null);
  const [trackingStep, setTrackingStep] = useState<"idle" | "directing" | "watching" | "success" | "live_pending">("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  // Live S2S Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const handleSimulatePostback = async (networkName: string) => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const mockPayout = 1500; // 1500 NGN or equivalent
      const mockLeadId = `TEST-S2S-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const mockOfferId = `OFF-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const netKey = networkName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const res = await fetch(`/api/postback/${netKey}?subid=${user.id}&payout=${mockPayout}&lead_id=${mockLeadId}&offer_id=${mockOfferId}`);
      if (res.ok) {
        const payoutSplit = Math.floor(mockPayout * ((settings?.offerwallUserPercentage ?? 50) / 100));
        setSimulationResult(`SUCCESS 🎉: Simulated postback successfully processed! NGN ₦${payoutSplit} has been split and credited to your available balance. Reloading balance...`);
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        const txt = await res.text();
        setSimulationResult(`Simulation Rejected: ${txt}`);
      }
    } catch (err: any) {
      setSimulationResult(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  // Dynamic networks list solely from active settings, falling back to presets if settings are not loaded yet
  const activeSettingsNetworksObj = settings?.apiNetworks
    ? settings.apiNetworks.filter((n: any) => n.status === "active")
    : [
        { name: "CPAlead", url: "https://www.cdnnd.com/wall/6fSsGxBr", status: "active" },
        { name: "CPAGrip", url: "https://playabledownloads.com/show.php?l=1904822", status: "active" },
        { name: "Lootably", url: "https://lootably.com/api", status: "active" },
        { name: "BitLabs", url: "https://bitlabs.ai/api", status: "active" },
        { name: "Monlix", url: "https://monlix.com/api", status: "active" }
      ];

  const activeSettingsNetworks = activeSettingsNetworksObj.map((n: any) => n.name);
  
  const networks = Array.from(new Set(["All", "EarnPay Premium Tasks", ...activeSettingsNetworks]));
  const categories = [
    "All", "Watch Videos", "Read & Comment", "Likes & Shares", "Opinions & Reviews", "Surveys", "App Installs", "Finance Offers", "Gaming Offers", "Crypto Offers"
  ];

  const mapCampaignCategoryToOfferCategory = (c: Campaign): Offer["category"] => {
    const titleLower = c.title.toLowerCase();
    const instLower = c.instructions.toLowerCase();
    
    if (titleLower.includes("video") || titleLower.includes("watch") || titleLower.includes("youtube") || titleLower.includes("tiktok") || titleLower.includes("reel")) {
      return "Watch Videos";
    }
    if (titleLower.includes("read") || titleLower.includes("article") || titleLower.includes("blog") || titleLower.includes("medium")) {
      return "Read & Comment";
    }
    if (titleLower.includes("like") || titleLower.includes("retweet") || titleLower.includes("share") || titleLower.includes("twitter") || titleLower.includes("instagram") || titleLower.includes("follow") || titleLower.includes("tiktok")) {
      return "Likes & Shares";
    }
    if (titleLower.includes("review") || titleLower.includes("opinion") || titleLower.includes("comment")) {
      return "Opinions & Reviews";
    }
    if (titleLower.includes("survey") || titleLower.includes("poll") || titleLower.includes("questionnaire")) {
      return "Surveys";
    }
    return "App Installs";
  };

  const filteredNetworksList = activeSettingsNetworksObj.filter((net: any) => {
    return activeNetwork === "All" || net.name === activeNetwork;
  });

  const campaignOffers: Offer[] = (campaigns || [])
    .filter(c => c.status === "active" && c.remainingBudget > 0)
    .map(c => ({
      id: `camp-offer-${c.id}`,
      network: "EarnPay Premium Tasks" as any,
      title: c.title,
      description: c.instructions,
      rewardAmount: c.rewardValue,
      estimatedTime: c.timeRequired || "3 Mins",
      difficulty: c.difficulty || "Easy",
      category: mapCampaignCategoryToOfferCategory(c),
      offerUrl: c.targetLink || "#"
    }));

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

  const allOffers = [...offers, ...campaignOffers];

  const filteredOffers = allOffers.filter(o => {
    const netMatch = activeNetwork === "All" || (o.network as string) === activeNetwork;
    const catMatch = activeCategory === "All" || o.category === activeCategory;
    const isCompleted = offerCompletions.some(oc => oc.offerId === o.id);
    if (isCompleted) return false;

    // Filter out if offer's url is already visited/completed
    if (o.offerUrl && o.offerUrl !== "#" && userVisited.has(normalizeUrl(o.offerUrl))) {
      return false;
    }
    return netMatch && catMatch;
  });

  const triggerOfferSimulation = (offer: Offer) => {
    setTrackingOffer(offer);
    setTrackingStep("directing");
    setSecondsRemaining(3);

    // Register visit in the background if there's a valid external URL
    if (offer.offerUrl && offer.offerUrl !== "#") {
      fetch("/api/user/visit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: offer.offerUrl })
      }).catch(err => console.error("Error registering visit:", err));
    }

    let finalOfferUrl = offer.offerUrl || "";
    if (offer.network === "CPAlead") {
      finalOfferUrl = `https://www.cdnnd.com/wall/6fSsGxBr?subid=${user.id}&offer_id=${offer.id}`;
    } else if (offer.network === "CPAGrip") {
      finalOfferUrl = `https://playabledownloads.com/show.php?l=1904822&subid=${user.id}&offer_id=${offer.id}`;
    } else if (offer.network === "BitLabs") {
      finalOfferUrl = `https://web.bitlabs.ai/?token=ee9047d8-3445-43ff-83bc-fae291b70b3e&uid=${user.id}&offer_id=${offer.id}`;
    } else if (offer.network === "Lootably") {
      finalOfferUrl = `https://wall.lootably.com/?placementID=6fSsGxBr&sid=${user.id}&offer_id=${offer.id}`;
    } else if (offer.network === "Monlix") {
      finalOfferUrl = `https://monlix.com/offerwall?appKey=earnpay&userId=${user.id}&offer_id=${offer.id}`;
    } else if (finalOfferUrl && finalOfferUrl !== "#") {
      const sep = finalOfferUrl.includes("?") ? "&" : "?";
      if (!finalOfferUrl.includes("offer_id=")) {
        finalOfferUrl = `${finalOfferUrl}${sep}offer_id=${offer.id}`;
      }
    }

    if (finalOfferUrl) {
      const separator = finalOfferUrl.includes("?") ? "&" : "?";
      const trackedUrl = (finalOfferUrl.includes("subid=") || finalOfferUrl.includes("uid=") || finalOfferUrl.includes("sid=") || finalOfferUrl.includes("userId="))
        ? finalOfferUrl
        : `${finalOfferUrl}${separator}subid=${user.id}&tracking_id=${user.id}`;
      window.open(trackedUrl, "_blank", "noopener,noreferrer");
    }

    // Register click with pending state if it is a standard CPA network
    if (offer.network !== "EarnPay Premium Tasks" && onRegisterClick) {
      onRegisterClick(offer.id, offer.network, offer.rewardAmount);
    }

    // Step 1: Redirecting
    const redirectTimer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(redirectTimer);
          if (offer.network === "EarnPay Premium Tasks") {
            setTrackingStep("watching");
            launchWatchingTimer(offer);
          } else {
            setTrackingStep("live_pending");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const launchWatchingTimer = (offer: Offer) => {
    setSecondsRemaining(4);
    const watchTimer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(watchTimer);
          finalizeReward(offer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finalizeReward = async (offer: Offer) => {
    setTrackingStep("success");
    try {
      await onCompleteOffer(offer.id);
    } catch (e) {
      console.error("Postback simulation award failed", e);
    }
  };

  const closeSimulator = () => {
    setTrackingOffer(null);
    setTrackingStep("idle");
  };

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto px-4 pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 border border-indigo-950 text-white rounded-2xl p-4 mt-3 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-white/5 rounded-l-full blur-xl pointer-events-none" />
        <h2 className="font-extrabold text-sm flex items-center gap-1.5 leading-none">
          CPA Partner Offerwalls <Gift size={16} className="text-yellow-300" />
        </h2>
        <p className="text-[10px] text-indigo-200 leading-normal mt-1.5 max-w-[280px]">
          Connect with top global CPA publisher networks. EarnPay rewards you up to **70% of the network payout split** directly to your secure wallet.
        </p>
      </div>

      {/* 2. Networks horizontally scrollable */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Select Partner Network</span>
          {activeNetwork !== "All" && (
            <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm animate-pulse">
              ✓ {activeNetwork} Feed Connected Automatically
            </span>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrolls-none -mx-1 px-1">
          {networks.map((net, i) => (
            <button
              key={i}
              onClick={() => setActiveNetwork(net)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
                activeNetwork === net 
                  ? "bg-indigo-700 text-white border-indigo-750 shadow-3xs" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Categories horizontal */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrolls-none -mx-1 px-1">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === cat 
                ? "bg-slate-800 text-white border-slate-900 shadow-3xs" 
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Filtered Offers */}
      <div className="space-y-3">
        {activeNetwork === "All" ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredNetworksList.map((net: any) => {
              const buildLiveUrl = (n: any) => {
                if (!n || !n.url) return "#";
                const base = n.url.trim();
                const nameLower = n.name ? n.name.toLowerCase() : "";
                const sep = base.includes("?") ? "&" : "?";
                if (nameLower.includes("lootably")) {
                  return base.includes("sid=") ? base : `${base}${sep}sid=${user.id}`;
                } else if (nameLower.includes("bitlabs")) {
                  return base.includes("uid=") ? base : `${base}${sep}uid=${user.id}`;
                } else if (nameLower.includes("monlix")) {
                  return base.includes("userId=") ? base : `${base}${sep}userId=${user.id}`;
                }
                return base.includes("subid=") ? base : `${base}${sep}subid=${user.id}`;
              };

              const liveUrl = buildLiveUrl(net);

              return (
                <div key={net.name} className="bg-white rounded-xl border border-slate-100 p-3 shadow-3xs hover:border-indigo-250 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        {net.name}
                      </span>
                      <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50/50 px-1 rounded-sm">Auto ⚡</span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-[10px] leading-snug mt-2">
                      {net.name} Offerwall
                    </h4>
                    <p className="text-[9px] text-slate-400 leading-normal mt-1 line-clamp-2">
                      Access high-paying tasks, surveys & installs.
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-medium">
                      <span>Rate: ₦500-2.5k</span>
                    </div>
                    <div className="flex gap-1">
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1 bg-indigo-700 hover:bg-slate-900 text-white text-[8px] font-black rounded-md transition-all flex items-center justify-center gap-0.5 cursor-pointer shadow-4xs text-center"
                      >
                        Open <ExternalLink size={7} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          filteredNetworksList.map((net: any) => {
            const buildLiveUrl = (n: any) => {
              if (!n || !n.url) return "#";
              const base = n.url.trim();
              const nameLower = n.name ? n.name.toLowerCase() : "";
              const sep = base.includes("?") ? "&" : "?";
              if (nameLower.includes("lootably")) {
                return base.includes("sid=") ? base : `${base}${sep}sid=${user.id}`;
              } else if (nameLower.includes("bitlabs")) {
                return base.includes("uid=") ? base : `${base}${sep}uid=${user.id}`;
              } else if (nameLower.includes("monlix")) {
                return base.includes("userId=") ? base : `${base}${sep}userId=${user.id}`;
              }
              return base.includes("subid=") ? base : `${base}${sep}subid=${user.id}`;
            };

            const liveUrl = buildLiveUrl(net);

            return (
              <div key={net.name} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs hover:border-indigo-250 transition-all">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                        {net.name}
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                        Premium Offerwall
                      </span>
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wide font-mono">
                        ⚡ {(net.dailyOffersLimit || 125000).toLocaleString()}+ Offers / Day
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-[11px] leading-snug mt-1.5">
                      Complete High-Paying {net.name} Surveys & Tasks
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1 pr-4">
                      Access our official partner offerwall. Complete quick surveys, download mobile apps, or participate in promotional trials to earn dynamic cash rewards.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-indigo-750 font-sans">
                      ₦500 - ₦2,500
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium shrink-0 mt-0.5">Per Completion</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    ⚡ Auto-award (Postback Enabled)
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-3 bg-indigo-700 hover:bg-slate-900 active:scale-95 text-white text-[9px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      Open Offerwall <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="flex justify-between items-center px-0.5 pt-2">
          <h3 className="font-extrabold text-xs text-slate-800">Top Instant Offers</h3>
          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
            {filteredOffers.length} available
          </span>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">
            No active campaigns matched selection. Browse alternative networks or filters.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOffers.map((off) => {
              const isCompleted = offerCompletions.some(oc => oc.offerId === off.id);
              return (
                <div 
                  key={off.id}
                  className={`bg-white rounded-2xl border p-4 shadow-3xs hover:border-indigo-250 transition-all ${
                    isCompleted ? "border-emerald-200 bg-emerald-50/10" : "border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                          {off.network}
                        </span>
                        <span className="text-[9px] bg-slate-50 text-slate-500 font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                          {off.category}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-0.5">
                            <CheckCircle size={9} /> Completed
                          </span>
                        )}
                      </div>
                      <h4 className={`font-extrabold text-[11px] leading-snug mt-1.5 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {off.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1 pr-4 line-clamp-2">
                        {off.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-xs font-black font-sans ${isCompleted ? 'text-emerald-600' : 'text-indigo-750'}`}>
                        ₦{Math.floor(off.rewardAmount * ((settings?.offerwallUserPercentage ?? 50) / 100))}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium shrink-0 mt-0.5">{off.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      ⚡ Auto-award (Postback API)
                    </span>
                    
                    {isCompleted ? (
                      <span className="p-1 px-3 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-200 flex items-center gap-1 select-none">
                        <CheckCircle size={10} /> Paid & Settled
                      </span>
                    ) : (
                      <button
                        onClick={() => triggerOfferSimulation(off)}
                        className="p-1 px-3 bg-indigo-700 hover:bg-slate-900 active:scale-95 text-white text-[9px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        Open Offer <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. My Offer Activity */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center px-0.5">
          <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
            <span>🕒</span> My Offer History & Status
          </h3>
          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
            {offerCompletions.length} total
          </span>
        </div>

        {offerCompletions.length === 0 ? (
          <div className="p-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-[10px] text-slate-400">
            No offer activity tracked yet. Click and complete offers to see status here.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
            {[...offerCompletions].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((oc) => {
              const matchingOffer = allOffers.find(o => o.id === oc.offerId);
              const title = matchingOffer?.title || `${oc.network} Offer Task`;
              
              return (
                <div key={oc.id} className="bg-white p-3 rounded-xl border border-slate-150 flex justify-between items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] bg-slate-100 text-slate-600 font-extrabold px-1 py-0.2 rounded-xs uppercase">
                        {oc.network}
                      </span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                        oc.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}>
                        {oc.status === 'completed' ? '✓ Credited' : '⏳ Awaiting Network Confirmation'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-700 text-[10px] leading-tight">
                      {title}
                    </h4>
                    <p className="text-[8px] text-slate-400 font-mono">
                      Started: {new Date(oc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className={`text-[10px] font-black ${oc.status === 'completed' ? 'text-emerald-700' : 'text-slate-500'}`}>
                      +₦{Math.floor(oc.amountNGN * ((settings?.offerwallUserPercentage ?? 50) / 100))} NGN
                    </p>
                    <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wide">
                      {oc.status === 'completed' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRACKING SIMULATION BOTTOM DRAWER / OVERLAY */}
      {trackingOffer && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {trackingStep === "directing" && (
              <div className="space-y-3.5 py-4">
                <Loader2 size={36} className="text-indigo-600 animate-spin mx-auto" />
                <h3 className="font-extrabold text-sm text-slate-800">Redirecting to CPA Advertiser Portal</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Establishing secure tracking link to connect with <span className="font-semibold text-indigo-600 font-sans">{trackingOffer.network}</span> server...
                </p>
                <span className="inline-block text-[10px] bg-slate-150 rounded-full px-3 py-1 font-semibold text-slate-500 font-sans">
                  ETA {secondsRemaining}s
                </span>
              </div>
            )}

            {trackingStep === "watching" && (
              <div className="space-y-4 py-2">
                <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${((4 - secondsRemaining) / 4) * 100}%` }}
                  />
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl max-w-2xs mx-auto text-[10px] font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
                  <span>Network Tunnel API Engaged: Tracked</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">Executing completion questionnaire</h3>
                <p className="text-xs text-slate-400">"{trackingOffer.title}"</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Processing verification protocols. The advertiser's integrated systems are securely sending the postback payload to the EarnPay postback endpoint.
                </p>
              </div>
            )}

            {trackingStep === "live_pending" && (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-full w-14 h-14 flex items-center justify-center text-2xl mx-auto border border-indigo-100 shadow-inner">
                  ⏳
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-800">CPA Offer Opened!</h3>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Awaiting S2S Postback</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-150 space-y-2 max-w-xs mx-auto">
                  <h4 className="font-extrabold text-[10px] text-slate-700 uppercase">Instructions for Credit:</h4>
                  <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-3 font-medium">
                    <li>Complete the offer requirements in the newly opened window.</li>
                    <li>Do not close the offer page prematurely or use VPNs.</li>
                    <li>Once completed, the CPA network (<span className="font-semibold text-indigo-600">{trackingOffer.network}</span>) will verify your actions.</li>
                    <li>Upon verification, they send a secure S2S Postback to credit your wallet automatically!</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-emerald-50/70 text-emerald-800 rounded-lg max-w-xs mx-auto text-[9px] font-bold flex items-center justify-center gap-1.5 border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                  <span>Est. Credit Time: 5 - 30 minutes</span>
                </div>

                <button
                  onClick={closeSimulator}
                  className="w-full py-3 bg-indigo-700 hover:bg-slate-900 text-white text-xs font-black tracking-wide uppercase rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Close & Browse More Offers
                </button>
              </div>
            )}

            {trackingStep === "success" && (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full w-14 h-14 flex items-center justify-center text-2xl mx-auto shadow-inner border border-emerald-100 animate-bounce">
                  🏆
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-800">Offer Completed Successfully!</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">POSTBACK S2S OK</p>
                </div>
                {(() => {
                  const userPercent = settings?.offerwallUserPercentage ?? 50;
                  const platformPercent = 100 - userPercent;
                  const uReward = Math.floor(trackingOffer.rewardAmount * (userPercent / 100));
                  const pCut = Math.floor(trackingOffer.rewardAmount * (platformPercent / 100));
                  return (
                    <div className="bg-slate-50 p-3.5 rounded-xl max-w-xs mx-auto border border-slate-150">
                      <p className="text-[10px] text-slate-400 font-black uppercase">YOUR REWARD ({userPercent}%):</p>
                      <p className="text-xl font-black text-emerald-700 mt-1 font-sans">
                        +₦{uReward.toLocaleString()} NGN
                      </p>
                      <p className="text-[8px] text-slate-400 font-sans mt-1">
                        Platform Fee to cover maintenance and verify network: {platformPercent}% (₦{pCut.toLocaleString()} NGN)
                      </p>
                    </div>
                  );
                })()}
                <button
                  onClick={closeSimulator}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wide uppercase rounded-xl transition-colors cursor-pointer shadow-md border border-emerald-500 animate-pulse"
                >
                  Return to Active Offerwalls
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
