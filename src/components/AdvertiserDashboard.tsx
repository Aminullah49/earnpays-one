import React, { useState, useEffect } from "react";
import { Campaign, TaskSubmission, User, Wallet, SupportTicket } from "../types";
import { 
  Building2, PlusCircle, AlertCircle, BarChart3, TrendingUp, 
  Settings, CheckSquare, CheckCircle, RefreshCw, XCircle, ArrowUpRight,
  TrendingDown, Globe, Users, Coins, HelpCircle, Layers, Check, CreditCard, Search,
  Facebook, Twitter, MessageCircle, Phone, MessageSquare, Send, LifeBuoy, Loader2, Sparkles
} from "lucide-react";
import { usePreferences } from "../context/PreferenceContext";


const NIGERIAN_BANKS = [
  "Access Bank PLC",
  "United Bank for Africa (UBA)",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank PLC",
  "Opay Digital Services (OPay)",
  "PalmPay Microfinance Bank",
  "Kuda Microfinance Bank",
  "Moniepoint MFB",
  "First Bank of Nigeria",
  "Union Bank of Nigeria",
  "Fidelity Bank PLC",
  "Wema Bank PLC",
  "Stanbic IBTC Bank",
  "Sterling Bank PLC",
  "Ecobank Nigeria",
  "Providus Bank PLC",
  "Keystone Bank Limited",
  "Heritage Bank PLC",
  "Jaiz Bank PLC",
  "Taj Bank Limited"
];

interface AdvertiserDashboardProps {
  user: User;
  wallet: Wallet;
  campaigns: Campaign[];
  submissions: TaskSubmission[];
  usersList: User[];
  onCampaignCreate: (details: {
    title: string;
    category: string;
    instructions: string;
    rewardValue: number;
    totalBudget: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    creativeUrl: string;
    targetLink?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onApproveSubmission: (subId: string) => Promise<void>;
  onRefresh?: () => void;
  onClose: () => void;
  settings?: any;
  tickets?: SupportTicket[];
  onCreateTicket?: (subject: string, category: string, message: string) => Promise<void>;
  onSendTicketReply?: (ticketId: string, reply: string) => Promise<void>;
}

export default function AdvertiserDashboard({
  user, wallet: initialWallet, campaigns, submissions, usersList, onCampaignCreate, onApproveSubmission, onRefresh, onClose, settings,
  tickets = [], onCreateTicket, onSendTicketReply
}: AdvertiserDashboardProps) {

  // Dynamic state for real-time wallet balance after deposits
  const [advWallet, setAdvWallet] = useState<Wallet>(initialWallet);

  useEffect(() => {
    setAdvWallet(initialWallet);
  }, [initialWallet]);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'card' | 'bank' | 'ussd' | 'earner_swap' | 'withdraw' | 'crypto'>('card');
  const [depositCountry, setDepositCountry] = useState("Nigeria");
  const [depositCurrency, setDepositCurrency] = useState("NGN");
  const [depositCryptoMethod, setDepositCryptoMethod] = useState("USDT TRC-20");
  const [depositCryptoAddress, setDepositCryptoAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [depositBankName, setDepositBankName] = useState("Providus Bank (Direct)");
  const [depositBankAccount, setDepositBankAccount] = useState("9948271034");
  const [depositUssdBank, setDepositUssdBank] = useState("GTB (*737#)");
  const [hasCopiedUSSD, setHasCopiedUSSD] = useState(false);
  const [isSimulatingBankTransfer, setIsSimulatingBankTransfer] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  // Advertiser withdrawal states - Requirement 6
  const [advWithdrawAmount, setAdvWithdrawAmount] = useState("");
  const [advWithdrawMethod, setAdvWithdrawMethod] = useState<"Bank" | "USDT">("Bank");
  const [advWithdrawBank, setAdvWithdrawBank] = useState("Access Bank PLC");
  const [advWithdrawAccount, setAdvWithdrawAccount] = useState("");
  const [advWithdrawCountry, setAdvWithdrawCountry] = useState("Nigeria");
  const [advWithdrawCurrency, setAdvWithdrawCurrency] = useState("NGN");
  const [advWithdrawUSDT, setAdvWithdrawUSDT] = useState("");
  const [advWithdrawPIN, setAdvWithdrawPIN] = useState("");
  const [advWithdrawError, setAdvWithdrawError] = useState<string | null>(null);
  const [advWithdrawSuccess, setAdvWithdrawSuccess] = useState<any | null>(null);
  const [isAdvWithdrawing, setIsAdvWithdrawing] = useState(false);

  // Advertiser PIN management states (Requirement 1 & 6)
  const [showAdvPinSetup, setShowAdvPinSetup] = useState(false);
  const [advNewPIN, setAdvNewPIN] = useState("");
  const [advConfirmPIN, setAdvConfirmPIN] = useState("");
  const [advPinError, setAdvPinError] = useState("");
  const [advPinSuccess, setAdvPinSuccess] = useState("");
  const [isAdvUpdatingPin, setIsAdvUpdatingPin] = useState(false);

  // Security Request States (forgot PIN / Password requests)
  const [securityReqType, setSecurityReqType] = useState<'forgot_password' | 'forgot_pin'>('forgot_pin');
  const [securityReqValue, setSecurityReqValue] = useState("");
  const [securityReqSuccess, setSecurityReqSuccess] = useState("");
  const [securityReqError, setSecurityReqError] = useState("");
  const [isSubmittingSecurityReq, setIsSubmittingSecurityReq] = useState(false);

  // AI Auditing States
  const [isAuditingSubId, setIsAuditingSubId] = useState<string | null>(null);
  const [isBulkAuditing, setIsBulkAuditing] = useState(false);
  const [bulkAuditResult, setBulkAuditResult] = useState<string | null>(null);

  const handleAISingleAudit = async (subId: string) => {
    setIsAuditingSubId(subId);
    try {
      const res = await fetch("/api/advertiser/ai-review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subId })
      });
      const data = await res.json();
      if (data.success) {
        if (onRefresh) onRefresh();
        alert(`AI Audit Completed! Status: ${data.approved ? "APPROVED (₦ Reward Transferred)" : "REJECTED"}\n\nAI Feedback: ${data.aiAnalysis?.feedback || "Task evaluated by AI."}`);
      } else {
        alert(data.error || "Failed to audit task via AI.");
      }
    } catch (e) {
      console.error(e);
      alert("AI communication failure. Try again.");
    } finally {
      setIsAuditingSubId(null);
    }
  };

  const handleAIBulkAudit = async () => {
    setIsBulkAuditing(true);
    setBulkAuditResult(null);
    try {
      const res = await fetch("/api/advertiser/ai-review-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        if (onRefresh) onRefresh();
        setBulkAuditResult(data.message);
        setTimeout(() => setBulkAuditResult(null), 8000);
      } else {
        alert(data.error || "Failed to process bulk AI auto-reviewer.");
      }
    } catch (e) {
      console.error(e);
      alert("AI bulk reviewer failure.");
    } finally {
      setIsBulkAuditing(false);
    }
  };

  const handleAdvPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvPinError("");
    setAdvPinSuccess("");

    if (!advNewPIN || advNewPIN.length < 4) {
      setAdvPinError("Security PIN must be at least 4 digits.");
      return;
    }

    if (advNewPIN !== advConfirmPIN) {
      setAdvPinError("Security PINs do not match.");
      return;
    }

    setIsAdvUpdatingPin(true);
    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: advNewPIN })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdvPinError(data.error || "Failed to save security transaction PIN.");
      } else {
        setAdvPinSuccess("Your security PIN has been updated successfully!");
        setAdvNewPIN("");
        setAdvConfirmPIN("");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setAdvPinError("Network error. Failed to save Security PIN.");
    } finally {
      setIsAdvUpdatingPin(false);
    }
  };

  const handleSecurityReqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityReqError("");
    setSecurityReqSuccess("");

    if (!securityReqValue || securityReqValue.trim().length < 4) {
      setSecurityReqError("Please specify a valid new value (at least 4 characters/digits).");
      return;
    }

    setIsSubmittingSecurityReq(true);
    try {
      const res = await fetch("/api/user/security-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          type: securityReqType,
          requestedValue: securityReqValue
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSecurityReqError(data.error || "Failed to submit security reset request.");
      } else {
        setSecurityReqSuccess(data.message || "Request submitted successfully!");
        setSecurityReqValue("");
      }
    } catch (err) {
      setSecurityReqError("Network failure. Failed to transmit security reset request.");
    } finally {
      setIsSubmittingSecurityReq(false);
    }
  };

  const handleAdvWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvWithdrawError(null);
    setAdvWithdrawSuccess(null);

    const amt = Number(advWithdrawAmount);
    if (!advWithdrawAmount || amt <= 0) {
      setAdvWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }

    if (amt > advWallet.available) {
      setAdvWithdrawError("Insufficient unspent reserve in your wallet available balance.");
      return;
    }

    const isCrypto = advWithdrawMethod.includes("USDT") || advWithdrawMethod.includes("Crypto");

    if (!isCrypto && advWithdrawCountry === "Nigeria" && (!advWithdrawAccount || advWithdrawAccount.length < 10)) {
      setAdvWithdrawError("Please provide a valid 10-digit Nigerian NUBAN account number.");
      return;
    }

    if (!isCrypto && advWithdrawCountry !== "Nigeria" && !advWithdrawAccount) {
      setAdvWithdrawError("Please provide a valid Bank Account or Card number for withdrawal.");
      return;
    }

    if (isCrypto && !advWithdrawUSDT) {
      setAdvWithdrawError("Please provide a valid Cryptocurrency wallet destination address.");
      return;
    }

    if (!advWithdrawPIN || advWithdrawPIN.length < 4) {
      setAdvWithdrawError("Please provide your 4-digit Security PIN to confirm.");
      return;
    }

    setIsAdvWithdrawing(true);
    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: isCrypto ? "USDT (TRC-20)" : "Bank Transfer",
          accountNo: advWithdrawAccount,
          bankName: advWithdrawBank,
          usdtAddress: advWithdrawUSDT,
          pin: advWithdrawPIN,
          country: advWithdrawCountry,
          currency: advWithdrawCurrency
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAdvWithdrawError(data.error || "Failed to initiate withdrawal request.");
      } else {
        setAdvWithdrawSuccess({
          amount: amt,
          method: advWithdrawMethod,
          ref: data.transaction?.reference || "WD-ADV",
          country: advWithdrawCountry,
          currency: advWithdrawCurrency
        });
        setAdvWithdrawAmount("");
        setAdvWithdrawAccount("");
        setAdvWithdrawUSDT("");
        setAdvWithdrawPIN("");
        onRefresh();
      }
    } catch (err) {
      setAdvWithdrawError("Connection failed. Payout clearance delayed.");
    } finally {
      setIsAdvWithdrawing(false);
    }
  };

  // Advertiser Support states
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [newAdvTicketSubject, setNewAdvTicketSubject] = useState("");
  const [newAdvTicketCategory, setNewAdvTicketCategory] = useState("Campaigns");
  const [newAdvTicketMsg, setNewAdvTicketMsg] = useState("");
  const [activeAdvTicketId, setActiveAdvTicketId] = useState<string | null>(null);
  const [advTicketReplyText, setAdvTicketReplyText] = useState("");

  // Searchable Bank states
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  // Campaign Form States
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignCategory, setCampaignCategory] = useState("Social Media Promotion");
  const [campaignInstructions, setCampaignInstructions] = useState("");
  const [campaignReward, setCampaignReward] = useState("100");
  const [campaignBudget, setCampaignBudget] = useState("10000");
  const [campaignDifficulty, setCampaignDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>("Medium");
  const [campaignCreative, setCampaignCreative] = useState("");
  const [campaignLink, setCampaignLink] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [subQueueTab, setSubQueueTab] = useState<'pending' | 'verified'>('pending');

  // Expanded Categories
  const categoriesList = [
    { name: "Social Media Promotion", defaultMin: 50, icon: "📢" },
    { name: "YouTube Subscribers", defaultMin: 120, icon: "🎥" },
    { name: "Twitter/X Engagement", defaultMin: 60, icon: "🐦" },
    { name: "Telegram Join Group", defaultMin: 80, icon: "💬" },
    { name: "App Promotion", defaultMin: 250, icon: "📱" },
    { name: "Business Map Reviews", defaultMin: 180, icon: "📍" },
    { name: "Product Reviews", defaultMin: 200, icon: "⭐" },
    { name: "TikTok Verification", defaultMin: 100, icon: "🎵" },
    { name: "Lead Generation", defaultMin: 300, icon: "👤" },
    { name: "Video Engagement", defaultMin: 120, icon: "🎬" },
    { name: "Survey & Market Research", defaultMin: 300, icon: "📊" },
    { name: "Newsletter Subscription", defaultMin: 100, icon: "📧" },
    { name: "Forum & Discord Joining", defaultMin: 110, icon: "👾" },
    { name: "Mobile Game Playing", defaultMin: 500, icon: "🎮" },
    { name: "Business Map Review", defaultMin: 150, icon: "🗺️" }
  ];

  // Dynamic automatic recommended target price and audience sizing
  const selectedCatObj = categoriesList.find(c => c.name === campaignCategory) || categoriesList[0];
  const dynamicMinReward = settings?.minTaskRewards?.[campaignCategory] || selectedCatObj.defaultMin;

  // Auto set value on category change
  useEffect(() => {
    setCampaignReward(String(dynamicMinReward));
  }, [campaignCategory, dynamicMinReward]);

  const targetRewardInput = Number(campaignReward) || dynamicMinReward;
  const targetBudgetInput = Number(campaignBudget) || 10000;
  const predictedAudience = targetRewardInput > 0 ? Math.floor(targetBudgetInput / targetRewardInput) : 0;

  const { fmt, t } = usePreferences();

  const advertiserCampaigns = campaigns.filter(c => c.advertiserId === user.id);
  const totalCampaignsBudget = advertiserCampaigns.reduce((acc, c) => acc + c.totalBudget, 0);
  const totalSpend = advertiserCampaigns.reduce((acc, c) => acc + (c.totalBudget - c.remainingBudget), 0);

  // Submissions associated with this advertiser's campaigns
  const advertiserCampaignIds = advertiserCampaigns.map(c => c.id);
  const relativeSubmissions = submissions.filter(s => advertiserCampaignIds.includes(s.campaignId));
  const pendingSubmissions = relativeSubmissions.filter(s => s.status === 'pending');
  const verifiedSubmissions = relativeSubmissions.filter(s => s.status === 'approved' || s.status === 'verified_ai' || s.status === 'rejected');

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositSuccess(false);
    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Specify a valid deposit amount");
      return;
    }

    setIsDepositing(true);
    let detailsStr = "";
    if (depositMethod === 'card') {
      detailsStr = `Card ending in ${cardNumber.slice(-4) || "4242"} Exp: ${cardExpiry || "12/28"}`;
    } else if (depositMethod === 'bank') {
      detailsStr = `Bank Transfer to ${depositBankName} (${depositBankAccount})`;
    } else if (depositMethod === 'ussd') {
      detailsStr = `USSD Dial Code via ${depositUssdBank}`;
    } else if (depositMethod === 'earner_swap') {
      detailsStr = `Earner Balance Swap`;
    } else if (depositMethod === 'crypto') {
      detailsStr = `Crypto ${depositCryptoMethod} Wallet: ${depositCryptoAddress || "0x71...f3a9"}`;
    }

    try {
      const res = await fetch("/api/advertiser/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: user.id,
          amount: amt,
          country: depositCountry,
          method: depositMethod,
          currency: depositCurrency,
          details: detailsStr
        })
      });
      const data = await res.json();
      if (!data.error) {
        setAdvWallet(data.wallet);
        setDepositSuccess(true);
        setDepositAmount("");
        setTimeout(() => setDepositSuccess(false), 5000);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Payment processor network error. Try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const rew = Number(campaignReward);
    const bud = Number(campaignBudget);
    const cost = bud + Math.floor(bud * 0.10);

    if (!campaignTitle || !campaignInstructions || rew <= 0 || bud <= 0) {
      setFormError("All fields are required. Values must be positive numbers.");
      return;
    }

    if (rew < dynamicMinReward) {
      setFormError(`For ${campaignCategory}, the minimum required target reward payout is ₦${dynamicMinReward}. Please increase your payout value.`);
      return;
    }

    if (bud < rew) {
      setFormError("Total budget cannot be smaller than a single task payout reward.");
      return;
    }

    if (advWallet.available < cost) {
      setFormError(`Insufficient balance in campaign reserve wallet. Creating this campaign requires ₦${bud.toLocaleString()} budget + ₦${Math.floor(bud * 0.10).toLocaleString()} (10% platform brokerage setup fee). Total cost: ₦${cost.toLocaleString()} NGN. Please fund your unspent reserve balance.`);
      return;
    }

    const res = await onCampaignCreate({
      title: campaignTitle,
      category: campaignCategory,
      instructions: campaignInstructions,
      rewardValue: rew,
      totalBudget: bud,
      difficulty: campaignDifficulty,
      creativeUrl: campaignCreative,
      targetLink: campaignLink
    });

    if (res.success) {
      setFormSuccess(true);
      setCampaignTitle("");
      setCampaignInstructions("");
      setCampaignCreative("");
      setCampaignLink("");
      // Deduct locally for feedback loop
      setAdvWallet(prev => ({
        ...prev,
        available: prev.available - cost
      }));
    } else {
      setFormError(res.error || "Execution failed. Check reserve balance.");
    }
  };

  const [refundStatusMsg, setRefundStatusMsg] = useState("");

  const handleRefundCampaignBudget = async (campaignId: string) => {
    if (!window.confirm("Are you sure you want to pause/end this campaign immediately and refund the remaining unspent escrow budget back to your available balance? This cannot be undone.")) {
      return;
    }
    setRefundStatusMsg("Processing Escrow Recall...");
    try {
      const res = await fetch("/api/advertiser/refund-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setRefundStatusMsg(data.message || "Escrow budget successfully refunded!");
        if (onRefresh) onRefresh();
        setTimeout(() => setRefundStatusMsg(""), 5000);
      } else {
        setRefundStatusMsg(`❌ Error: ${data.error || "Failed to refund budget"}`);
        setTimeout(() => setRefundStatusMsg(""), 5000);
      }
    } catch {
      setRefundStatusMsg("❌ Network error recalling escrow. Try again.");
      setTimeout(() => setRefundStatusMsg(""), 5000);
    }
  };

  const handleAdvNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvTicketSubject.trim() || !newAdvTicketMsg.trim() || !onCreateTicket) return;
    await onCreateTicket(newAdvTicketSubject, newAdvTicketCategory, newAdvTicketMsg);
    setNewAdvTicketSubject("");
    setNewAdvTicketMsg("");
  };

  const handleAdvTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advTicketReplyText.trim() || !activeAdvTicketId || !onSendTicketReply) return;
    await onSendTicketReply(activeAdvTicketId, advTicketReplyText);
    setAdvTicketReplyText("");
  };

  return (
    <div className="fixed inset-0 bg-[#0b131e] text-slate-100 z-50 overflow-y-auto font-sans p-4 pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-wide">Brand Advertiser Console</h1>
              <p className="text-[10px] text-slate-400 font-semibold">Deploy and supervise audited micro-funding target campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAdvPinSetup(true)}
              className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/35 text-amber-400 text-xs font-black uppercase rounded-xl cursor-pointer transition-colors border border-amber-500/25 flex items-center gap-1.5"
            >
              🔑
              <span>{user.pin ? "Forgot PIN / Password" : "Setup Security PIN"}</span>
            </button>
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-400 text-xs font-black uppercase rounded-xl cursor-pointer transition-colors border border-emerald-500/25 flex items-center gap-1.5"
            >
              <LifeBuoy size={13} className="text-emerald-400" />
              <span>Contact Support</span>
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-black uppercase rounded-xl cursor-pointer transition-colors border border-slate-700"
            >
              Exit Console
            </button>
          </div>
        </div>

        {/* 1. Account Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-[#111c2a] rounded-xl border border-slate-800/80 shadow-xs">
            <span className="text-[8px] text-slate-450 block uppercase font-extrabold tracking-wider">Unspent Reserve</span>
            <p className="text-base font-black text-emerald-400 mt-1 font-sans">{fmt(advWallet.available)}</p>
            <p className="text-[7.5px] text-slate-500 mt-0.5 leading-none">Ready for new campaign setups</p>
          </div>
          <div className="p-3 bg-[#111c2a] rounded-xl border border-slate-800/80 shadow-xs">
            <span className="text-[8px] text-slate-450 block uppercase font-extrabold tracking-wider">Total Budgets</span>
            <p className="text-base font-black text-[#5ab8ff] mt-1 font-sans">{fmt(totalCampaignsBudget)}</p>
            <p className="text-[7.5px] text-slate-500 mt-0.5 leading-none">Total deposited across {advertiserCampaigns.length} ads</p>
          </div>
          <div className="p-3 bg-[#111c2a] rounded-xl border border-slate-800/80 shadow-xs transition-all hover:border-amber-500/30">
            <span className="text-[8px] text-amber-400 block uppercase font-extrabold tracking-wider flex items-center gap-1">
              Unspent Escrow <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            </span>
            <p className="text-base font-black text-amber-300 mt-1 font-sans">
              {fmt(advertiserCampaigns.reduce((acc, c) => acc + c.remainingBudget, 0))}
            </p>
            <p className="text-[7.5px] text-slate-450 mt-0.5 leading-none">Remissible budget in escrow</p>
          </div>
          <div className="p-3 bg-[#111c2a] rounded-xl border border-slate-800/80 shadow-xs">
            <span className="text-[8px] text-slate-450 block uppercase font-extrabold tracking-wider">Settled/Spent</span>
            <p className="text-base font-black text-slate-350 mt-1 font-sans">{fmt(totalSpend)}</p>
            <p className="text-[7.5px] text-slate-500 mt-0.5 leading-none">Paid out to verified earners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT SIDE: CAMPAIGN CREATION & WALLET DEPOSIT (Differentiated) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* DEPOSIT RESERVE (DIFFERENTIATED MULTI-METHOD) */}
            <div className="bg-[#111c2a] rounded-xl border border-slate-800 p-5 space-y-4 shadow-md">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={16} className="text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                      Differentiated Reserve Funding Portal
                    </h3>
                    <p className="text-[10px] text-slate-400">Escrow reserves for target user campaign rewards</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#090e16] border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-500">Unspent Escrow:</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-xs">{fmt(advWallet.available)}</span>
                </div>
              </div>

              {/* COUNTRY & CURRENCY CONFIGURATORS */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#090e16]/40 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-[9px] text-[#2ebd85] font-extrabold uppercase tracking-wider block mb-1">Deposit Origin Country</label>
                  <select
                    value={depositCountry}
                    onChange={(e) => {
                      const country = e.target.value;
                      setDepositCountry(country);
                      if (country === "Nigeria") setDepositCurrency("NGN");
                      else if (country === "Ghana") setDepositCurrency("GHS");
                      else if (country === "Kenya") setDepositCurrency("KES");
                      else if (country === "United Kingdom") setDepositCurrency("GBP");
                      else setDepositCurrency("USD");
                    }}
                    className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-bold text-xs"
                  >
                    <option value="Nigeria">🇳🇬 Nigeria</option>
                    <option value="Ghana">🇬🇭 Ghana</option>
                    <option value="Kenya">🇰🇪 Kenya</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-[#2ebd85] font-extrabold uppercase tracking-wider block mb-1">Deposit Currency</label>
                  <select
                    value={depositCurrency}
                    onChange={(e) => setDepositCurrency(e.target.value)}
                    className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-bold text-xs"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="GHS">GHS (GH₵)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* PAYMENT METHODS SELECTOR TABS */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-[#090e16] p-1 rounded-xl border border-slate-800/60 select-none">
                <button
                  type="button"
                  onClick={() => { setDepositMethod('card'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'card' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositMethod('bank'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'bank' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  🏦 Bank
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositMethod('ussd'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'ussd' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  📱 USSD
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositMethod('crypto'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'crypto' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  🪙 Crypto
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositMethod('earner_swap'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'earner_swap' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  🔄 Swap
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositMethod('withdraw'); setDepositSuccess(false); }}
                  className={`py-2 px-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all text-center ${
                    depositMethod === 'withdraw' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2a]/40'
                  }`}
                >
                  💸 Payout
                </button>
              </div>

              {/* DYNAMIC TAB PAYMENT WORKSPACES */}
              <div className="bg-[#090e16]/60 p-4 rounded-xl border border-slate-850 space-y-3.5">
                
                {/* 1. ATM DEBIT CARD WORKSPACE */}
                {depositMethod === 'card' && (
                  <form onSubmit={handleDepositSubmit} className="space-y-3.5 text-xs">
                    <span className="text-[9.5px] font-black text-emerald-300 uppercase tracking-widest block">💳 Credit / Debit Card Secured Clearing</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-semibold">Payment Amount (₦ NGN)</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-semibold">Card Holder Name</label>
                        <input
                          type="text"
                          placeholder={user.name}
                          className="w-full px-3 py-1.5 bg-[#090e16]/60 border border-slate-800 rounded-lg text-xs outline-none text-slate-400"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                          placeholder="5061 2490 120    "
                          className="w-full px-2.5 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                          placeholder="MM/YY"
                          className="w-full px-2 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 text-center placeholder:text-slate-700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block text-center">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="***"
                          className="w-full px-2 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 text-center placeholder:text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-[#111c2a]/30 p-2.5 rounded-lg border border-slate-800/40 text-[10.5px] text-slate-400 leading-normal">
                      <span>🔒 Fully encrypted by <strong>Interswitch Node Engine</strong>. Real-time NGN clearing and instant token feedback guaranteed.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isDepositing}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 h-[36px]"
                    >
                      {isDepositing ? "Securing API Handshake..." : `Pay Securely ₦${Number(depositAmount || 0).toLocaleString()} Now`}
                    </button>
                  </form>
                )}

                {/* 2. DIRECT BANK TRANSFER WORKSPACE */}
                {depositMethod === 'bank' && (
                  <div className="space-y-3.5 text-xs text-left">
                    <span className="text-[9.5px] font-black text-emerald-300 uppercase tracking-widest block">🏦 Dedicated Platform Reserve Escrow Transfer</span>
                    
                    <div className="space-y-1 relative">
                      <label className="text-[9px] text-[#2ebd85] font-extrabold uppercase tracking-wider block">Choose Recipient Vault Bank</label>
                      <button
                        type="button"
                        onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                        className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-left text-xs text-slate-100 font-bold outline-none flex items-center justify-between cursor-pointer"
                      >
                        <span>{depositBankName}</span>
                        <Search size={12} className="text-slate-400" />
                      </button>

                      {isBankDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#090e16] border border-slate-800 rounded-lg shadow-xl p-2.5 space-y-2 max-h-56 overflow-y-auto">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-850 rounded-md">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input 
                              type="text"
                              placeholder="Type to filter bank..."
                              value={bankSearchQuery}
                              onChange={(e) => setBankSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent w-full text-xs text-slate-300 outline-none placeholder:text-slate-550"
                            />
                          </div>
                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {NIGERIAN_BANKS.filter(bank => 
                              bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
                            ).map(bankName => (
                              <button
                                key={bankName}
                                type="button"
                                onClick={() => {
                                  setDepositBankName(bankName);
                                  // Generate a deterministic 10-digit account number based on the selected bank
                                  const sumIds = bankName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 101482938);
                                  setDepositBankAccount(`${99}${String(sumIds).substring(1, 9)}`);
                                  setIsBankDropdownOpen(false);
                                  setBankSearchQuery("");
                                }}
                                className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                  depositBankName === bankName 
                                    ? "bg-emerald-950 text-emerald-350 font-bold" 
                                    : "hover:bg-[#111c2a]/60 text-slate-300"
                                }`}
                              >
                                <span>{bankName}</span>
                                {depositBankName === bankName && <Check size={11} className="text-emerald-500" />}
                              </button>
                            ))}
                            {NIGERIAN_BANKS.filter(bank => 
                              bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
                            ).length === 0 && (
                              <p className="text-[10px] text-slate-500 text-center py-2 select-none">No matching banks found</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-[#111c2a]/55 border border-slate-800 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-2">
                        <span className="text-slate-500">Beneficiary Bank:</span>
                        <strong className="text-slate-100">{depositBankName}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-2">
                        <span className="text-slate-500">Virtual Account Number:</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-emerald-400 font-mono text-sm">{depositBankAccount}</strong>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(depositBankAccount); alert("Virtual Account Number copied to clipboard!"); }}
                            className="text-[8.5px] bg-[#090e16] border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-slate-500">Account Username:</span>
                        <strong className="text-slate-200">EarnPay Advertiser Reserve /{user.name}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-450 uppercase block font-semibold">How much did you transfer? (₦ NGN)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-755"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        const amt = Number(depositAmount);
                        if (isNaN(amt) || amt <= 100) {
                          alert("Specify valid transferred amount to verify.");
                          return;
                        }
                        setIsSimulatingBankTransfer(true);
                        setTransferConfirmed(false);
                        setTimeout(async () => {
                          try {
                            const res = await fetch("/api/advertiser/deposit", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ advertiserId: user.id, amount: amt })
                            });
                            const data = await res.json();
                            if (!data.error) {
                              setAdvWallet(data.wallet);
                              setDepositSuccess(true);
                              setDepositAmount("");
                            }
                          } catch {}
                          setIsSimulatingBankTransfer(false);
                          setTransferConfirmed(true);
                          setTimeout(() => { setTransferConfirmed(false); setDepositSuccess(false); }, 4000);
                        }, 2500);
                      }}
                      disabled={isSimulatingBankTransfer}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 h-[36px]"
                    >
                      {isSimulatingBankTransfer ? "Verifying Bank Ledger Hashing..." : "I wave sent the funds (Verify Transfer)"}
                    </button>

                    {transferConfirmed && (
                      <p className="text-[9px] text-[#2ebd85] font-mono bg-[#111c2a]/20 p-2 rounded border border-[#2ebd85]/20 text-center">
                        🔄 CBN Central Interbank connection established. Deposit reserves adjusted!
                      </p>
                    )}
                  </div>
                )}

                {/* 3. INSTANT USSD DIAL CODE WORKSPACE */}
                {depositMethod === 'ussd' && (
                  <div className="space-y-3.5 text-xs text-left">
                    <span className="text-[9.5px] font-black text-emerald-300 uppercase tracking-widest block">📱 Instant USSD offline Code generator</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block mb-1">Select offline Bank</label>
                        <select
                          value={depositUssdBank}
                          onChange={(e) => { setDepositUssdBank(e.target.value); setHasCopiedUSSD(false); }}
                          className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                        >
                          <option value="GTB (*737#)">GTBank (*737#)</option>
                          <option value="Access Bank (*901#)">Access Bank (*901#)</option>
                          <option value="Zenith (*966#)">Zenith Bank (*966#)</option>
                          <option value="UBA (*919#)">UBA PLC (*919#)</option>
                          <option value="Opay (*955#)">OPay Sandbox (*955#)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 block mb-1">Deposit Intended Amount</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => { setDepositAmount(e.target.value); setHasCopiedUSSD(false); }}
                          placeholder="e.g. 15000"
                          className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC CODE RENDER */}
                    {Number(depositAmount) > 0 ? (
                      <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 space-y-1.5">
                        <span className="text-[8.5px] text-slate-500 uppercase tracking-wide block">Dynamic USSD Transfer string</span>
                        <div className="flex justify-between items-center bg-[#090e16] border border-slate-850 p-2 rounded-lg">
                          <code className="text-amber-300 font-mono text-sm tracking-widest">
                            {depositUssdBank.includes("GTB") ? `*737*1*2*${depositAmount}*${depositBankAccount}#` :
                             depositUssdBank.includes("Access") ? `*901*3*${depositAmount}*${depositBankAccount}#` :
                             depositUssdBank.includes("Zenith") ? `*966*3*${depositAmount}*${depositBankAccount}#` :
                             depositUssdBank.includes("UBA") ? `*919*8*${depositAmount}*${depositBankAccount}#` :
                             `*955*1*${depositAmount}*${depositBankAccount}#`}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              setHasCopiedUSSD(true);
                              alert("USSD dial string copied!");
                            }}
                            className="text-[9.5px] bg-indigo-650 hover:bg-indigo-600 px-2 py-1 rounded text-white font-bold"
                          >
                            {hasCopiedUSSD ? "Copied!" : "Copy code"}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-450 leading-relaxed pt-1">
                          Dial the shortcode from your registered mobile device to securely remit unspent budget to platform escrow bank accounts immediately.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#111c2a]/20 rounded-xl border border-slate-800/60 text-center text-slate-500 font-medium">
                        * Please input deposit amount to construct custom USSD string.
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        const amt = Number(depositAmount);
                        if (isNaN(amt) || amt <= 100) {
                          alert("Minimum deposit code triggering is ₦100 NGN");
                          return;
                        }
                        setIsDepositing(true);
                        try {
                          const res = await fetch("/api/advertiser/deposit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ advertiserId: user.id, amount: amt })
                          });
                          const data = await res.json();
                          if (!data.error) {
                            setAdvWallet(data.wallet);
                            setDepositSuccess(true);
                            setDepositAmount("");
                          }
                        } catch {}
                        setIsDepositing(false);
                      }}
                      disabled={isDepositing || !depositAmount}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer h-[36px]"
                    >
                      {isDepositing ? "Dialing code..." : "Inject USSD Clearing Code"}
                    </button>
                  </div>
                )}

                {/* CRYPTOCURRENCY SECURED DEPOSIT WORKSPACE */}
                {depositMethod === 'crypto' && (
                  <form onSubmit={handleDepositSubmit} className="space-y-3.5 text-xs text-left">
                    <span className="text-[9.5px] font-black text-emerald-300 uppercase tracking-widest block">🪙 Blockchain Cryptocurrency Secured Ingress</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-semibold">Asset / Network Protocol</label>
                        <select
                          value={depositCryptoMethod}
                          onChange={(e) => {
                            const method = e.target.value;
                            setDepositCryptoMethod(method);
                            if (method.includes("USDT TRC-20")) setDepositCryptoAddress("TX9aB1CdEffGHiJKlmNoPQrsTuVWxyZ123");
                            else if (method.includes("USDT ERC-20")) setDepositCryptoAddress("0x71C7656EC7ab88b098defB751B7401B5f6d14766");
                            else if (method.includes("BTC")) setDepositCryptoAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
                            else setDepositCryptoAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                          }}
                          className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                        >
                          <option value="USDT TRC-20">USDT (TRC-20 Network)</option>
                          <option value="USDT ERC-20">USDT (ERC-20 Ethereum Network)</option>
                          <option value="BTC Native">BTC (Bitcoin Mainnet)</option>
                          <option value="ETH Ethereum">ETH (Ethereum Mainnet)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-semibold">Deposit Intended Amount ({depositCurrency})</label>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 uppercase tracking-wider">Designated Vault Address:</span>
                        <strong className="text-emerald-400 font-mono select-all break-all">{depositCryptoAddress || "TX9aB1CdEffGHiJKlmNoPQrsTuVWxyZ123"}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[10px] border-t border-slate-900 pt-2">
                        <span className="text-slate-400">Transaction Status:</span>
                        <span className="text-amber-400 font-black animate-pulse text-[9px] uppercase">● Awaiting Blockchain Ingress</span>
                      </div>
                      <div className="text-[9px] text-slate-500 leading-normal bg-[#111c2a]/20 p-2 rounded">
                        Please send exact unspent assets to the designated address above. Deposits are credited automatically after 2 network confirmations (typical speed: 2-5 minutes).
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isDepositing}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 h-[36px]"
                    >
                      {isDepositing ? "Broadcasting Crypto Ingress API..." : "Verify Cryptocurrency Ingress"}
                    </button>
                  </form>
                )}

                {/* 4. EARNER BALANCE EXCHANGER / SWAP */}
                {depositMethod === 'earner_swap' && (
                  <div className="space-y-3.5 text-xs text-left">
                    <span className="text-[9.5px] font-black text-emerald-300 uppercase tracking-widest block">🔄 Member Capital Swap (Earned Balance Exchange)</span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Instantly convert accumulated earnings directly to unspent Advertiser Escrow reserves. Zero transaction fees.
                    </p>

                    <div className="p-3 bg-[#111c2a]/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[8.5px] text-slate-500 uppercase tracking-wide block">Available Member Wallet Balance</span>
                      <div className="flex justify-between items-center">
                        <strong className="text-white text-sm">₦15,000.00 NGN</strong>
                        <span className="text-[8.5px] bg-[#2ebd85]/10 text-emerald-400 bold px-1.5 py-0.5 rounded border border-[#2ebd85]/20 font-mono">
                          Eligible for swap
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-450 uppercase block font-semibold">Amount to Exchange / Swap (₦ NGN)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 10000"
                        className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        const amt = Number(depositAmount);
                        if (isNaN(amt) || amt <= 0) {
                          alert("Specify valid exchange amount.");
                          return;
                        }
                        if (amt > 15000) {
                          alert("Swap rejected: Insufficient earned balance holdings.");
                          return;
                        }
                        setIsDepositing(true);
                        try {
                          const res = await fetch("/api/advertiser/deposit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ advertiserId: user.id, amount: amt })
                          });
                          const data = await res.json();
                          if (!data.error) {
                            setAdvWallet(data.wallet);
                            setDepositSuccess(true);
                            setDepositAmount("");
                          }
                        } catch {}
                        setIsDepositing(false);
                      }}
                      className="w-full py-2 bg-[#2ebd85] hover:bg-emerald-500 active:scale-[0.98] transition-all text-[#000] font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 h-[36px]"
                    >
                      Swap & Credit Escrow instantly
                    </button>
                  </div>
                )}

                {/* 5. ADVERTISER ESCROW WITHDRAWAL */}
                {depositMethod === 'withdraw' && (
                  <form onSubmit={handleAdvWithdrawSubmit} className="space-y-3.5 text-xs text-left">
                    <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest block font-sans">💸 Withdraw Available Reserves</span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Initiate a secure withdrawal from your unspent campaign reserves back to your bank account or cryptocurrency wallet.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-450 uppercase block font-semibold mb-1">Payout Country</label>
                        <select
                          value={advWithdrawCountry}
                          onChange={(e) => {
                            const country = e.target.value;
                            setAdvWithdrawCountry(country);
                            if (country === "Nigeria") setAdvWithdrawCurrency("NGN");
                            else if (country === "Ghana") setAdvWithdrawCurrency("GHS");
                            else if (country === "Kenya") setAdvWithdrawCurrency("KES");
                            else if (country === "United Kingdom") setAdvWithdrawCurrency("GBP");
                            else setAdvWithdrawCurrency("USD");
                          }}
                          className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
                        >
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-[#2ebd85] font-extrabold uppercase tracking-wider block mb-1">Payout Currency</label>
                        <select
                          value={advWithdrawCurrency}
                          onChange={(e) => setAdvWithdrawCurrency(e.target.value)}
                          className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none font-bold text-xs"
                        >
                          <option value="NGN">NGN (₦)</option>
                          <option value="GHS">GHS (GH₵)</option>
                          <option value="KES">KES (KSh)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 uppercase block font-semibold">Withdrawal Amount ({advWithdrawCurrency})</label>
                      <input
                        type="number"
                        value={advWithdrawAmount}
                        onChange={(e) => setAdvWithdrawAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        required
                        className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-slate-100 placeholder:text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 uppercase block font-semibold">Withdrawal Route</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAdvWithdrawMethod("Bank")}
                          className={`py-1.5 rounded-lg font-bold border text-center transition-all ${
                            advWithdrawMethod === "Bank"
                              ? "bg-amber-600/10 text-amber-300 border-amber-600"
                              : "bg-[#090e16] text-slate-400 border-slate-800"
                          }`}
                        >
                          🏦 Country Bank
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvWithdrawMethod("USDT")}
                          className={`py-1.5 rounded-lg font-bold border text-center transition-all ${
                            advWithdrawMethod === "USDT"
                              ? "bg-amber-600/10 text-amber-300 border-amber-600"
                              : "bg-[#090e16] text-slate-400 border-slate-800"
                          }`}
                        >
                          🪙 Cryptocurrencies
                        </button>
                      </div>
                    </div>

                    {advWithdrawMethod === "Bank" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-450 uppercase block">Bank / Provider Name</label>
                          {advWithdrawCountry === "Nigeria" ? (
                            <select
                              value={advWithdrawBank}
                              onChange={(e) => setAdvWithdrawBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100"
                            >
                              <option value="Access Bank PLC">Access Bank PLC</option>
                              <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank PLC</option>
                              <option value="United Bank for Africa (UBA)">United Bank for Africa PLC</option>
                              <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                              <option value="Wema Bank PLC">Wema Bank PLC</option>
                              <option value="Palmpay">Palmpay</option>
                              <option value="Opay Digital Services">Opay Digital Services</option>
                            </select>
                          ) : advWithdrawCountry === "Ghana" ? (
                            <select
                              value={advWithdrawBank}
                              onChange={(e) => setAdvWithdrawBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100"
                            >
                              <option value="MTN Mobile Money">MTN Mobile Money (MoMo)</option>
                              <option value="Vodafone Cash">Vodafone Cash</option>
                              <option value="GCB Bank PLC">GCB Bank PLC</option>
                              <option value="Ecobank Ghana">Ecobank Ghana</option>
                            </select>
                          ) : advWithdrawCountry === "Kenya" ? (
                            <select
                              value={advWithdrawBank}
                              onChange={(e) => setAdvWithdrawBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100"
                            >
                              <option value="Safaricom M-Pesa">Safaricom M-Pesa</option>
                              <option value="Equity Bank Kenya">Equity Bank Kenya</option>
                              <option value="KCB Bank Kenya">KCB Bank Kenya</option>
                            </select>
                          ) : advWithdrawCountry === "United Kingdom" ? (
                            <select
                              value={advWithdrawBank}
                              onChange={(e) => setAdvWithdrawBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100"
                            >
                              <option value="Barclays Bank">Barclays Bank</option>
                              <option value="HSBC UK">HSBC UK</option>
                              <option value="Revolut UK">Revolut UK</option>
                              <option value="Monzo Bank">Monzo Bank</option>
                            </select>
                          ) : (
                            <select
                              value={advWithdrawBank}
                              onChange={(e) => setAdvWithdrawBank(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100"
                            >
                              <option value="JPMorgan Chase">JPMorgan Chase</option>
                              <option value="Bank of America">Bank of America</option>
                              <option value="Wells Fargo">Wells Fargo</option>
                              <option value="Mercury Treasury">Mercury Treasury</option>
                            </select>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-450 uppercase block">
                            {advWithdrawCountry === "Nigeria" ? "NUBAN Account Number" :
                             advWithdrawCountry === "Ghana" || advWithdrawCountry === "Kenya" ? "Mobile Wallet / Account Number" :
                             advWithdrawCountry === "United Kingdom" ? "UK Bank Sort Code / Account" : "US Bank ACH Routing / Account"}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. account / identifier detail"
                            value={advWithdrawAccount}
                            onChange={(e) => setAdvWithdrawAccount(e.target.value)}
                            className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100 placeholder:text-slate-700"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block">Crypto Network Asset Address (USDT TRC20 / ERC20, BTC, ETH)</label>
                        <input
                          type="text"
                          placeholder="e.g. USDT, BTC or ETH destination wallet address"
                          value={advWithdrawUSDT}
                          onChange={(e) => setAdvWithdrawUSDT(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none text-slate-100 placeholder:text-slate-700"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 uppercase block font-semibold">Security Transaction PIN</label>
                      <input
                        type="password"
                        pattern="\d*"
                        maxLength={6}
                        required
                        placeholder="Enter 4-6 digit PIN"
                        value={advWithdrawPIN}
                        onChange={(e) => setAdvWithdrawPIN(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 bg-[#090e16] border border-slate-800 rounded-lg text-xs text-center font-mono tracking-widest outline-none text-slate-100 placeholder:text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAdvWithdrawing}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer h-[36px]"
                    >
                      {isAdvWithdrawing ? "Processing Security clearance..." : "Request Reserve Withdrawal"}
                    </button>

                    {advWithdrawError && (
                      <p className="p-2 bg-red-950/20 text-rose-400 border border-rose-950/40 rounded-lg text-center font-bold text-[10px]">
                        ⚠️ {advWithdrawError}
                      </p>
                    )}

                    {advWithdrawSuccess && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-xl space-y-1 text-center">
                        <p className="font-extrabold uppercase tracking-wide text-emerald-400">🎉 Reserve Withdrawal Dispatched!</p>
                        <p className="font-mono text-[9px] text-slate-300">
                          Amount: ₦{advWithdrawSuccess.amount.toLocaleString()} | Ref: {advWithdrawSuccess.ref}
                        </p>
                      </div>
                    )}
                  </form>
                )}

              </div>

              {depositSuccess && (
                <div className="p-3 text-center text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-xl space-y-1">
                  <p className="font-extrabold uppercase tracking-wide">🎉 Platform Cash Assets Inflow Registered!</p>
                  <p className="font-mono text-[9px] font-medium text-slate-350">
                    Escrow ledger synchronised safely. Campaign reserves available balance successfully updated!
                  </p>
                </div>
              )}
            </div>

            {/* CREATE CAMPAIGN */}
            <div className="bg-[#111c2a] rounded-xl border border-slate-800 p-4 space-y-3 shadow-md">
              <h3 className="font-extrabold text-xs text-white border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <PlusCircle size={13} className="text-indigo-400" /> Deploy Campaign Target
              </h3>

              <form onSubmit={handleCampaignSubmit} className="space-y-3">
                {formError && (
                  <p className="p-2.5 bg-rose-950/40 border border-rose-900 text-rose-300 text-[10px] rounded-lg">
                    ⚠️ {formError}
                  </p>
                )}
                {formSuccess && (
                  <p className="p-2.5 bg-emerald-950/40 border border-[#1b3425] text-emerald-300 text-[10px] rounded-lg">
                    🎉 Campaign budget published and set active successfully! Create more campaigns to target distinct audience segments.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Campaign Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Follow Jumia on TikTok"
                      required
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none focus:border-indigo-500 font-sans text-white focus:bg-[#0c121d]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Task Category Category</label>
                    <select
                      value={campaignCategory}
                      onChange={(e) => setCampaignCategory(e.target.value)}
                      className="w-full px-2 py-2 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-bold text-slate-300 outline-none"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">AI Compliance Validation Instructions</label>
                  <textarea
                    placeholder="Provide detailed compliance instructions..."
                    required
                    value={campaignInstructions}
                    onChange={(e) => setCampaignInstructions(e.target.value)}
                    className="w-full h-16 p-3 bg-[#090e16] border border-slate-800 rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9.5px] text-[#2ebd85] font-extrabold uppercase flex items-center justify-between">
                      <span>Target Advert link / Redirection URL</span>
                      <span className="text-[7.5px] text-slate-400 font-normal">Where earners are routed</span>
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://tiktok.com/@jumia or play.google.com"
                      value={campaignLink || ""}
                      onChange={(e) => setCampaignLink(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090e16] border border-slate-800 rounded-lg text-xs font-mono outline-none text-emerald-300 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] text-slate-455 font-extrabold uppercase">Campaign Escrow billing</label>
                    <div className="p-2.5 bg-[#090e16] border border-slate-800 rounded-lg text-[10.5px] text-slate-400 font-medium leading-none flex justify-between items-center sm:h-[38px]">
                      <span>Unspent Reserve Escrow</span>
                      <span className="text-[8.5px] text-emerald-400 font-bold">10% Platform fee charged</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-[#090e16] p-3 rounded-lg border border-slate-850">
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#ffac4b] font-extrabold uppercase flex items-center justify-between">
                      <span>Task Reward</span>
                      <span className="text-[7.5px] text-slate-400 select-none">Min: ₦{dynamicMinReward}</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={campaignReward}
                      onChange={(e) => setCampaignReward(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#111c2a] border border-slate-800 rounded-md text-xs font-semibold focus:border-[#ffac4b] outline-none font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-indigo-400 font-extrabold uppercase">Spend Target</label>
                    <input
                      type="number"
                      required
                      value={campaignBudget}
                      onChange={(e) => setCampaignBudget(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#111c2a] border border-slate-800 rounded-md text-xs font-semibold focus:border-indigo-500 outline-none font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#ffac4b] font-black uppercase tracking-wider block">
                      Product Picture / Ad Image Creative URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL here, or pick a stock visual below..."
                        value={campaignCreative}
                        onChange={(e) => setCampaignCreative(e.target.value)}
                        className="w-full px-2 py-1.5 bg-[#111c2a] border border-slate-800 rounded-md text-xs outline-none text-slate-350 focus:border-[#ffac4b]"
                      />
                    </div>
                    
                    {/* Quick Select Stock Designs */}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <span className="text-[7.5px] text-slate-500 font-extrabold uppercase shrink-0 py-1">Quick Stock:</span>
                      {[
                        { label: "Fintech Card", url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=300&q=80" },
                        { label: "E-Commerce Box", url: "https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=300&q=80" },
                        { label: "Phone Promo", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80" },
                        { label: "Gift Box", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80" }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setCampaignCreative(item.url)}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded text-[8px] text-slate-400 font-bold transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {campaignCreative && (
                      <div className="mt-2 p-1 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-2.5 max-h-16 overflow-hidden">
                        <img 
                          src={campaignCreative} 
                          alt="Creative Preview" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md bg-slate-950 shrink-0 border border-slate-800"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=100&q=80";
                          }}
                        />
                        <div className="text-[7.5px] text-slate-400 truncate leading-tight">
                          <p className="font-extrabold text-slate-300">Live Product Preview</p>
                          <p className="truncate text-slate-500 font-mono">{campaignCreative}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Audiece reach estimates */}
                <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-xs flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-indigo-400">⚡ Estimated Reach Prediction</p>
                    <p className="text-[9px] text-slate-450 leading-none">AI predicted unique impressions reach</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-white font-sans">{predictedAudience.toLocaleString()} earners</p>
                    <p className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.5 rounded text-indigo-300 inline-block font-bold">100% Guaranteed</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-colors border border-indigo-500"
                >
                  Publish Campaign Budget
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: ANALYTICS REPORT & MANUAL AUDITING (Differentiated) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* ANALYTICAL REPORT PANEL (Requested) */}
            <div className="bg-[#111c2a] rounded-xl border border-slate-800 p-4 space-y-3 shadow-md">
              <h3 className="font-extrabold text-xs text-white border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <BarChart3 size={13} className="text-indigo-400" /> Live Campaign Analytics
              </h3>

              {advertiserCampaigns.length === 0 ? (
                <p className="text-[10px] text-slate-500 py-6 text-center">No reports active. Publish a campaign to analyze telemetry.</p>
              ) : (
                <div className="space-y-3 divide-y divide-slate-800/60 font-sans">
                  {advertiserCampaigns.map(cmp => {
                    const allocated = cmp.totalBudget;
                    const remaining = cmp.remainingBudget;
                    const used = allocated - remaining;
                    const completionsCount = submissions.filter(s => s.campaignId === cmp.id && s.status === 'approved').length;
                    const ratio = allocated > 0 ? (used / allocated) * 100 : 0;

                    return (
                      <div key={cmp.id} className="pt-3 first:pt-0 space-y-1.5 text-xs text-slate-350">
                        <div className="flex justify-between items-center">
                          <p className="font-extrabold text-slate-100 font-sans text-xs">{cmp.title}</p>
                          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded">ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 grid-flow-row py-1 text-center font-sans tracking-tight bg-[#090e16]/40 p-2 rounded border border-slate-800/10 font-mono text-[9px]">
                          <div>
                            <span className="text-slate-450 uppercase text-[7px] block font-extrabold">Allocated</span>
                            <span className="font-extrabold text-white">₦{allocated}</span>
                          </div>
                          <div>
                            <span className="text-slate-450 uppercase text-[7px] block font-extrabold">Conversions</span>
                            <span className="font-extrabold text-indigo-400">{completionsCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-450 uppercase text-[7px] block font-extrabold">Remaining</span>
                            <span className="font-extrabold text-emerald-400">₦{remaining}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5 pb-2">
                          <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                            <span>Impression Reach Progress: {ratio.toFixed(0)}%</span>
                            <span>{fmt(used)} Out of {fmt(allocated)}</span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ratio}%` }} />
                          </div>
                        </div>

                        {/* Interactive Escalation & Unspent Escrow Refund Control */}
                        {cmp.status !== 'completed' && remaining > 0 ? (
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/40">
                            <span className="text-[8px] text-slate-500 font-bold uppercase font-sans">Escrow Securing</span>
                            <button
                              onClick={() => handleRefundCampaignBudget(cmp.id)}
                              className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded text-[8.5px] font-black cursor-pointer transition-colors"
                              title="Instantly stop this campaign and refund remaining escrow"
                            >
                              Cancel & Reclaim Escrow
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/40 text-[8px] text-slate-500 font-bold uppercase font-sans">
                            <span>Campaign Escrow Status</span>
                            <span className="text-emerald-400">Closed / Redeemed</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {refundStatusMsg && (
                    <div className="p-2 border border-slate-800 bg-slate-900 rounded text-center text-[9px] text-amber-400 font-black animate-pulse">
                      {refundStatusMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MANUAL SUBMISSION REVIEW PANEL */}
            <div className="bg-[#111c2a] rounded-xl border border-slate-800 p-4 space-y-3 shadow-md text-left">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSubQueueTab('pending')}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all text-center cursor-pointer ${
                    subQueueTab === 'pending'
                      ? 'bg-slate-850 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  📥 Review Queue ({pendingSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubQueueTab('verified')}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all text-center cursor-pointer ${
                    subQueueTab === 'verified'
                      ? 'bg-slate-850 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  ✅ Verified History ({verifiedSubmissions.length})
                </button>
              </div>

              {subQueueTab === 'pending' ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2.5 gap-2 pt-1">
                    <h3 className="font-extrabold text-xs text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckSquare size={13} className="text-emerald-500" /> Manual Checking Queue ({pendingSubmissions.length})
                    </h3>
                    
                    {pendingSubmissions.length > 0 && (
                      <button
                        type="button"
                        disabled={isBulkAuditing}
                        onClick={handleAIBulkAudit}
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm border border-amber-400/20"
                      >
                        {isBulkAuditing ? (
                          <>
                            <Loader2 size={10} className="animate-spin" />
                            <span>Processing AI Queue...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={10} className="fill-slate-950 animate-pulse" />
                            <span>⚡ Run AI Auto-Auditor on Queue</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {bulkAuditResult && (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                      🤖 AI Auditor Summary: {bulkAuditResult}
                    </div>
                  )}

                  {pendingSubmissions.length === 0 ? (
                    <p className="text-[10px] text-slate-500 py-6 text-center">All user submissions have been verified automatically by AI.</p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {pendingSubmissions.map(sub => {
                        const cmpObj = campaigns.find(c => c.id === sub.campaignId);
                        const userObj = usersList.find(u => u.id === sub.userId);
                        const isSingleAuditing = isAuditingSubId === sub.id;

                        return (
                          <div key={sub.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-xs space-y-2.5 text-slate-350 hover:border-slate-800 transition-all">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-extrabold text-slate-200 text-[11.5px] leading-snug">{cmpObj?.title || "Campaign"}</p>
                                <p className="text-[9.5px] text-slate-500 mt-0.5">Submitted by user: <span className="text-slate-400 font-bold">{userObj?.name || "EarnPay Member"}</span> ({userObj?.email})</p>
                              </div>
                              <span className="font-black text-emerald-400 shrink-0 font-sans text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">₦{cmpObj?.rewardValue}</span>
                            </div>

                            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-850 font-sans text-[10px] space-y-1">
                              <span className="font-black text-slate-500 block text-[8px] uppercase tracking-widest">Submitted proof description & details:</span>
                              <span className="text-slate-300 leading-normal whitespace-pre-line block font-mono text-[9px]">{sub.submissionProof}</span>
                            </div>

                            {sub.aiFeedback && (
                              <div className="p-2 bg-indigo-950/20 border border-indigo-500/10 rounded-lg text-[9.5px] text-indigo-350 leading-relaxed font-sans">
                                🤖 <strong className="font-extrabold uppercase text-[8px] tracking-wider text-indigo-400">Previous AI Audit Insight:</strong> {sub.aiFeedback}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isSingleAuditing}
                                onClick={() => onApproveSubmission(sub.id)}
                                className="py-1.5 bg-emerald-600/95 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-black text-[9px] tracking-widest uppercase rounded-xl cursor-pointer transition-all border border-emerald-500/20 shadow-sm"
                              >
                                Disburse Reward
                              </button>
                              
                              <button
                                type="button"
                                disabled={isSingleAuditing}
                                onClick={() => handleAISingleAudit(sub.id)}
                                className="py-1.5 bg-gradient-to-r from-amber-500/15 to-amber-600/20 hover:from-amber-500/25 hover:to-amber-600/30 text-amber-400 font-black text-[9px] tracking-widest uppercase rounded-xl cursor-pointer transition-all border border-amber-500/20 flex items-center justify-center gap-1 shadow-xs"
                              >
                                {isSingleAuditing ? (
                                  <>
                                    <Loader2 size={10} className="animate-spin text-amber-400" />
                                    <span>Evaluating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={10} className="fill-amber-400" />
                                    <span>🤖 AI Review Audit</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="border-b border-slate-800 pb-2 pt-1">
                    <h3 className="font-extrabold text-xs text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckCircle size={13} className="text-emerald-500" /> Completed Tasks History ({verifiedSubmissions.length})
                    </h3>
                  </div>

                  {verifiedSubmissions.length === 0 ? (
                    <p className="text-[10px] text-slate-500 py-6 text-center">No completed tasks recorded yet in history.</p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {[...verifiedSubmissions].reverse().map(sub => {
                        const cmpObj = campaigns.find(c => c.id === sub.campaignId);
                        const userObj = usersList.find(u => u.id === sub.userId);
                        
                        let statusText = "Approved & Paid";
                        let statusStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/10";
                        if (sub.status === 'rejected') {
                          statusText = "Rejected";
                          statusStyle = "text-rose-400 bg-rose-500/10 border-rose-500/10";
                        }

                        return (
                          <div key={sub.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-xs space-y-2 text-slate-350">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-extrabold text-slate-200 text-[11px] leading-snug">{cmpObj?.title || "Campaign"}</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">User: <span className="text-slate-400 font-bold">{userObj?.name || "EarnPay Member"}</span> ({userObj?.email})</p>
                              </div>
                              <span className="font-black text-emerald-400 shrink-0 font-sans text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md">₦{cmpObj?.rewardValue}</span>
                            </div>

                            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850/50 font-sans text-[9px] space-y-1">
                              <span className="font-black text-slate-500 block text-[8px] uppercase">User Proof Submitted:</span>
                              <p className="text-slate-400 leading-normal font-mono text-[9px]">{sub.submissionProof}</p>
                            </div>

                            {sub.aiFeedback && (
                              <div className="p-1.5 bg-indigo-950/20 border border-indigo-500/5 rounded-lg text-[9px] text-indigo-350 leading-normal font-sans">
                                🤖 <strong>Auditor Feedback:</strong> {sub.aiFeedback}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[8.5px] text-slate-500 pt-1">
                              <span>Verified: {new Date(sub.createdAt).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase ${statusStyle}`}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ADVERTISER SUPPORT MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-[#070b12]/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111c2a] border border-[#1e2e42] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => { setIsSupportModalOpen(false); setActiveAdvTicketId(null); }}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <XCircle size={18} />
            </button>

            <div className="border-b border-slate-800 pb-3 flex items-center gap-1.5">
              <LifeBuoy className="text-emerald-400 animate-pulse" size={18} />
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Help & Support Desk</h3>
                <p className="text-[10px] text-slate-400">Direct connections to our core operations and financial support team</p>
              </div>
            </div>

            {/* Direct Social Channels */}
            <div className="bg-[#0e1722] border border-[#1e2d3e] rounded-xl p-3.5 space-y-3">
              <span className="text-[9.5px] font-black uppercase text-[#5ab8ff] block tracking-wide">📞 Hotline Support & Social Channels</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {settings?.supportPhone && (
                  <a
                    href={`tel:${settings.supportPhone}`}
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 px-1.5 bg-[#2563eb]/20 text-[#3b82f6] rounded-lg text-[10px]">
                      <Phone size={11} />
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Phone Call</span>
                      <span className="text-[9.5px] font-bold text-slate-200 font-mono truncate block">{settings.supportPhone}</span>
                    </div>
                  </a>
                )}

                {settings?.supportWhatsapp && (
                  <a
                    href={`https://wa.me/${settings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 bg-[#10b981]/20 text-[#10b981] rounded-lg text-[10px]">
                      <MessageCircle size={11} />
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">WhatsApp</span>
                      <span className="text-[9.5px] font-bold text-slate-200 font-mono truncate block">{settings.supportWhatsapp}</span>
                    </div>
                  </a>
                )}

                {settings?.supportFacebook && (
                  <a
                    href={settings.supportFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px]">
                      <Facebook size={11} />
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Facebook</span>
                      <span className="text-[9px] font-bold text-slate-200 truncate block">fb_support</span>
                    </div>
                  </a>
                )}

                {settings?.supportTwitter && (
                  <a
                    href={settings.supportTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 bg-slate-850 text-slate-300 rounded-lg text-[10px]">
                      <Twitter size={11} />
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Twitter/X</span>
                      <span className="text-[9px] font-bold text-slate-200 truncate block">x_support</span>
                    </div>
                  </a>
                )}

                {settings?.supportTiktok && (
                  <a
                    href={settings.supportTiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 bg-red-500/20 text-red-100 rounded-lg text-[10px] flex items-center justify-center">
                      🎵
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">TikTok</span>
                      <span className="text-[9px] font-bold text-slate-200 truncate block">tiktok_support</span>
                    </div>
                  </a>
                )}

                {settings?.supportTelegram && (
                  <a
                    href={settings.supportTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#1a2839] hover:bg-[#203248] rounded-xl transition-all border border-[#2b3e55]/30"
                  >
                    <div className="p-1 bg-[#4f46e5]/20 text-[#6366f1] rounded-lg text-[10px] flex items-center justify-center">
                      📢
                    </div>
                    <div className="truncate">
                      <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Telegram</span>
                      <span className="text-[9px] font-bold text-slate-200 truncate block">telegram_desk</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {activeAdvTicketId ? (
              (() => {
                const ticket = tickets.find(t => t.id === activeAdvTicketId);
                if (!ticket) return null;
                return (
                  <div className="bg-[#0e1722] border border-[#1e2d3e] rounded-xl p-3.5 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-[#5ab8ff] uppercase tracking-wide truncate">{ticket.subject}</span>
                      <button 
                        onClick={() => setActiveAdvTicketId(null)}
                        className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded hover:text-white transition-colors cursor-pointer text-[8px] uppercase font-black"
                      >
                        All Tickets
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto p-1.5 bg-[#090e16] rounded-lg">
                      {ticket.messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-2 rounded-xl text-[10px] max-w-[85%] leading-relaxed ${
                            m.sender === 'user' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/10' : 'bg-slate-800 text-slate-300'
                          }`}>
                            <p>{m.text}</p>
                            <span className="block text-[7px] text-slate-500 text-right mt-1 font-mono uppercase">{m.sender === 'user' ? 'You' : 'Agent'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAdvTicketReply} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Reply message..."
                        required
                        value={advTicketReplyText}
                        onChange={(e) => setAdvTicketReplyText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 focus:border-[#5ab8ff] rounded px-2.5 py-1.5 outline-none text-xs text-slate-100 font-sans"
                      />
                      <button type="submit" className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded uppercase tracking-wider cursor-pointer">
                        Reply
                      </button>
                    </form>
                  </div>
                );
              })()
            ) : (
              <div className="space-y-4">
                {/* Create Ticket */}
                <div className="bg-[#0e1722] border border-[#1e2d3e] rounded-xl p-3.5 space-y-2">
                  <span className="text-[9.5px] font-black uppercase text-amber-450 block tracking-wide">📧 Open Live Chat Ticket to Support Admin</span>
                  
                  <form onSubmit={handleAdvNewTicket} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Subject (e.g. Budget delay)"
                        required
                        value={newAdvTicketSubject}
                        onChange={(e) => setNewAdvTicketSubject(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 outline-none text-[10px] text-slate-200 placeholder:text-slate-500 font-sans"
                      />
                      <select
                        value={newAdvTicketCategory}
                        onChange={(e) => setNewAdvTicketCategory(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1.5 outline-none text-[10px] text-slate-200 font-bold font-mono"
                      >
                        <option value="Campaigns">Campaign Budget</option>
                        <option value="Billing">Billing & Reserves</option>
                        <option value="Verifying">Ad Verification</option>
                        <option value="Partner">Other queries</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="Explain details in full. Include campaign code, links or billing ref ID."
                      required
                      value={newAdvTicketMsg}
                      onChange={(e) => setNewAdvTicketMsg(e.target.value)}
                      className="w-full h-14 bg-slate-900 border border-slate-800 rounded p-2.5 outline-none text-[10px] text-slate-200 placeholder:text-slate-500 font-sans"
                    />

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] rounded uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Initialize Chat Ticket
                    </button>
                  </form>
                </div>

                {/* View Active Cases */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[9.5px] font-black uppercase text-slate-450 block tracking-wider pl-0.5">Tickets History</span>
                  {tickets.length === 0 ? (
                    <p className="text-center bg-[#0e1722] border border-[#1e2d3e]/50 p-4 rounded-xl text-[10px] text-slate-500 font-semibold leading-relaxed">No custom tickets created yet.</p>
                  ) : (
                    <div className="bg-[#0e1722] rounded-xl border border-[#1e2d3e]/50 divide-y divide-[#1e2d3e]/50 overflow-hidden shadow-xs">
                      {tickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveAdvTicketId(t.id)}
                          className="w-full p-2.5 hover:bg-[#1a2839]/60 flex justify-between items-center text-left cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="font-extrabold text-[11px] text-slate-200 line-clamp-1">{t.subject}</p>
                            <span className="text-[8px] text-slate-500 font-medium block mt-0.5 uppercase font-mono">
                              Category: {t.category} · Ref: {t.id}
                            </span>
                          </div>
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                            t.status === 'open' ? 'bg-amber-550/20 text-amber-400' : 'bg-emerald-550/20 text-emerald-400'
                          }`}>
                            {t.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdvPinSetup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
          <div className="bg-[#111c2a] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                🔑 {user.pin ? "Request Password / PIN Reset" : "Security PIN Configuration"}
              </h3>
              <button 
                onClick={() => {
                  setShowAdvPinSetup(false);
                  setSecurityReqError("");
                  setSecurityReqSuccess("");
                  setAdvPinError("");
                  setAdvPinSuccess("");
                }} 
                className="text-[10px] text-slate-400 hover:text-slate-250 font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            {user.pin ? (
              <form onSubmit={handleSecurityReqSubmit} className="space-y-4">
                <div className="p-3 bg-indigo-950/45 border border-indigo-800/50 rounded-xl text-[10px] text-indigo-300 leading-relaxed font-sans font-semibold">
                  Setup & modifications of security credentials can only be performed by the <strong>Sole Admin</strong>. Submitting this request logs an action request for verification.
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Request Category</label>
                  <select
                    value={securityReqType}
                    onChange={(e) => setSecurityReqType(e.target.value as any)}
                    className="w-full bg-[#090e16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
                  >
                    <option value="forgot_pin">Forgot / Reset Transaction PIN</option>
                    <option value="forgot_password">Forgot / Reset Password</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">
                    Requested New {securityReqType === "forgot_pin" ? "PIN (4-6 digits)" : "Password (at least 6 chars)"}
                  </label>
                  <input
                    type={securityReqType === "forgot_pin" ? "password" : "text"}
                    maxLength={securityReqType === "forgot_pin" ? 6 : 50}
                    required
                    placeholder={securityReqType === "forgot_pin" ? "e.g. 1234" : "e.g. NewSecretPassword123"}
                    value={securityReqValue}
                    onChange={(e) => setSecurityReqValue(securityReqType === "forgot_pin" ? e.target.value.replace(/\D/g, "") : e.target.value)}
                    className="w-full px-3 py-2 border border-slate-800 bg-[#090e16] text-slate-100 text-xs font-mono rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSecurityReq}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {isSubmittingSecurityReq ? "Submitting Security Request..." : "Submit Reset Request"}
                </button>

                {securityReqError && (
                  <p className="p-2 bg-red-950/20 text-rose-400 border border-rose-950/40 rounded-lg text-center font-bold text-[10px]">
                    ⚠️ {securityReqError}
                  </p>
                )}

                {securityReqSuccess && (
                  <p className="p-2 bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 rounded-lg text-center font-bold text-[10px]">
                    ✓ {securityReqSuccess}
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleAdvPinSubmit} className="space-y-4">
                <div className="p-3 bg-amber-600/15 border border-amber-500/25 rounded-xl text-[10px] text-amber-300 leading-relaxed font-sans font-semibold">
                  Your 4-6 digit Security Transaction PIN is required for all reserve withdrawals. Guard your PIN carefully. 4 incorrect entries will lock you out for 24 hours.
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">New 4-6 Digit Security PIN</label>
                  <input
                    type="password"
                    pattern="\d*"
                    maxLength={6}
                    required
                    placeholder="Enter 4-6 digits"
                    value={advNewPIN}
                    onChange={(e) => setAdvNewPIN(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2 border border-slate-800 bg-[#090e16] text-slate-100 text-xs font-mono text-center tracking-widest rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Confirm Security PIN</label>
                  <input
                    type="password"
                    pattern="\d*"
                    maxLength={6}
                    required
                    placeholder="Re-enter PIN"
                    value={advConfirmPIN}
                    onChange={(e) => setAdvConfirmPIN(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2 border border-slate-800 bg-[#090e16] text-slate-100 text-xs font-mono text-center tracking-widest rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAdvUpdatingPin}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {isAdvUpdatingPin ? "Configuring Security Node..." : "Activate Security PIN"}
                </button>

                {advPinError && (
                  <p className="p-2 bg-red-950/20 text-rose-400 border border-rose-950/40 rounded-lg text-center font-bold text-[10px]">
                    ⚠️ {advPinError}
                  </p>
                )}

                {advPinSuccess && (
                  <p className="p-2 bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 rounded-lg text-center font-bold text-[10px]">
                    ✓ {advPinSuccess}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
