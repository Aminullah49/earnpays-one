import React, { useState } from "react";
import { User, SupportTicket, Achievement, MembershipTier, MembershipConfig } from "../types";
import { 
  UserCheck, ShieldCheck, Mail, Phone, Users, Share2, 
  Tag, Award, HelpCircle, FileText, AlertTriangle, MessageSquare, Plus,
  ChevronRight, ArrowRight, Star, AlertCircle, Copy, Check, Gem,
  Facebook, Twitter, MessageCircle
} from "lucide-react";
import { usePreferences } from "../context/PreferenceContext";


interface ProfileTabProps {
  user: User;
  tickets: SupportTicket[];
  achievements: Achievement[];
  configs: Record<string, MembershipConfig>;
  settings?: any;
  onKYCSubmit: (details: { idType: string; idNumber: string; fullName: string; level: 'basic' | 'advanced' }) => Promise<void>;
  onMembershipUpgrade: (tier: MembershipTier) => Promise<void>;
  onClaimAchievement: (achId: string) => void;
  onCreateTicket: (subject: string, category: string, message: string) => Promise<void>;
  onSendTicketReply: (ticketId: string, reply: string) => Promise<void>;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfileTab({
  user, tickets, achievements, configs, settings,
  onKYCSubmit, onMembershipUpgrade, onClaimAchievement, onCreateTicket, onSendTicketReply,
  onUpdateUser
}: ProfileTabProps) {

  const { fmt, t } = usePreferences();
  const [panelSection, setPanelSection] = useState<"index" | "kyc" | "referral" | "membership" | "achievements" | "support" | "security" | "pin_management">("index");
  const [copiedCode, setCopiedCode] = useState(false);

  // Security PIN states - Requirement 1 & 6
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // KYC form states
  const [kycFullName, setKycFullName] = useState("");
  const [kycIdType, setKycIdType] = useState("National Identity Number (NIN)");
  const [kycIdNumber, setKycIdNumber] = useState("");

  // Support states
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("Earn");
  const [newTicketMsg, setNewTicketMsg] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Security OTP settings states
  const [securityMode, setSecurityMode] = useState<"bypass" | "sms" | "email" | "dual">((user.securityMode as any) || "bypass");
  const [carrierGateway, setCarrierGateway] = useState<string>(user.carrierGateway || "MTN");
  const [securityPhone, setSecurityPhone] = useState<string>(user.phone || "");
  const [securityEmail, setSecurityEmail] = useState<string>(user.securityEmail || user.email || "");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState("");
  const [securityErrorMsg, setSecurityErrorMsg] = useState("");
  const [latestOTPInfo, setLatestOTPInfo] = useState<any>(null);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (!newPIN || newPIN.length < 4) {
      setPinError("Security PIN must be at least 4 digits.");
      return;
    }

    if (newPIN !== confirmPIN) {
      setPinError("Security PINs do not match.");
      return;
    }

    setIsUpdatingPin(true);
    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pin: newPIN })
      });
      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error || "Failed to update security transaction PIN.");
      } else {
        setPinSuccess("Your withdrawal security PIN has been updated successfully!");
        onUpdateUser({ ...user, pin: newPIN });
        setNewPIN("");
        setConfirmPIN("");
      }
    } catch (err) {
      setPinError("Network error. Failed to save Security PIN.");
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Fetch latest OTP dispatch trace for simulation terminal
  const fetchLatestOTPState = async () => {
    try {
      const r = await fetch("/api/auth/latest-otp");
      const d = await r.json();
      if (d.latestDispatchedOTP) {
        setLatestOTPInfo(d.latestDispatchedOTP);
      }
    } catch (e) {
      console.error("Failed to compile cellular logs", e);
    }
  };

  React.useEffect(() => {
    if (panelSection === "security") {
      fetchLatestOTPState();
    }
  }, [panelSection]);

  const handleSecurityForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    setSecuritySuccessMsg("");
    setSecurityErrorMsg("");
    try {
      const res = await fetch("/api/user/update-security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          securityMode,
          carrierGateway,
          securityPhone,
          securityEmail
        })
      });
      const data = await res.json();
      if (data.error) {
        setSecurityErrorMsg(data.error);
      } else {
        setSecuritySuccessMsg("Multi-mode security rules initialized successfully!");
        if (data.user) {
          onUpdateUser(data.user);
        }
        await fetchLatestOTPState();
      }
    } catch (err) {
      setSecurityErrorMsg("Unable to communicate secure parameters to node.");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://earnpay.ng/auth/register?ref=${user.referralCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleKYCForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName || !kycIdNumber) return;
    await onKYCSubmit({
      fullName: kycFullName,
      idType: kycIdType,
      idNumber: kycIdNumber,
      level: "advanced"
    });
    setKycFullName("");
    setKycIdNumber("");
    setPanelSection("index");
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;
    await onCreateTicket(newTicketSubject, newTicketCategory, newTicketMsg);
    setNewTicketSubject("");
    setNewTicketMsg("");
  };

  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicketId) return;
    await onSendTicketReply(activeTicketId, ticketReplyText);
    setTicketReplyText("");
  };

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto px-4 pb-12 animate-in fade-in duration-300">
      
      {/* INDEX PANEL */}
      {panelSection === "index" && (
        <div className="space-y-4">
          
          {/* User Bio Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex items-center gap-3 mt-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-inner border-2 border-slate-200 shrink-0">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-xs text-slate-800 tracking-tight leading-none">{user.name}</h3>
              <p className="text-[10px] text-slate-405 mt-1 line-clamp-1 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  Level {user.membershipTier}
                </span>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                  user.kycLevel === 'advanced' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}>
                  ID: {user.kycLevel === 'advanced' ? "Gov Verified" : "Basic Unverified"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu List */}
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-3xs">
            {[
              { id: "membership", label: "👑 Elevate Membership Levels", desc: "Unlock higher limits and refer earnings" },
              { id: "kyc", label: "🛡️ Government ID KYC Terminal", desc: "NIN, Voter Card, Selfie verification" },
              { id: "pin_management", label: "🔑 Security PIN Administration", desc: "Configure or reset your transaction security PIN" },
              { id: "security", label: "🔒 Smart Multi-Mode & OTP Settings", desc: "SMS text message or email configuration" },
              { id: "referral", label: "📣 3-Level Recruitment Core", desc: "Share your code, trace earning commission splits" },
              { id: "achievements", label: "🏆 Unlocked Achievements CenterCenter", desc: "Claim bonuses for landmark task tasksCenter" },
              { id: "support", label: "💬 Staff Support Ticket DeskDesk", desc: "Create, view, and follow up ticketsDesk" }
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => setPanelSection(menu.id as any)}
                className="w-full p-4 hover:bg-slate-50/50 transition-colors flex justify-between items-center text-left cursor-pointer"
              >
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">{menu.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1">{menu.desc}</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Core regulatory compliance banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 leading-normal text-center font-sans">
            EarnPay Global Network v2.4.0 (Production Live) · Verified & Encrypted Platform
          </div>

        </div>
      )}

      {/* PANEL SECTION: KYC VERIFICATION PORTAL */}
      {panelSection === "kyc" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-xs text-slate-705 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" /> Government ID KYC Terminal
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          {user.kycLevel === "advanced" ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl text-center space-y-2">
              <div className="h-10 w-10 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-lg mx-auto font-bold">
                ✓
              </div>
              <h5 className="font-extrabold text-xs">KYC Status: GOVERNMENT APPROVED!</h5>
              <p className="text-[10px] leading-relaxed opacity-80">
                Congratulations, your NIN validation is greenlighted. You have unlocked unlimited peer-to-peer sending and withdrawals of up to {fmt(500000)} daily.
              </p>
            </div>
          ) : (
            <form onSubmit={handleKYCForm} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-[10px] text-amber-800 font-medium leading-relaxed font-sans">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>Basic users without Government NIN are limited to {fmt(10000)} aggregate withdrawals. Upgrade to prevent payout blocks.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Registered Legal Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tunde Oluremi Bakare"
                  required
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs rounded-xl outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Identity document type</label>
                <select
                  value={kycIdType}
                  onChange={(e) => setKycIdType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none font-bold"
                >
                  <option value="National Identity Number (NIN)">National Identity Number (NIN)</option>
                  <option value="Bank Verification Number (BVN)">Bank Verification Number (BVN)</option>
                  <option value="Voter's Card CardID">Voter's Card CardID / PVC</option>
                  <option value="Nigerian Passport Photo">Nigerian Passport Photo ID</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Document ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1092830219"
                  required
                  value={kycIdNumber}
                  onChange={(e) => setKycIdNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs rounded-xl outline-none transition-all placeholder:text-slate-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Compliance Verification Selfie</label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50 text-[10px] text-slate-400">
                  📸 Selfie image uploaded dynamically. Approved via automated Central ID board.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors"
              >
                Validate ID Verification (Instant)
              </button>
            </form>
          )}
        </div>
      )}

      {/* PANEL SECTION: PIN MANAGEMENT - Requirement 1 & 6 */}
      {panelSection === "pin_management" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-xs text-slate-805 flex items-center gap-1.5">
              🔑 Security PIN Administration
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-[10px] text-amber-850 font-semibold leading-relaxed font-sans">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                Your 4-6 digit Security Transaction PIN is required for all cash withdrawals. Guard your PIN carefully. Wrong entries will freeze your account.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">New 4-6 Digit Security PIN</label>
              <input
                type="password"
                pattern="\d*"
                maxLength={6}
                required
                placeholder="Enter 4-6 digits"
                value={newPIN}
                onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs font-mono text-center tracking-widest rounded-xl outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Confirm Security PIN</label>
              <input
                type="password"
                pattern="\d*"
                maxLength={6}
                required
                placeholder="Re-enter PIN"
                value={confirmPIN}
                onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs font-mono text-center tracking-widest rounded-xl outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPin}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-colors animate-all"
            >
              {isUpdatingPin ? "Configuring Ledger security..." : "Activate Security PIN"}
            </button>

            {pinError && (
              <p className="p-2.5 text-[10px] bg-red-50 text-rose-700 border border-red-200 rounded-lg text-center font-bold">
                ⚠️ {pinError}
              </p>
            )}

            {pinSuccess && (
              <p className="p-2.5 text-[10px] bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-lg text-center font-bold">
                ✓ {pinSuccess}
              </p>
            )}
          </form>
        </div>
      )}

      {/* PANEL SECTION: MEMBERSHIP SYSTEM TIERS */}
      {panelSection === "membership" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white rounded-t-2xl p-4 border-b border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              👑 Elevate Membership Levels
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed px-1">
            Memberships are optional, and are intended only to enlarge limit caps and daily task volumes. **We do not guarantee returns or earnings on any level.**
          </p>

          <div className="space-y-3">
            {(() => {
              const formatBenefitString = (benefit: string) => {
                const regex = /₦([0-9,]+)/g;
                return benefit.replace(regex, (match, p1) => {
                  const rawVal = parseInt(p1.replace(/,/g, ""), 10);
                  return isNaN(rawVal) ? match : fmt(rawVal);
                });
              };

              const items = Object.values(configs || {});
              const tiersList = items.length > 0 ? items : [
                { tier: "Free", price: 0, dailyTasksLimit: 3, benefits: ["3 Daily Tasks", "Basic Offerwall Access", "Referral Commission: 3%", "Withdrawal Limit: ₦5,000/day"] },
                { tier: "Bronze", price: 5000, dailyTasksLimit: 10, benefits: ["10 Daily Tasks", "Premium Offers Access", "Referral Commission: 5%", "Withdrawal Limit: ₦20,000/day"] },
                { tier: "Silver", price: 15000, dailyTasksLimit: 20, benefits: ["20 Daily Tasks", "Better Offers Access", "Referral Commission: 7%", "Withdrawal Limit: ₦5,000/day"] },
                { tier: "Gold", price: 30000, dailyTasksLimit: 40, benefits: ["40 Daily Tasks", "Priority Campaigns Exclusive", "Referral Commission: 10%", "Withdrawal Limit: ₦100,000/day"] },
                { tier: "Platinum", price: 50000, dailyTasksLimit: 60, benefits: ["60 Daily Tasks", "Premium Campaigns Exclusive", "Referral Commission: 12%", "Withdrawal Limit: ₦200,000/day"] },
                { tier: "Diamond", price: 100000, dailyTasksLimit: 100, benefits: ["100 Daily Tasks", "Exclusive Campaigns Direct Access", "Referral Commission: 15%", "Withdrawal Limit: ₦500,000/day"] }
              ];
              
              return tiersList.map((tier) => {
                const active = user.membershipTier === tier.tier;
                return (
                  <div 
                    key={tier.tier}
                    className={`bg-white rounded-2xl border p-4 shadow-3xs flex justify-between items-center transition-all ${
                      active ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500" : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                  <div className="space-y-1.5 max-w-[70%]">
                    <h5 className="font-black text-xs text-slate-800 flex items-center gap-1">
                      {tier.tier} Tier 
                      {tier.tier === "Diamond" && <Gem size={12} className="text-amber-500" />}
                    </h5>
                    <ul className="space-y-1 text-[9px] text-slate-500 list-disc pl-3">
                      {tier.benefits.map((b, idx) => (
                        <li key={idx}>{formatBenefitString(b)}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-xs font-black text-slate-800 font-sans">
                      {tier.price === 0 ? "FREE" : fmt(tier.price)}
                    </p>
                    
                    {active ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-1 rounded-md block text-center">
                        Active Level
                      </span>
                    ) : (
                      <button
                        onClick={() => onMembershipUpgrade(tier.tier)}
                        className="py-1 px-3.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-all"
                      >
                        Buy Level
                      </button>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
        </div>
      )}

      {/* PANEL SECTION: REFERRALS TREE CONSOLE */}
      {panelSection === "referral" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
              <Users size={16} className="text-emerald-600" /> Share Referral Links (3 Levels)
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl leading-relaxed text-[11px] text-indigo-900">
            <p className="font-bold flex items-center gap-1"><Star size={13} className="text-amber-500 fill-amber-500" /> Multi-Tier Referral Program:</p>
            <p className="mt-1 font-sans text-[10px]">Invite new recruits and capture daily splits of their earning completions:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[9px] font-sans">
              <li><span className="font-bold">Level 1 Recruits:</span> {configs[user.membershipTier]?.referralCommission * 100 || 3}% split</li>
              <li><span className="font-bold">Level 2 Recruits:</span> 1.5% split</li>
              <li><span className="font-bold">Level 3 Recruits:</span> 0.5% split</li>
            </ul>
          </div>

          {/* Code display */}
          <div className="pt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Your Personal Recruitment Link</span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                readOnly
                value={`https://earnpay.ng/auth/register?ref=${user.referralCode}`}
                className="flex-1 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl text-[10px] outline-none font-medium text-slate-500 select-all font-sans"
              />
              <button
                onClick={copyReferralCode}
                className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
              >
                {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] text-slate-450 block font-bold uppercase">Level 1 Recruits</span>
              <span className="text-sm font-black text-slate-800 block mt-1 font-sans">2</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] text-slate-450 block font-bold uppercase">Level 2 Recruits</span>
              <span className="text-sm font-black text-slate-800 block mt-1 font-sans">1</span>
            </div>
          </div>
        </div>
      )}

      {/* PANEL SECTION: UNLOCKED Badges ACHIEVEMENTS */}
      {panelSection === "achievements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white rounded-t-2xl p-4 border-b border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              🏆 Unlocked Achievements Center
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          {achievements.length === 0 ? (
            <p className="text-center bg-white border border-slate-100 p-8 rounded-2xl text-xs text-slate-400">
              Complete more tasks or level memberships to claim extra achievements.
            </p>
          ) : (
            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div key={ach.id} className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-3xs flex gap-3.5 items-center justify-between">
                  <div className="flex gap-2.5 items-center">
                    <span className="text-2xl pt-1">
                      {ach.badge === 'first_task' ? "🎯" : ach.badge === 'first_referral' ? "📣" : "💎"}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-[11px] text-slate-800 leading-tight">{ach.title}</h5>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-0.5 max-w-[210px]">{ach.description}</p>
                    </div>
                  </div>

                  {ach.unlockedAt ? (
                    ach.bonusClaimed ? (
                      <span className="text-[9px] bg-slate-100 text-slate-450 px-2.5 py-1 rounded-md font-extrabold shrink-0">
                        Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => onClaimAchievement(ach.id)}
                        className="py-1 px-3 bg-emerald-650 hover:bg-emerald-700 font-extrabold text-[9px] text-white rounded-md shrink-0 cursor-pointer"
                      >
                        Claim +{fmt(ach.bonusAmount)}
                      </button>
                    )
                  ) : (
                    <span className="text-[8px] border border-slate-200 text-slate-400 px-2 py-0.5 rounded-sm font-semibold shrink-0">
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PANEL SECTION: CUSTOMER SUPPORT Ticket DESK */}
      {panelSection === "support" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white rounded-t-2xl p-4 border-b border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              💬 Customer Support Ticket Desk
            </h4>
            <button 
              onClick={() => {
                setPanelSection("index");
                setActiveTicketId(null);
              }} 
              className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Back
            </button>
          </div>

          {activeTicketId ? (
            // ACTIVE TICKET CHIP DETAIL VIEW
            (() => {
              const ticket = tickets.find(t => t.id === activeTicketId);
              if (!ticket) return null;
              return (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h5 className="font-extrabold text-xs text-slate-800 line-clamp-1">{ticket.subject}</h5>
                    <button onClick={() => setActiveTicketId(null)} className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-500 cursor-pointer">
                      View Tickets
                    </button>
                  </div>

                  {/* Message stack */}
                  <div className="space-y-3 max-h-72 overflow-y-auto p-1 bg-slate-50/50 rounded-xl">
                    {ticket.messages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 rounded-xl text-[10px] max-w-[80%] leading-relaxed ${
                          m.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                          {m.text}
                          <span className="block text-[8px] text-slate-400 text-right mt-1 font-sans">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message input */}
                  <form onSubmit={handleTicketReply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type reply to support agent..."
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl outline-none text-xs transition-all"
                    />
                    <button type="submit" className="px-3.5 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer">
                      Reply
                    </button>
                  </form>
                </div>
              );
            })()
          ) : (
            // LOGS AND NEW TICKET Form
            <div className="space-y-4">
              {/* Direct Support Contact Channels */}
              <div className="bg-[#f0f9ff]/60 border border-[#b3e0ff]/40 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wide">Direct Staff Support Channels</h5>
                    <p className="text-[9.5px] text-blue-650">Call, WhatsApp, follow our socials, or use our direct Live Support ticket desk below.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {settings?.supportPhone && (
                    <a
                      href={`tel:${settings.supportPhone}`}
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 px-1.5 bg-sky-100 text-sky-700 rounded-lg text-[10px]">
                        <Phone size={12} />
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Phone Call</span>
                        <span className="text-[10px] font-bold text-slate-700 font-mono truncate block">{settings.supportPhone}</span>
                      </div>
                    </a>
                  )}

                  {settings?.supportWhatsapp && (
                    <a
                      href={`https://wa.me/${settings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px]">
                        <MessageCircle size={12} />
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">WhatsApp</span>
                        <span className="text-[10px] font-bold text-slate-700 font-mono truncate block">{settings.supportWhatsapp}</span>
                      </div>
                    </a>
                  )}

                  {settings?.supportFacebook && (
                    <a
                      href={settings.supportFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 bg-blue-100 text-blue-650 rounded-lg text-[10px]">
                        <Facebook size={12} />
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Facebook</span>
                        <span className="text-[9px] font-bold text-slate-700 truncate block">fb.me/page</span>
                      </div>
                    </a>
                  )}

                  {settings?.supportTwitter && (
                    <a
                      href={settings.supportTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 bg-slate-100 text-slate-900 rounded-lg text-[10px]">
                        <Twitter size={12} />
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Twitter/X</span>
                        <span className="text-[9px] font-bold text-slate-700 truncate block">twitter_support</span>
                      </div>
                    </a>
                  )}

                  {settings?.supportTiktok && (
                    <a
                      href={settings.supportTiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 bg-red-50 text-red-650 rounded-lg text-[10px] font-bold font-mono">
                        🎵
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">TikTok</span>
                        <span className="text-[9px] font-bold text-slate-700 truncate block">tiktok_channel</span>
                      </div>
                    </a>
                  )}

                  {settings?.supportTelegram && (
                    <a
                      href={settings.supportTelegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-3xs"
                    >
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold font-mono">
                        📢
                      </div>
                      <div className="truncate">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Telegram</span>
                        <span className="text-[9px] font-bold text-slate-700 truncate block">t.me/channel</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Ticket Creator Form */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-3">
                <p className="font-extrabold text-[11px] text-slate-700 uppercase">Create New Support Case</p>
                
                <form onSubmit={handleNewTicket} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Ticket Subject (e.g. Deposit delayed)"
                      required
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="px-3 py-2.5 border border-slate-200 focus:border-emerald-600 text-xs rounded-xl outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                    />
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="p-2 border border-slate-200 text-xs rounded-xl outline-none font-bold bg-slate-50"
                    >
                      <option value="Earn">Earnings & Tasks</option>
                      <option value="Withdraw">Withdrawals</option>
                      <option value="Membership">Upgrade Tiers</option>
                      <option value="KYC">KYC validation</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Elaborate details. Provide transaction references or user details."
                    required
                    value={newTicketMsg}
                    onChange={(e) => setNewTicketMsg(e.target.value)}
                    className="w-full h-16 p-3 border border-slate-200 focus:border-emerald-605 text-xs rounded-xl outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white font-sans"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Open Support Ticket
                  </button>
                </form>
              </div>

              {/* Past tickets logs */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-[11px] text-slate-700 px-0.5 uppercase tracking-wide">Under Review Cases</h5>
                {tickets.length === 0 ? (
                  <p className="text-center bg-white border border-slate-100 p-6 rounded-2xl text-[11px] text-slate-450">
                    No support cases. Open a new ticket anytime.
                  </p>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-3xs">
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTicketId(t.id)}
                        className="w-full p-4 hover:bg-slate-50/50 flex justify-between items-center text-left cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-extrabold text-xs text-slate-800 line-clamp-1">{t.subject}</p>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1 uppercase">
                            Category: {t.category} · Ref ID: {t.id}
                          </span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                          t.status === 'open' ? 'bg-amber-100 text-amber-805' : 'bg-emerald-100 text-emerald-805'
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
      )}

      {panelSection === "security" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-xs text-slate-705 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" /> Multi-Mode Security Gateway
            </h4>
            <button onClick={() => setPanelSection("index")} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer">
              Back
            </button>
          </div>

          <form onSubmit={handleSecurityForm} className="space-y-4">
            {securitySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-xl font-medium">
                🛡️ {securitySuccessMsg}
              </div>
            )}
            
            {securityErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-xl font-medium">
                ⚠️ {securityErrorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Verification Level Protocol</label>
              <select
                value={securityMode}
                onChange={(e) => setSecurityMode(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none font-bold"
              >
                <option value="bypass">🔓 Off / Password Only (Standard Mode)</option>
                <option value="sms">📱 SMS One-Time Password (MFA)</option>
                <option value="email">✉️ Email One-Time Password (MFA)</option>
                <option value="dual">🔐 Dual authentication (Both SMS + Email OTP)</option>
              </select>
              <p className="text-[8px] text-slate-400 leading-normal mt-1">
                Select your validation trigger event. When enabled, any access login or withdrawal will verify OTP tokens.
              </p>
            </div>

            {(securityMode === "sms" || securityMode === "dual") && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">GSM Cellular Network Operator</label>
                  <select
                    value={carrierGateway}
                    onChange={(e) => setCarrierGateway(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl outline-none font-bold text-emerald-800"
                  >
                    <option value="MTN">MTN Nigeria (sms.mymtn.com.ng)</option>
                    <option value="Airtel">Airtel Nigeria (sms.airtel.com.ng)</option>
                    <option value="Globacom">Glo Nigeria (sms.glo.com)</option>
                    <option value="9mobile">9mobile Nigeria (sms.9mobile.com.ng)</option>
                    <option value="T-Mobile">T-Mobile US (tmomail.net)</option>
                    <option value="Verizon">Verizon US (vtext.com)</option>
                    <option value="AT&T">AT&T US (txt.att.net)</option>
                    <option value="Global/Direct SMS">Global Direct SMTP Gateway</option>
                  </select>
                  <p className="text-[8px] text-slate-400 leading-normal mt-1">
                    Select your mobile network carrier for carrier-level SMS gateway authentication.
                  </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subscriber Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">+234</span>
                  <input
                    type="text"
                    placeholder="e.g. 8112223333"
                    required
                    value={securityPhone.replace(/^\+234/, "")}
                    onChange={(e) => setSecurityPhone("+234" + e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-12 pr-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs rounded-xl outline-none transition-all placeholder:text-slate-400 font-sans font-bold"
                  />
                </div>
              </div>
            </>
          )}

          {(securityMode === "email" || securityMode === "dual") && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Primary / Security Backup Email</label>
              <input
                type="email"
                placeholder="e.g. security-lock@gmail.com"
                required
                value={securityEmail}
                onChange={(e) => setSecurityEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs rounded-xl outline-none transition-all placeholder:text-slate-400 font-sans"
              />
              <p className="text-[8px] text-slate-400 leading-normal mt-1">
                One-time authentication passes will route directly to your designated email address.
              </p>
            </div>
          )}

            <button
              type="submit"
              disabled={isSavingSecurity}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingSecurity ? "Synchronizing secure protocols..." : "🔒 Save & Secure System Rules"}
            </button>
          </form>

          {/* GSM Live Network Handshake Terminal Tracer Component */}
          {securityMode !== "bypass" && (
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950 font-mono shadow-lg text-[9px] text-[#22c55e] p-3 space-y-2 mt-4 select-none">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-extrabold uppercase text-white tracking-wider text-[8px]">LIVE NETWORK CARRIER TRACER</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLatestOTPState}
                  className="text-[7px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition-all cursor-pointer font-bold"
                >
                  Refresh Logs
                </button>
              </div>

              {latestOTPInfo ? (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/15 font-mono">
                  <p className="text-white font-bold opacity-90 truncate">
                    Routing: [{latestOTPInfo.mode.toUpperCase()}] | Gateway: [{latestOTPInfo.gatewayAddress}]
                  </p>
                  {latestOTPInfo.handshakes && latestOTPInfo.handshakes.map((h: string, idx: number) => (
                    <p key={idx} className={h.includes("[FAIL]") || h.includes("[Warn]") ? "text-amber-400 font-mono break-all" : h.includes("[LIVE") ? "text-cyan-400 font-bold font-mono break-all" : "font-mono break-all"}>
                      &gt; {h}
                    </p>
                  ))}
                  <div className="pt-1.5 border-t border-white/5 flex justify-between items-center bg-emerald-950/20 p-1.5 rounded flex-wrap gap-1">
                    <span className="text-white font-bold text-[8px]">LATEST DISPATCHED OTP CODE:</span>
                    <span className="text-xs font-black bg-emerald-500 text-black px-2 py-0.5 rounded tracking-widest font-mono">{latestOTPInfo.code}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 font-bold space-y-1">
                  <p>NO ACTIVE DATA OR SECURE HANDSHAKES</p>
                  <p className="text-[7px] opacity-70 leading-normal">Activate Multi-Mode OTP and login / trigger an authentication event to view base transceiver cellular handshakes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
