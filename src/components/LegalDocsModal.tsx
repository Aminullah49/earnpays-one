import React, { useState } from "react";
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Scale, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  Smartphone, 
  Users, 
  AlertTriangle 
} from "lucide-react";

interface LegalDocsModalProps {
  initialTab: "privacy" | "terms";
  onClose: () => void;
}

export default function LegalDocsModal({ initialTab, onClose }: LegalDocsModalProps) {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === "privacy" ? privacyTextFull : termsTextFull;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Structured sections for quick jumping & highlighted searching
  const privacySections = [
    {
      id: "intro",
      title: "1. Scope & Core Identity",
      icon: <Users size={14} className="text-emerald-500" />,
      content: "This Privacy Statement governs the high-security fintech micro-task and digital rewards network operated by EarnPay Inc. ('us', 'we', or 'our') worldwide (with active localized processing operations across emerging markets including Nigeria, Kenya, Brazil, and India). We process personal metadata, payment ledger parameters, and anti-fraud telemetries strictly to facilitate authentic advertiser marketing postbacks and user income cashouts."
    },
    {
      id: "data-collection",
      title: "2. Personal & Verification Data We Collect",
      icon: <Smartphone size={14} className="text-cyan-500" />,
      content: "To guarantee verified, high-quality engagement for our advertisers and ensure secure payout transfers, we process the following data classes:\n\n• Profile Credentials: Legal Full Name, registered secure Email, and local Telephone contact numbers.\n• Financial Channels: Recipient Commercial Bank account details, active mobile airtime billing info, and virtual wallet sub-ledgers.\n• Verification Metrics: Registered IP addresses, browser agent profiles, operating system structures, and device fingerprints to verify that task completions are authentic.\n• OTP Security Traces: Standard temporal SMS transactional OTP payloads and SMTP login validations."
    },
    {
      id: "data-usage",
      title: "3. Information Usage & Security Protocols",
      icon: <ShieldCheck size={14} className="text-emerald-500" />,
      content: "All captured information is encrypted in transit and at rest. We utilize user profile datasets for:\n\n1. Validating account nodes and distributing real-time OTP checks via active SMTP email channels or verified SMS carrier networks.\n2. Auditing task screenshots and URL proof compliance metrics using our Gemini-driven AI Verification system.\n3. Processing immediate withdrawal settlements to target financial nodes.\n\nWe never sell your email addresses or private credentials to broker databases."
    },
    {
      id: "cookies",
      title: "4. State Retention & Cookies",
      icon: <Lock size={14} className="text-amber-500" />,
      content: "We store essential local preferences and secure authentication tokens in browser cookies and sandboxed files. This guarantees that your active membership session persists securely while preventing cross-device session hijacking."
    },
    {
      id: "deletion",
      title: "5. Right to Erasure & Account Termination",
      icon: <FileText size={14} className="text-rose-500" />,
      content: "Every registered user holds full control over their personal files and data. You may submit an official support ticket to request immediate deletion of your active account. Upon validation, all associated wallet balances, system logs, and personal bank details are permanently deleted from our active data stores within 72 hours."
    }
  ];

  const termsSections = [
    {
      id: "license",
      title: "1. Scope of Micro-Tasking & Client Licenses",
      icon: <Scale size={14} className="text-emerald-500" />,
      content: "EarnPay functions as an interactive multi-tiered digital micro-task market. By establishing an active user account, you are granted a non-exclusive, revocable, non-transferable license to complete brand surveys, social media promotions, app reviews, and target advertiser engagements. Fresh accounts start on our free-to-earn tier, with options to upgrade to premium membership levels at any time."
    },
    {
      id: "anti-bot",
      title: "2. Authenticity Guarantee & Real User Engagement",
      icon: <AlertTriangle size={14} className="text-rose-500" />,
      content: "To protect advertiser budgets, EarnPay enforces a strict, zero-tolerance policy against programmatic or automated activity. The use of virtual machine emulators, click bots, automated scripts, or browser macros is strictly forbidden. Every task submission is reviewed for authenticity by secure verification and validation systems. Violations trigger immediate account suspension and forfeiture of accumulated rewards."
    },
    {
      id: "subscriptions",
      title: "3. Membership Levels & Upgrade Terms",
      icon: <FileText size={14} className="text-cyan-500" />,
      content: "Users may opt to scale up their daily micro-task caps and withdrawal limit metrics by unlocking higher membership configurations (including Bronze, Silver, Gold, Platinum, Diamond, Sapphire, and Premium levels). Subscription rates are designated clearly in local currencies (e.g., NGN). Membership upgrades are final and provide immediate eligibility to the specified task categories. Fees are non-refundable once the term has commenced."
    },
    {
      id: "withdrawals",
      title: "4. Withdrawal Settlement & Escrow Controls",
      icon: <Smartphone size={14} className="text-emerald-500" />,
      content: "Withdrawals are subject to clear threshold regulations. Instant transfers are limited to the maximum daily withdrawal capacities specified for your current membership level. To combat money laundering and identity theft, the system may stage large single-batch payouts for manual compliance audit reviews up to 72 hours."
    },
    {
      id: "gateways",
      title: "5. Carrier Networks & SMTP dispatch disclaimer",
      icon: <Lock size={14} className="text-amber-500" />,
      content: "EarnPay triggers transaction-level verification using dual-mode security. Real OTP distributions utilize SMTP configurations or external telecommunication SMS relays (such as Twilio, Termii, or Mailgun). The carrier dispatch's uptime depends on external service provider networks, and we assume no liability for network latency originating from local carrier nodes."
    }
  ];

  const activeSections = activeTab === "privacy" ? privacySections : termsSections;

  // Flatten texts for clipboards
  const privacyTextFull = privacySections.map(s => `${s.title}\n${s.content}`).join("\n\n");
  const termsTextFull = termsSections.map(s => `${s.title}\n${s.content}`).join("\n\n");

  // Filtering based on search query
  const filteredSections = activeSections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-99 flex items-center justify-center p-4 text-left font-sans select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col h-[680px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black">
              EP
            </div>
            <span className="font-extrabold text-[11px] tracking-widest uppercase text-slate-200 font-mono">
              EarnPay Legal Compliance Node
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* TABS SELECTOR & SEARCH BAR */}
        <div className="bg-slate-900/50 p-4 border-b border-slate-850 space-y-3 shrink-0">
          <div className="flex justify-between items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("privacy");
                  setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-lg text-[10.5px] font-black uppercase transition-all tracking-wider cursor-pointer ${
                  activeTab === "privacy"
                    ? "bg-slate-800 text-white font-extrabold"
                    : "text-slate-450 hover:text-slate-205"
                }`}
              >
                🔒 Privacy Statement
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("terms");
                  setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-lg text-[10.5px] font-black uppercase transition-all tracking-wider cursor-pointer ${
                  activeTab === "terms"
                    ? "bg-slate-800 text-white font-extrabold"
                    : "text-slate-450 hover:text-slate-205"
                }`}
              >
                ⚖️ Terms of Operation
              </button>
            </div>

            {/* Print & Copy utilities */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                title="Copy full text"
                className="p-2 bg-slate-955 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500 animate-bounce" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handlePrint}
                title="Print documentation"
                className="p-2 bg-slate-955 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeTab === "privacy" ? "Privacy Statement" : "Terms of Operation"} clauses...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
        </div>

        {/* POLICY STATEMENT MARKDOWN SCROLLABLE VIEW */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Document Header Metadata */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
            <div className="space-y-1">
              <h2 className="text-xs font-black text-white uppercase tracking-wider">
                {activeTab === "privacy" ? "EarnPay Private Policy & Telemetry Security" : "Standard Terms of Operation Agreements"}
              </h2>
              <p className="text-[10px] text-slate-450">
                Effective: <span className="font-mono text-slate-350">June 2026</span> • Version: <span className="font-mono text-emerald-450 font-bold">EP-v4.7</span>
              </p>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-black max-w-fit uppercase tracking-widest font-mono shrink-0">
              Approved Ledger
            </span>
          </div>

          {/* Render Sections */}
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <div 
                key={section.id} 
                id={section.id} 
                className="space-y-2.5 pb-4 border-b border-slate-850/60 last:border-0"
              >
                <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  {section.icon} {section.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {section.content}
                </p>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              No clauses match your active query filters. Try a different term.
            </div>
          )}
        </div>

        {/* BOTTOM AKNOWLEDGEMENT ACTIONS */}
        <div className="bg-slate-950 px-6 py-4.5 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <p className="text-[9.5px] text-slate-500 text-center sm:text-left">
            By proceeding with registrations on EarnPay, you signify complete consent to this policy.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center shrink-0"
          >
            I Acknowledge & Accept
          </button>
        </div>

      </div>
    </div>
  );
}
