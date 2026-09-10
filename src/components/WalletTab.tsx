import React, { useState } from "react";
import { Wallet, Transaction, SavingGoal, User } from "../types";
import { 
  Send, Landmark, RefreshCw, Wallet as WalletIcon, 
  TrendingUp, ArrowDownLeft, ArrowUpRight, Check, X,
  FileText, Smartphone, Tv, Zap, ShieldCheck, Search, PlusCircle, AlertCircle, Loader,
  Copy, CreditCard, QrCode, PhoneCall, Building2, Globe, Coins, Lock
} from "lucide-react";
import { usePreferences } from "../context/PreferenceContext";


const NIGERIAN_BANKS = [
  "Moniepoint Microfinance Bank",
  "Moniepoint MFB",
  "Access Bank PLC",
  "United Bank for Africa (UBA)",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank PLC",
  "Opay Digital Services (OPay)",
  "PalmPay Microfinance Bank",
  "Kuda Microfinance Bank",
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

const BANK_USSD_CODES: Record<string, string> = {
  "Moniepoint Microfinance Bank": "*5573#",
  "Moniepoint MFB": "*5573#",
  "Access Bank PLC": "*901#",
  "United Bank for Africa (UBA)": "*919#",
  "Guaranty Trust Bank (GTBank)": "*737#",
  "Zenith Bank PLC": "*966#",
  "Opay Digital Services (OPay)": "*955#",
  "PalmPay Microfinance Bank": "*955#",
  "Kuda Microfinance Bank": "*894#",
  "First Bank of Nigeria": "*894#",
  "Union Bank of Nigeria": "*826#",
  "Fidelity Bank PLC": "*770#",
  "Wema Bank PLC": "*945#",
  "Stanbic IBTC Bank": "*909#",
  "Sterling Bank PLC": "*822#",
  "Ecobank Nigeria": "*326#",
  "Providus Bank PLC": "*5037#",
  "Keystone Bank Limited": "*833#",
  "Heritage Bank PLC": "*745#",
  "Jaiz Bank PLC": "*773#",
  "Taj Bank Limited": "*894#"
};

interface WalletTabProps {
  user: User;
  settings?: any;
  wallet: Wallet;
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  onTransferFunds: (recipientEmail: string, amount: number, pin: string) => Promise<{ success: boolean; error?: string }>;
  onBillPayment: (serviceType: string, providerName: string, targetDetails: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  onCreateSavings: (title: string, targetAmount: number) => Promise<void>;
  onDepositSavings: (goalId: string, amount: number) => Promise<void>;
  onWithdrawSavings: (goalId: string, amount: number) => Promise<void>;
  onWithdrawRequest: (amount: number, method: string, accountNo: string, bankName: string, usdtAddress: string, pin: string, country?: string, currency?: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh?: () => void;
}

export default function WalletTab({
  user, settings, wallet, transactions, savingGoals, 
  onTransferFunds, onBillPayment, onCreateSavings, onDepositSavings, onWithdrawSavings, onWithdrawRequest, onRefresh
}: WalletTabProps) {

  const [activeSubTab, setActiveSubTab] = useState<"history" | "transfer" | "bills" | "savings" | "payout" | "deposit">("history");

  // Deposit states
  const [depAmount, setDepAmount] = useState("");
  const [depCountry, setDepCountry] = useState("Nigeria");
  const [depMethod, setDepMethod] = useState("Future Wallet");
  const [depCurrency, setDepCurrency] = useState("NGN");
  const [depDetails, setDepDetails] = useState("");
  const [selectedDepositBank, setSelectedDepositBank] = useState("Guaranty Trust Bank (GTBank / Future Wallet)");
  const [depError, setDepError] = useState<string | null>(null);
  const [depSuccess, setDepSuccess] = useState<any | null>(null);
  const [pendingDeposit, setPendingDeposit] = useState<{
    reference: string;
    amount: number;
    currency: string;
    method: string;
    country: string;
    details?: string;
    authorizationUrl?: string | null;
  } | null>(null);
  const [isVerifyingDep, setIsVerifyingDep] = useState(false);
  const [verifyDepError, setVerifyDepError] = useState<string | null>(null);

  // Future Wallet interactive gateway channel states
  const [gatewayTab, setGatewayTab] = useState<"fw" | "card" | "transfer" | "ussd" | "crypto">("fw");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [cardOtp, setCardOtp] = useState("");
  const [selectedUssdBank, setSelectedUssdBank] = useState("gtbank");
  const [selectedCrypto, setSelectedCrypto] = useState("usdt_trc20");

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {}
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const DEPOSIT_BANKS: Record<string, { bankName: string; bankCode: string; accountNo: string; notes: string }> = {
    "Guaranty Trust Bank (GTBank / Future Wallet Node)": { bankName: "Guaranty Trust Bank (GTBank)", bankCode: "058", accountNo: "0812930491", notes: "Tier-3 Enterprise Clearance — Unrestricted transfers via Future Wallet Gateway" },
    "Access Bank PLC": { bankName: "Access Bank PLC", bankCode: "044", accountNo: "0782391023", notes: "Tier-3 Enterprise Clearing — Instant transfer" },
    "Providus Bank PLC": { bankName: "Providus Bank PLC", bankCode: "101", accountNo: "9928374615", notes: "Tier-3 Dedicated Clearing — No transfer limits" },
    "Moniepoint Microfinance Bank": { bankName: "Moniepoint Microfinance Bank", bankCode: "50515", accountNo: "5051289341", notes: "Real-time 24/7 instant settlement hub" },
    "United Bank for Africa (UBA)": { bankName: "United Bank for Africa (UBA)", bankCode: "033", accountNo: "2190384712", notes: "Instant bank transfer clearing" },
    "Zenith Bank PLC": { bankName: "Zenith Bank PLC", bankCode: "057", accountNo: "1019283746", notes: "Instant bank transfer clearing" },
    "Opay Digital Services (OPay)": { bankName: "Opay Digital Services (OPay)", bankCode: "999992", accountNo: "9928374102", notes: "Instant OPay wallet to bank transfer" },
    "PalmPay Microfinance Bank": { bankName: "PalmPay Microfinance Bank", bankCode: "999991", accountNo: "9012345678", notes: "Instant PalmPay transfer clearing" },
    "Kuda Microfinance Bank": { bankName: "Kuda Microfinance Bank", bankCode: "50211", accountNo: "2019283745", notes: "Instant zero-fee Kuda transfer clearing" },
    "First Bank of Nigeria": { bankName: "First Bank of Nigeria", bankCode: "011", accountNo: "3109283741", notes: "Instant bank transfer clearing" },
    "Wema Bank PLC (ALAT)": { bankName: "Wema Bank PLC", bankCode: "035", accountNo: "0219384756", notes: "Instant ALAT/Wema transfer clearing" },
    "Fidelity Bank PLC": { bankName: "Fidelity Bank PLC", bankCode: "070", accountNo: "5619283740", notes: "Instant bank transfer clearing" },
    "Sterling Bank PLC": { bankName: "Sterling Bank PLC", bankCode: "050", accountNo: "0081293847", notes: "Instant bank transfer clearing" },
    "Stanbic IBTC Bank": { bankName: "Stanbic IBTC Bank", bankCode: "039", accountNo: "9028374610", notes: "Instant bank transfer clearing" },
    "Ecobank Nigeria": { bankName: "Ecobank Nigeria", bankCode: "076", accountNo: "4019283746", notes: "Instant bank transfer clearing" },
    "Jaiz Bank PLC": { bankName: "Jaiz Bank PLC", bankCode: "301", accountNo: "3019283745", notes: "Instant bank transfer clearing" },
    "Taj Bank Limited": { bankName: "Taj Bank Limited", bankCode: "302", accountNo: "3029182736", notes: "Instant bank transfer clearing" }
  };

  // Transfer states
  const [recipientEmail, setRecipientEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPin, setTransferPin] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Bill payment states
  const [billService, setBillService] = useState<"Airtime" | "Data" | "Electricity" | "TV">("Airtime");
  const [billProvider, setBillProvider] = useState("MTN");
  const [targetNumber, setTargetNumber] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billError, setBillError] = useState<string | null>(null);
  const [billSuccess, setBillSuccess] = useState<any | null>(null);

  // Savings Goal states
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [savingsActionGoalId, setSavingsActionGoalId] = useState<string | null>(null);
  const [savingsDepositAmt, setSavingsDepositAmt] = useState("");
  const [savingsWithdrawAmt, setSavingsWithdrawAmt] = useState("");

  // Withdrawal Gateways states
  const [payoutMethod, setPayoutMethod] = useState<string>("Paystack Bank");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("Access Bank PLC");
  const [payoutAccountNo, setPayoutAccountNo] = useState("");
  const [payoutUSDTAddress, setPayoutUSDTAddress] = useState("");
  const [payoutCountry, setPayoutCountry] = useState("Nigeria");
  const [payoutCurrency, setPayoutCurrency] = useState("NGN");
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<any | null>(null);
  const [payoutPIN, setPayoutPIN] = useState("");

  // Searchable Bank state
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  // Bank Account verification states
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [bankVerificationError, setBankVerificationError] = useState<string | null>(null);
  const [bypassVerification, setBypassVerification] = useState(false);
  const [manualAccountName, setManualAccountName] = useState("");

  const BANK_CODES_LOOKUP: Record<string, string> = {
    "Moniepoint Microfinance Bank": "50515",
    "Moniepoint MFB": "50515",
    "Moniepoint": "50515",
    "Access Bank PLC": "044",
    "United Bank for Africa (UBA)": "033",
    "Guaranty Trust Bank (GTBank)": "058",
    "Zenith Bank PLC": "057",
    "Opay Digital Services (OPay)": "999992",
    "PalmPay Microfinance Bank": "999991",
    "Kuda Microfinance Bank": "50211",
    "First Bank of Nigeria": "011",
    "Union Bank of Nigeria": "032",
    "Fidelity Bank PLC": "070",
    "Wema Bank PLC": "035",
    "Stanbic IBTC Bank": "039",
    "Sterling Bank PLC": "050",
    "Ecobank Nigeria": "076",
    "Providus Bank PLC": "101",
    "Keystone Bank Limited": "082",
    "Heritage Bank PLC": "030",
    "Jaiz Bank PLC": "301",
    "Taj Bank Limited": "302"
  };

  React.useEffect(() => {
    const isCrypto = payoutMethod.includes("USDT") || payoutMethod.includes("Crypto") || payoutMethod.includes("Cryptocurr");
    if (isCrypto || payoutCountry !== "Nigeria") {
      setVerifiedAccountName("");
      setBankVerificationError(null);
      return;
    }

    if (payoutAccountNo.length !== 10) {
      setVerifiedAccountName("");
      setBankVerificationError(null);
      return;
    }

    let isMounted = true;
    const fetchAccountName = async () => {
      setIsVerifyingBank(true);
      setBankVerificationError(null);
      setVerifiedAccountName("");
      try {
        const code = BANK_CODES_LOOKUP[payoutBankName] || "";
        const res = await fetch(`/api/bank/resolve?accountNumber=${payoutAccountNo}&bankCode=${code}&bankName=${encodeURIComponent(payoutBankName)}`);
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && data.accountName) {
          setVerifiedAccountName(data.accountName);
        } else {
          setBankVerificationError(data.error || "Could not verify account name. Check details.");
        }
      } catch (err) {
        if (isMounted) {
          setBankVerificationError("Network error. Unable to verify account name.");
        }
      } finally {
        if (isMounted) {
          setIsVerifyingBank(false);
        }
      }
    };

    fetchAccountName();
    return () => {
      isMounted = false;
    };
  }, [payoutAccountNo, payoutBankName, payoutMethod, payoutCountry]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepError(null);
    setDepSuccess(null);
    setVerifyDepError(null);

    const amt = Number(depAmount);
    if (!depAmount || isNaN(amt) || amt <= 0) {
      setDepError("Please enter a valid deposit amount.");
      return;
    }

    const bankInfo = DEPOSIT_BANKS[selectedDepositBank] || { bankName: selectedDepositBank, accountNo: "8123456789", notes: "Instant clearing" };
    const mergedDetails = (depMethod === "Bank Transfer" || depMethod === "Future Wallet" || depMethod === "USSD")
      ? `Bank: ${bankInfo.bankName} (Acc: ${bankInfo.accountNo})${depDetails ? ' - ' + depDetails : ''}`
      : depDetails;

    try {
      const response = await fetch("/api/user/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          country: depCountry,
          method: depMethod,
          currency: depCurrency,
          details: mergedDetails
        })
      });
      const data = await response.json();
      if (data.error) {
        setDepError(data.error);
      } else if (data.success && data.reference) {
        setPendingDeposit({
          reference: data.reference,
          amount: amt,
          currency: depCurrency,
          method: depMethod,
          country: depCountry,
          details: mergedDetails,
          authorizationUrl: data.authorizationUrl
        });
        setDepAmount("");
        setDepDetails("");
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      setDepError("Deposit processing error. Please try again.");
    }
  };

  const handleVerifyDeposit = async (refToVerify?: string) => {
    const targetRef = refToVerify || pendingDeposit?.reference;
    if (!targetRef) return;

    setIsVerifyingDep(true);
    setVerifyDepError(null);
    try {
      const response = await fetch("/api/user/deposit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: targetRef })
      });
      const data = await response.json();
      if (data.verified && data.status === "completed") {
        setDepSuccess({
          amount: data.amount || pendingDeposit?.amount,
          currency: data.currency || pendingDeposit?.currency || "NGN",
          method: pendingDeposit?.method || "Deposit Gateway",
          country: pendingDeposit?.country || "Nigeria",
          reference: data.reference || targetRef
        });
        setPendingDeposit(null);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setVerifyDepError(data.error || "Payment not confirmed yet. Please verify you completed the transfer and try again.");
      }
    } catch (err) {
      setVerifyDepError("Network error verifying deposit. Please try again.");
    } finally {
      setIsVerifyingDep(false);
    }
  };

  const { fmt, t } = usePreferences();

  // Handle Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(false);

    if (!recipientEmail || !transferAmount || !transferPin) {
      setTransferError("All fields are required. Please input transfer PIN.");
      return;
    }

    if (transferPin.length < 4) {
      setTransferError("Transaction security PIN must be at least 4 digits.");
      return;
    }

    const res = await onTransferFunds(recipientEmail, Number(transferAmount), transferPin);
    if (!res.success) {
      setTransferError(res.error || "Transfer failed");
    } else {
      setTransferSuccess(true);
      setRecipientEmail("");
      setTransferAmount("");
      setTransferPin("");
    }
  };

  // Handle Bill Utility
  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillError(null);
    setBillSuccess(null);

    const amt = Number(billAmount);
    if (!targetNumber || !billAmount || amt <= 0) {
      setBillError("Please fill complete details with a positive amount NGN.");
      return;
    }

    const res = await onBillPayment(billService, billProvider, targetNumber, amt);
    if (res.success) {
      setBillSuccess({
        service: billService,
        provider: billProvider,
        target: targetNumber,
        amount: amt,
        cashback: Math.floor(amt * 0.03)
      });
      setTargetNumber("");
      setBillAmount("");
    } else {
      setBillError(res.error || "Bill transaction failed.");
    }
  };

  // Handle Savings creation
  const handleSavingsCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || Number(newGoalTarget) <= 0) return;
    await onCreateSavings(newGoalTitle, Number(newGoalTarget));
    setNewGoalTitle("");
    setNewGoalTarget("");
  };

  // Handle Withdrawal payout
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutSuccess(null);

    const amt = Number(payoutAmount);
    if (!payoutAmount || amt <= 0) {
      setPayoutError("Please enter a valid withdrawal amount.");
      return;
    }

    const isCrypto = payoutMethod.includes("USDT") || payoutMethod.includes("Crypto") || payoutMethod.includes("Cryptocurr");

    if (!isCrypto && payoutCountry === "Nigeria" && (!payoutAccountNo || payoutAccountNo.length < 10)) {
      setPayoutError("Please provide a valid 10-digit NUBAN Nigerian Bank Account number.");
      return;
    }

    if (!isCrypto && payoutCountry === "Nigeria" && !verifiedAccountName && !bypassVerification) {
      setPayoutError(bankVerificationError || "Please wait for your Nigerian bank account number to be successfully verified before submitting.");
      return;
    }

    if (!isCrypto && payoutCountry !== "Nigeria" && !payoutAccountNo) {
      setPayoutError("Please provide a valid Bank Account or Card number for withdrawal payout.");
      return;
    }

    if (isCrypto && !payoutUSDTAddress) {
      setPayoutError("Please provide a valid Cryptocurrency wallet address.");
      return;
    }

    if (!payoutPIN || payoutPIN.length < 4) {
      setPayoutError("Please enter your 4-digit transaction Security PIN.");
      return;
    }

    const res = await onWithdrawRequest(
      amt, 
      payoutMethod, 
      payoutAccountNo, 
      payoutBankName, 
      payoutUSDTAddress,
      payoutPIN,
      payoutCountry,
      payoutCurrency
    );

    if (res.success) {
      setPayoutSuccess({
        amount: amt,
        method: payoutMethod,
        ref: "WD-PENDING"
      });
      setPayoutAmount("");
      setPayoutAccountNo("");
      setPayoutUSDTAddress("");
      setPayoutPIN("");
    } else {
      setPayoutError(res.error || "Withdrawal request declined.");
    }
  };

  const PROVIDERS = {
    Airtime: ["MTN", "Airtel", "Glo", "9mobile"],
    Data: ["MTN", "Airtel", "Glo", "9mobile"],
    Electricity: ["Ikeja Electric", "Eko Electric", "AEDC Abuja", "KEDCO Kano"],
    TV: ["DSTV Nigeria", "GOTV Nigeria", "Startimes"]
  };

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto px-4 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Balances Board card summary */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 mt-3 relative overflow-hidden">
        <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
            <WalletIcon size={12} className="text-emerald-500" />
            <span>Core EarnPay Wallet Accounts</span>
          </div>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
            ACTIVE NGN
          </span>
        </div>

        <div className="pt-3 flex justify-between items-end">
          <div>
            <span className="text-[10px] text-slate-400">Main Available Profit Balance</span>
            <p className="text-2xl font-black mt-0.5 text-emerald-500 font-sans">{fmt(wallet.available)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Bonus Accumulations</span>
            <p className="text-[13px] font-extrabold text-amber-500 mt-0.5 font-sans">{fmt(wallet.bonus)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-3.5 border-t border-white/5 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9px]">Referred Earnings:</span>
            <span className="font-extrabold block text-slate-100">{fmt(wallet.referral)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[9px]">Sponsor Pending Holding:</span>
            <span className="font-extrabold block text-slate-100">{fmt(wallet.pending)}</span>
          </div>
        </div>
      </div>

      {/* 2. Horizontal SubTabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrolls-none">
        {[
          { tab: "deposit", label: "Fund Wallet" },
          { tab: "history", label: "Statements" },
          { tab: "payout", label: "Withdrawal" },
          { tab: "transfer", label: "P2P Send" },
          { tab: "bills", label: "Bill Utilities" },
          { tab: "savings", label: "Savings Vault" }
        ].map(cat => (
          <button
            key={cat.tab}
            onClick={() => {
              setActiveSubTab(cat.tab as any);
              setTransferError(null);
              setTransferSuccess(false);
              setBillError(null);
              setBillSuccess(null);
              setPayoutError(null);
              setPayoutSuccess(null);
              setDepError(null);
              setDepSuccess(null);
            }}
            className={`px-3 py-2 text-[10px] font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeSubTab === cat.tab 
                ? "border-emerald-600 text-emerald-700 font-black" 
                : "border-transparent text-slate-400 hover:text-slate-750"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. SubTab Body Panels */}
      
      {/* DEPOSIT FUNDS SUBTAB */}
      {activeSubTab === "deposit" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
              <PlusCircle size={13} className="text-emerald-600" /> Fund Your Core Wallet
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Load capital balance or wallet reserves instantly. Supports Future Wallet, credit/debit cards, local bank transfers, USSD quick dialing codes, and major cryptocurrencies globally.
            </p>
          </div>

          {/* NO KYC REQUIRED PROMINENT BANNER */}
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-950 rounded-2xl flex items-center justify-between gap-2 text-[10.5px] shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold text-emerald-900 block text-xs">
                  🟢 No KYC Verification Required to Deposit
                </span>
                <span className="text-[10px] text-emerald-800 leading-tight block font-medium">
                  All users (including unverified & new accounts) can deposit and fund their wallets instantly without completing KYC or uploading ID documents!
                </span>
              </div>
            </div>
            <span className="bg-emerald-600 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
              KYC Free
            </span>
          </div>

          {depSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-930 rounded-xl space-y-2 text-center text-xs">
              <div className="h-8 w-8 bg-emerald-200 text-emerald-805 rounded-full flex items-center justify-center font-bold mx-auto">
                ✓
              </div>
              <h5 className="font-bold text-emerald-800 text-sm">Wallet Funded Successfully!</h5>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-sans">
                Transaction <span className="font-bold font-mono">{depSuccess.reference}</span> has been verified & confirmed. You deposited <span className="font-bold">{depSuccess.currency} {depSuccess.amount?.toLocaleString()}</span> via {depSuccess.method}.
              </p>
              <button 
                onClick={() => {
                  setDepSuccess(null);
                  setPendingDeposit(null);
                }}
                className="mt-2 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Make another deposit
              </button>
            </div>
          ) : pendingDeposit ? (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 text-xs shadow-xl border border-slate-800">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600/30 text-indigo-400 rounded-lg border border-indigo-500/30">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h5 className="font-black text-white text-xs tracking-wide flex items-center gap-1.5">
                      FUTURE WALLET PAYMENT GATEWAY
                    </h5>
                    <p className="text-[9.5px] text-slate-400 font-medium">Multi-Channel Instant Settlement Engine</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                  Active Terminal
                </span>
              </div>

              {/* Amount & Reference Details Banner */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Transaction Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded text-xs select-all border border-slate-800">
                      {pendingDeposit.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pendingDeposit.reference)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-700/60 rounded cursor-pointer transition-colors"
                      title="Copy Reference"
                    >
                      {copiedText === pendingDeposit.reference ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Amount to Pay:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {pendingDeposit.currency} {pendingDeposit.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Channel Selection Tabs */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Select Preferred Funding Channel:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {[
                    { id: "fw", label: "FW Direct", icon: Globe },
                    { id: "card", label: "Card Pay", icon: CreditCard },
                    { id: "transfer", label: "Bank Transfer", icon: Building2 },
                    { id: "ussd", label: "USSD Dial", icon: PhoneCall },
                    { id: "crypto", label: "Crypto Pay", icon: Coins }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = gatewayTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGatewayTab(tab.id as any)}
                        className={`py-2 px-1.5 rounded-lg text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md border border-indigo-400/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon size={14} />
                        <span className="truncate max-w-full text-[9px]">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel Specific Panel */}
              <div className="bg-slate-800/60 border border-slate-700 p-3.5 rounded-xl space-y-3">
                {gatewayTab === "fw" && (
                  <div className="space-y-2.5 text-[10.5px] text-slate-300">
                    <div className="flex items-center justify-between text-white font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <Globe size={14} className="text-indigo-400" />
                        Future Wallet Instant Settlement
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">Zero Charges</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Pay instantly using your Future Wallet merchant node or connected digital wallet reserve. Settlement is validated in real-time.
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Account Tag:</span>
                        <span className="font-mono text-white font-bold">{user?.email || "EarnPay User"}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Payment Gateway ID:</span>
                        <span className="font-mono text-indigo-300 font-bold">FW-NODE-2026-901</span>
                      </div>
                    </div>
                  </div>
                )}

                {gatewayTab === "card" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-white font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-indigo-400" />
                        Credit / Debit Card Checkout
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Visa / MasterCard / Verve</span>
                    </div>
                    
                    <div className="space-y-2 text-[10px]">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={user?.name || "Cardholder Name"}
                          readOnly
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="5399 4100 8829 1042"
                          maxLength={19}
                          value={cardNum}
                          onChange={(e) => setCardNum(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 font-bold block mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold block mb-1">CVV Code</label>
                          <input
                            type="password"
                            placeholder="389"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gatewayTab === "transfer" && (
                  <div className="space-y-2.5 text-[10.5px]">
                    <div className="flex items-center justify-between text-white font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-indigo-400" />
                        Dedicated Virtual Bank Account
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">24/7 Auto Credit</span>
                    </div>
                    
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-[10px]">Bank Name:</span>
                        <span className="font-extrabold text-white text-xs">{selectedDepositBank}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-bold text-[10px]">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                            {(DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Guaranty Trust Bank (GTBank / Future Wallet Node)"]).accountNo}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard((DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Guaranty Trust Bank (GTBank / Future Wallet Node)"]).accountNo)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedText === (DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Guaranty Trust Bank (GTBank / Future Wallet Node)"]).accountNo ? (
                              <Check size={11} className="text-emerald-300" />
                            ) : (
                              <Copy size={11} />
                            )}
                            <span>{copiedText === (DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Guaranty Trust Bank (GTBank / Future Wallet Node)"]).accountNo ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 font-bold">Beneficiary Name:</span>
                        <span className="font-bold text-slate-200">EarnPay / Future Wallet Gateway</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-snug">
                      Send exact payment of <strong>{pendingDeposit.currency} {pendingDeposit.amount.toLocaleString()}</strong> to the account above via any bank app or mobile USSD.
                    </p>
                  </div>
                )}

                {gatewayTab === "ussd" && (
                  <div className="space-y-2.5 text-[10.5px]">
                    <div className="flex items-center justify-between text-white font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <PhoneCall size={14} className="text-indigo-400" />
                        USSD Dial Code Generator
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Instant Mobile Dialing</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-slate-400 font-bold text-[10px] block">Select Your Bank for USSD Code:</label>
                      <select
                        value={selectedUssdBank}
                        onChange={(e) => setSelectedUssdBank(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs outline-none cursor-pointer"
                      >
                        <option value="gtbank">GTBank (*737*)</option>
                        <option value="zenith">Zenith Bank (*966*)</option>
                        <option value="access">Access Bank (*901*)</option>
                        <option value="uba">UBA (*919*)</option>
                        <option value="firstbank">FirstBank (*894*)</option>
                        <option value="sterling">Sterling Bank (*822*)</option>
                      </select>
                    </div>

                    {(() => {
                      const ussdCodes: Record<string, string> = {
                        gtbank: `*737*50*${pendingDeposit.amount}*${(DEPOSIT_BANKS["Guaranty Trust Bank (GTBank / Future Wallet Node)"]).accountNo}#`,
                        zenith: `*966*50*${pendingDeposit.amount}#`,
                        access: `*901*50*${pendingDeposit.amount}#`,
                        uba: `*919*50*${pendingDeposit.amount}#`,
                        firstbank: `*894*50*${pendingDeposit.amount}#`,
                        sterling: `*822*50*${pendingDeposit.amount}#`
                      };
                      const code = ussdCodes[selectedUssdBank] || ussdCodes.gtbank;
                      return (
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Generated USSD String:</p>
                          <p className="font-mono font-black text-amber-300 text-sm tracking-wider bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {code}
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(code)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedText === code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              <span>{copiedText === code ? "Code Copied" : "Copy USSD"}</span>
                            </button>
                            <a
                              href={`tel:${encodeURIComponent(code)}`}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <PhoneCall size={12} />
                              <span>Dial Directly</span>
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {gatewayTab === "crypto" && (
                  <div className="space-y-2.5 text-[10.5px]">
                    <div className="flex items-center justify-between text-white font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <Coins size={14} className="text-indigo-400" />
                        Cryptocurrency Checkout Node
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">TRC-20 / BEP-20 / BTC</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-slate-400 font-bold text-[10px] block">Select Crypto Asset:</label>
                      <select
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs outline-none cursor-pointer"
                      >
                        <option value="usdt_trc20">USDT (TRC-20 Network)</option>
                        <option value="usdt_bep20">USDT (BEP-20 Network)</option>
                        <option value="btc">Bitcoin (BTC Network)</option>
                      </select>
                    </div>

                    {(() => {
                      const cryptoMap: Record<string, { address: string; equiv: string }> = {
                        usdt_trc20: { address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", equiv: `${(pendingDeposit.amount / 1500).toFixed(2)} USDT` },
                        usdt_bep20: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", equiv: `${(pendingDeposit.amount / 1500).toFixed(2)} USDT` },
                        btc: { address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", equiv: `${(pendingDeposit.amount / 150000000).toFixed(6)} BTC` }
                      };
                      const currCrypto = cryptoMap[selectedCrypto] || cryptoMap.usdt_trc20;
                      return (
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold">Equivalent Amount:</span>
                            <span className="font-black text-amber-300 text-xs">{currCrypto.equiv}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold text-[10px]">Deposit Wallet Address:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-white bg-slate-950 p-2 rounded-lg border border-slate-800 break-all select-all flex-1">
                                {currCrypto.address}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(currCrypto.address)}
                                className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedText === currCrypto.address ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                                <span>{copiedText === currCrypto.address ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Verify & Action Buttons */}
              {verifyDepError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-[10px] rounded-xl flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} className="shrink-0 text-rose-400" />
                  <span>{verifyDepError}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleVerifyDeposit()}
                  disabled={isVerifyingDep}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {isVerifyingDep ? (
                    <>
                      <Loader size={14} className="animate-spin text-white" />
                      <span>Validating & Verifying Settlement Status...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Complete Payment & Credit Wallet Balance</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingDeposit(null);
                    setVerifyDepError(null);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10.5px] rounded-xl border border-slate-700 cursor-pointer transition-colors"
                >
                  Cancel / Start Over
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="space-y-3">
              {depError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-lg flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{depError}</span>
                </div>
              )}

              {/* Country Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Resident Country</label>
                <select
                  value={depCountry}
                  onChange={(e) => {
                    const cnt = e.target.value;
                    setDepCountry(cnt);
                    const currs: Record<string, string> = {
                      "Nigeria": "NGN",
                      "Ghana": "GHS",
                      "Kenya": "KES",
                      "South Africa": "ZAR",
                      "United Kingdom": "GBP",
                      "United States": "USD",
                      "Others": "USD"
                    };
                    setDepCurrency(currs[cnt] || "USD");
                  }}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans cursor-pointer font-bold"
                >
                  <option value="Nigeria">🇳🇬 Nigeria</option>
                  <option value="Ghana">🇬🇭 Ghana</option>
                  <option value="Kenya">🇰🇪 Kenya</option>
                  <option value="South Africa">🇿🇦 South Africa</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Others">🌐 International / Other Countries</option>
                </select>
              </div>

              {/* Method Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Option Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "Future Wallet", label: "Future Wallet (All-In-One)", icon: "🌐" },
                    { value: "Card", label: "Credit/Debit Card", icon: "💳" },
                    { value: "Bank Transfer", label: "Bank Transfer", icon: "🏦" },
                    { value: "USSD", label: "USSD Code", icon: "🔢" },
                    { value: "Cryptocurrency", label: "Cryptocurrency (USDT/BTC)", icon: "🪙" },
                    ...(settings?.customPaymentGateways || [])
                      .filter((cg: any) => cg.name && cg.name !== "Future Wallet")
                      .map((cg: any) => ({
                        value: cg.name,
                        label: `${cg.name} Gateway`,
                        icon: "🔌"
                      }))
                  ].map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDepMethod(item.value)}
                      className={`p-2.5 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        depMethod === item.value 
                          ? "bg-emerald-600 border-emerald-650 text-white shadow-3xs font-extrabold" 
                          : "bg-slate-50 border-slate-205 text-slate-500 hover:bg-slate-100 font-semibold"
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-[8.5px] uppercase tracking-wider">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Selection Dropdown when Transfer or USSD is chosen */}
              {(depMethod === "Bank Transfer" || depMethod === "USSD") && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Choose Settlement / Receiving Bank</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold">Instant Clearance</span>
                  </label>
                  <select
                    value={selectedDepositBank}
                    onChange={(e) => setSelectedDepositBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans font-extrabold cursor-pointer text-slate-800"
                  >
                    {Object.keys(DEPOSIT_BANKS).map(bName => (
                      <option key={bName} value={bName}>
                        🏦 {bName}
                      </option>
                    ))}
                  </select>

                  {/* Helpful KYC Bypass Notice for OPay / PalmPay / Kuda transfers */}
                  <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 text-emerald-950 rounded-xl space-y-1 text-[10px] mt-1.5">
                    <div className="flex items-center gap-1 font-bold text-emerald-900">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span>Transferring from OPay, PalmPay, or Kuda?</span>
                    </div>
                    <p className="text-[9.5px] text-emerald-800 leading-snug">
                      If your mobile app displays <em>"Account unavailable - Recipient's KYC verification incomplete"</em> on Moniepoint, select <strong>Guaranty Trust Bank (GTBank / Future Wallet Node)</strong> or <strong>Access Bank PLC</strong> above! They are Tier-3 enterprise verified and accept instant transfers from all apps without KYC limits.
                    </p>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Deposit Amount ({depCurrency})
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">
                    {depCurrency}
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans font-extrabold"
                  />
                </div>
              </div>

              {/* Dynamic instruction box based on method selection */}
              {depMethod === "Future Wallet" && (
                <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-2 text-[10px] text-indigo-950">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-[11px] text-indigo-900">🌐 Future Wallet All-In-One Gateway:</p>
                    <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 font-extrabold text-[8.5px] rounded-full uppercase">Primary Active Gateway</span>
                  </div>
                  <p className="text-[9.5px] text-indigo-800 leading-snug">
                    Future Wallet securely processes payments across <strong>Credit/Debit Cards, Direct Bank Transfers, USSD Dials, and Crypto (USDT/BTC)</strong>. Fast automated balance crediting via webhooks.
                  </p>
                  <div className="p-2.5 bg-white border border-indigo-150 rounded-lg space-y-1.5">
                    <p className="font-bold text-[10.5px] text-indigo-950">Supported Future Wallet Channels:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] font-semibold text-slate-700">
                      <span className="p-1 bg-indigo-50/70 border border-indigo-100 rounded flex items-center gap-1">💳 Cards (Visa/Mastercard)</span>
                      <span className="p-1 bg-indigo-50/70 border border-indigo-100 rounded flex items-center gap-1">🏦 Direct Bank Transfers</span>
                      <span className="p-1 bg-indigo-50/70 border border-indigo-100 rounded flex items-center gap-1">🔢 Instant USSD Codes</span>
                      <span className="p-1 bg-indigo-50/70 border border-indigo-100 rounded flex items-center gap-1">🪙 Crypto (USDT / BTC)</span>
                    </div>
                    <p className="text-[8.5px] text-slate-500 mt-1">
                      Click <strong>Proceed to Deposit</strong> below to launch your Future Wallet checkout portal!
                    </p>
                  </div>
                </div>
              )}
              {depMethod === "Card" && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">🔒 Secure Multi-Country Card Processor:</p>
                  <input
                    type="text"
                    placeholder="16-Digit Card Number"
                    maxLength={19}
                    className="w-full p-1.5 bg-white text-xs border border-slate-200 rounded outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="p-1.5 bg-white text-xs border border-slate-200 rounded outline-none text-center"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={3}
                      className="p-1.5 bg-white text-xs border border-slate-200 rounded outline-none text-center"
                    />
                  </div>
                </div>
              )}

              {depMethod === "Bank Transfer" && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">🏦 Direct Transfer Settlement Node ({selectedDepositBank}):</p>
                  <p>Transfer the exact amount to the dedicated clearing bank account below:</p>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-center space-y-1 text-xs text-slate-850 shadow-2xs">
                    <p className="font-bold text-slate-900">{selectedDepositBank}</p>
                    <p className="font-black text-sm text-emerald-700 tracking-wider">
                      {(DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Moniepoint Microfinance Bank"]).accountNo}
                    </p>
                    <p className="text-[10px] text-slate-600 font-sans font-semibold">
                      Account Name: EarnPay Deposit / {user?.name || "Valued User"}
                    </p>
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-medium">
                    {(DEPOSIT_BANKS[selectedDepositBank] || DEPOSIT_BANKS["Moniepoint Microfinance Bank"]).notes}
                  </p>
                </div>
              )}

              {depMethod === "USSD" && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">🔢 USSD Quick Portal Clearing Codes:</p>
                  <p>Choose your bank USSD speed route dials:</p>
                  <select
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                    value={depDetails}
                    onChange={(e) => setDepDetails(e.target.value)}
                  >
                    <option value="">-- Choose USSD Dial Routing --</option>
                    <option value="GTBank *737#">Guaranty Trust Bank (*737#)</option>
                    <option value="Access Bank *901#">Access Bank (*901#)</option>
                    <option value="UBA *919#">United Bank for Africa (*919#)</option>
                    <option value="Zenith *966#">Zenith Bank (*966#)</option>
                  </select>
                  {depDetails && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded text-center text-xs font-bold">
                      Click deposit then dial {depDetails.split(" ")[1]} on your phone!
                    </div>
                  )}
                </div>
              )}

              {depMethod === "Cryptocurrency" && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">🪙 Automated Multi-Currency Crypto Gateway:</p>
                  <p>Send the equivalent USDT TRC-20 or BTC values to the secure hot wallet address:</p>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-center select-all cursor-pointer text-[10px] text-emerald-700 font-extrabold break-all">
                    TY9188djjHshDnw812uHjshfNsh
                  </div>
                  <p className="text-[8.5px] text-amber-600 font-bold">⚠️ Send only USDT TRC-20 token assets. Transactions are scanned and automatically cleared after 1 network block approval.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-xl shadow-3xs cursor-pointer transition-colors"
              >
                Initiate Instant Wallet Deposit
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 1: TRANSACTIONS HISTORY STATEMENTS */}
      {activeSubTab === "history" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wide">Historical statement log</h4>
            <span className="text-[9px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-sm">Official receipts</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-150 rounded-2xl text-xs text-slate-400">
              No registered financial statements.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-3xs">
              {transactions.map((tx) => {
                const add = tx.type.includes('bonus') || tx.type.includes('earning') || tx.type.includes('receive') || tx.type.includes('deposit') || tx.type.includes('savings_withdraw');
                return (
                  <div key={tx.id} className="p-3.5 hover:bg-slate-50/50 transition-colors flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg text-xs ${add ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-650'}`}>
                        {add ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} · {tx.reference}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black ${add ? 'text-emerald-700' : 'text-slate-800'} font-sans`}>
                        {add ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                      <span className="text-[8px] font-bold bg-slate-150 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest mt-0.5 inline-block">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Peer-to-Peer Wallet Transfer */}
      {activeSubTab === "transfer" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
              <Send size={12} className="text-emerald-600" /> Send Instant peer wage transfer
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Transfer rewards securely. Send NGN balance values instantly to any other registered user's email wallet directly.
            </p>
          </div>

          {transferSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl text-center space-y-2">
              <div className="h-9 w-9 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-lg mx-auto font-bold">
                ✓
              </div>
              <h5 className="font-bold text-xs">Transfer Transacted Successfully!</h5>
              <p className="text-[10px] leading-relaxed opacity-80">
                Balances have been synced with receiver. Check statements under "Statements" tab to fetch receipt details.
              </p>
              <button 
                onClick={() => setTransferSuccess(false)}
                className="mt-2 py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                Send Another Transfer
              </button>
            </div>
          ) : (
            <form onSubmit={handleTransferSubmit} className="space-y-3">
              {transferError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-lg flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Beneficiary EarnPay Email</label>
                <input
                  type="email"
                  placeholder="e.g. receiver@earnpay.ng"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Transfer Value (₦ NGN)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Security Transaction PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="4-digit PIN required"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 font-sans"
                />
                {!user.pinSet && (
                  <p className="text-[9px] text-amber-600 font-semibold mt-1">
                    ⚠️ You haven't configured a custom transaction PIN yet! Try any code to configure immediately.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-1"
              >
                Send Balance P2P
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 3: Digital Bill Utility Services with Cashback */}
      {activeSubTab === "bills" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
              <Smartphone size={13} className="text-emerald-600" /> Utility Bill Payments
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Procure phone data bundles or settle electricity grids and subscription TVs instantly. Every transaction claims an instant **3% cashback voucher rebate** back to profit main pocket!
            </p>
          </div>

          {billSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl space-y-2.5 text-xs">
              <div className="h-8 w-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm mx-auto">
                ✓
              </div>
              <h5 className="font-bold text-center">Receipt Issued Successfully!</h5>
              <div className="space-y-1 border-t border-emerald-200 pt-2 text-[11px] font-sans">
                <p><span className="text-slate-500">Service:</span> {billSuccess.service} ({billSuccess.provider})</p>
                <p><span className="text-slate-500">Target Address/No:</span> {billSuccess.target}</p>
                <p><span className="text-slate-500">Value Paid:</span> ₦{billSuccess.amount}</p>
                <p className="font-bold text-emerald-700"><span className="text-slate-500">Loyalty Cashback Earned (3%):</span> +₦{billSuccess.cashback}</p>
              </div>
              <button 
                onClick={() => setBillSuccess(null)}
                className="w-full mt-1.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
              >
                Purchase another service
              </button>
            </div>
          ) : (
            <form onSubmit={handleBillSubmit} className="space-y-3">
              {billError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-lg">
                  {billError}
                </div>
              )}

              {/* Service Grid Selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: "Airtime", label: "Airtime", icon: "📱" },
                  { value: "Data", label: "Data", icon: "📶" },
                  { value: "Electricity", label: "Power", icon: "⚡" },
                  { value: "TV", label: "Decoder", icon: "📺" }
                ].map(srv => (
                  <button
                    key={srv.value}
                    type="button"
                    onClick={() => {
                      setBillService(srv.value as any);
                      setBillProvider(PROVIDERS[srv.value as any][0]);
                    }}
                    className={`p-2 rounded-xl text-center border cursor-pointer transition-all ${
                      billService === srv.value 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm">{srv.icon}</p>
                    <p className="text-[8px] font-bold mt-1 uppercase tracking-wide">{srv.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Provider Network</label>
                <select
                  value={billProvider}
                  onChange={(e) => setBillProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-605 text-xs rounded-xl bg-slate-50 outline-none font-semibold cursor-pointer"
                >
                  {(PROVIDERS[billService] || []).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {billService === "Airtime" || billService === "Data" ? "Recipient Phone Number" : "Decoder / Meter ID Number"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08123456789 or 291830219"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-650 outline-none transition-all placeholder:text-slate-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Amount (₦ NGN)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-650 outline-none transition-all placeholder:text-slate-400 font-sans"
                />
                {(() => {
                  const cashbackPercent = settings?.vtuCashbackPercent !== undefined ? settings.vtuCashbackPercent : 3;
                  let dataRate = 250;
                  if (billProvider === "MTN") dataRate = settings?.vtuDataPriceMTN !== undefined ? settings.vtuDataPriceMTN : 250;
                  else if (billProvider === "Airtel") dataRate = settings?.vtuDataPriceAirtel !== undefined ? settings.vtuDataPriceAirtel : 260;
                  else if (billProvider === "Glo") dataRate = settings?.vtuDataPriceGlo !== undefined ? settings.vtuDataPriceGlo : 230;
                  else if (billProvider === "9mobile") dataRate = settings?.vtuDataPrice9mobile !== undefined ? settings.vtuDataPrice9mobile : 280;

                  if (billService === "Data") {
                    return (
                      <p className="text-[10px] text-slate-500 font-medium">
                        💡 Active {billProvider} Data Rate: <span className="text-emerald-600 font-bold">₦{dataRate}/GB</span>. 
                        {billAmount && Number(billAmount) > 0 && (
                          <span> You will buy approximately <span className="font-bold">{(Number(billAmount) / dataRate).toFixed(2)} GB</span>.</span>
                        )}
                      </p>
                    );
                  }
                  if (billService === "Airtime") {
                    return (
                      <p className="text-[10px] text-slate-500 font-medium">
                        💡 Airtime reward: You will claim <span className="text-teal-600 font-bold">{cashbackPercent}% Cashback</span> (₦{Math.floor(Number(billAmount || 0) * (cashbackPercent / 100))} NGN rebate instantly back to your pocket).
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Execute Bill payment ({settings?.vtuCashbackPercent !== undefined ? settings.vtuCashbackPercent : 3}% CashBack)
              </button>
            </form>
          )}

        </div>
      )}

      {/* SUBTAB 4: SAVINGS VAULTS (Business Fund, Laptop Fund etc) */}
      {activeSubTab === "savings" && (
        <div className="space-y-4">
          
          {/* Goal creator form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-3.5">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
              🏦 Build high-target Savings Goal Vaults
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Create separated allocations toward business startups, education fees, or electronics. Zero returns are guaranteed; this serves strictly as a safe compartmentalized storage wallet within EarnPay.
            </p>

            <form onSubmit={handleSavingsCreate} className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Vault goal name (e.g. New Laptop)"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl focus:border-emerald-600 text-xs outline-none transition-all"
              />
              <input
                type="number"
                placeholder="Target Amount (₦)"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl focus:border-emerald-600 text-xs outline-none transition-all font-sans"
              />
              <button
                type="submit"
                className="col-span-2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black rounded-xl cursor-pointer uppercase tracking-wider transition-colors"
              >
                Create Target Vault
              </button>
            </form>
          </div>

          {/* List of goals */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-xs text-slate-700 px-0.5">Active separated vaults</h5>
            {savingGoals.length === 0 ? (
              <p className="text-center bg-white border border-slate-100 p-6 rounded-2xl text-[11px] text-slate-400">
                You haven't initialized any separated savings allocations yet.
              </p>
            ) : (
              savingGoals.map((g) => {
                const pct = Math.min(100, Math.floor((g.savedAmount / g.targetAmount) * 100));
                const activeAction = savingsActionGoalId === g.id;

                return (
                  <div key={g.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 capitalize">{g.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Target: {fmt(g.targetAmount)}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-700 font-sans">{fmt(g.savedAmount)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold block text-right">{pct}% Completed</span>
                    </div>

                    {/* Controls toggler */}
                    {activeAction ? (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-3">
                        <div className="flex justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase">Manage Wallet Cash transfer</p>
                          <button onClick={() => setSavingsActionGoalId(null)} className="text-slate-450 hover:text-slate-800 cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <input
                              type="number"
                              placeholder="Deposit Amt (₦)"
                              value={savingsDepositAmt}
                              onChange={(e) => setSavingsDepositAmt(e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none font-sans"
                            />
                            <button
                              onClick={() => {
                                onDepositSavings(g.id, Number(savingsDepositAmt));
                                setSavingsDepositAmt("");
                                setSavingsActionGoalId(null);
                              }}
                              className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer uppercase"
                            >
                              Deposit
                            </button>
                          </div>

                          <div className="space-y-1">
                            <input
                              type="number"
                              placeholder="Withdraw Amt (₦)"
                              value={savingsWithdrawAmt}
                              onChange={(e) => setSavingsWithdrawAmt(e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none font-sans"
                            />
                            <button
                              onClick={() => {
                                onWithdrawSavings(g.id, Number(savingsWithdrawAmt));
                                setSavingsWithdrawAmt("");
                                setSavingsActionGoalId(null);
                              }}
                              className="w-full py-1.5 bg-slate-800 text-white rounded-lg text-[9px] font-extrabold cursor-pointer uppercase"
                            >
                              Deduct Out
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSavingsActionGoalId(g.id)}
                        className="py-1 px-3 border border-slate-200 hover:border-emerald-600 text-[10px] text-slate-650 hover:text-emerald-700 font-extrabold rounded-lg flex items-center justify-center gap-1 w-full transition-all cursor-pointer bg-slate-50/50 hover:bg-emerald-50/10"
                      >
                        Adjust Savings Allocation
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: Payout withdraw cash (Paystack or Flutterwave Transfer API & USDT) */}
      {activeSubTab === "payout" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
              <Landmark size={13} className="text-emerald-600" /> Withdraw Earnings Gateways
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Process secure payouts directly. Choose Standard Nigerian Local Bank Bank route or high-speed Web3 cryptos. Requires **ID KYC validations** for transfers above ₦10,000 NGN.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl leading-relaxed text-[10px] text-slate-500 font-sans border border-slate-150">
            <p className="font-bold text-slate-705">Limit Policy & Rules:</p>
            <ul className="list-disc pl-3 mt-1.5 space-y-1">
              <li>Current Level {user.membershipTier} withdrawal maximum cap is <span className="font-bold text-emerald-800 font-sans">₦{5000}</span> per 24 hours. Elevate memberships to enlarge layout caps.</li>
              <li>A flat statutory regulatory clearance processing fee of ₦250 NGN applies on all output transactions.</li>
            </ul>
          </div>

          {payoutSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-930 rounded-xl space-y-2 text-center text-xs">
              <div className="h-8 w-8 bg-emerald-200 text-emerald-805 rounded-full flex items-center justify-center font-bold mx-auto">
                ✓
              </div>
              <h5 className="font-bold">Withdrawal Requested Transacted Successfully!</h5>
              <p className="text-[10px] opacity-90 leading-relaxed font-sans">
                A draft payouts value of ₦{payoutSuccess.amount.toLocaleString()} is currently queued and pending review in Admin console. Payout usually arrives via clearing pipelines within 1-2 hours.
              </p>
              <button 
                onClick={() => setPayoutSuccess(null)}
                className="mt-2 py-1.5 px-3.5 bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Request another payout
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              {payoutError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-lg">
                  {payoutError}
                </div>
              )}

              {/* Gateway Channel selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "Future Wallet Bank", label: "Future Wallet", logo: "🌐" },
                  { value: "Paystack Bank", label: "Paystack", logo: "💳" },
                  { value: "Flutterwave Bank", label: "Flutterwave", logo: "🌊" },
                  { value: "USDT", label: "USDT Crypto", logo: "₮" }
                ].map(gate => (
                  <button
                    key={gate.value}
                    type="button"
                    onClick={() => setPayoutMethod(gate.value as any)}
                    className={`p-2 border rounded-xl text-center cursor-pointer transition-all ${
                      payoutMethod === gate.value 
                        ? "bg-emerald-600 border-emerald-650 text-white shadow-3xs font-extrabold" 
                        : "bg-slate-50 border-slate-205 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-xs">{gate.logo}</p>
                    <p className="text-[8.5px] font-black uppercase mt-1 tracking-wide">{gate.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Withdrawal Amount (₦ NGN / USDT equivalent)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans"
                />
              </div>

               {payoutMethod !== "USDT" ? (
                <>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Beneficiary Nigerian Bank Name</label>
                    <button
                      type="button"
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-left text-xs bg-slate-50 font-bold outline-none flex items-center justify-between cursor-pointer"
                    >
                      <span>{payoutBankName || "Select Beneficiary Bank"}</span>
                      <Search size={13} className="text-slate-400" />
                    </button>

                    {isBankDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2 max-h-56 overflow-y-auto">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-150 rounded-lg">
                          <Search size={12} className="text-slate-400 shrink-0" />
                          <input 
                            type="text"
                            placeholder="Type to filter bank..."
                            value={bankSearchQuery}
                            onChange={(e) => setBankSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent w-full text-xs text-slate-705 outline-none placeholder:text-slate-400"
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
                                setPayoutBankName(bankName);
                                setIsBankDropdownOpen(false);
                                setBankSearchQuery("");
                              }}
                              className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                payoutBankName === bankName 
                                  ? "bg-emerald-50 text-emerald-800 font-bold" 
                                  : "hover:bg-slate-50 text-slate-650"
                              }`}
                            >
                              <span>{bankName}</span>
                              {payoutBankName === bankName && <Check size={11} className="text-emerald-600" />}
                            </button>
                          ))}
                          {NIGERIAN_BANKS.filter(bank => 
                            bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2 select-none">No matching banks found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {payoutBankName && BANK_USSD_CODES[payoutBankName] && (
                    <div className="p-2 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center justify-between text-[10px]">
                      <div className="space-y-0.5 max-w-[70%]">
                        <p className="font-extrabold text-emerald-800">{payoutBankName} USSD Portal</p>
                        <p className="text-[8px] text-emerald-600 font-sans">Self-service bank quick integration query code</p>
                      </div>
                      <a 
                        href={`tel:${BANK_USSD_CODES[payoutBankName].replace('#', '%23')}`}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-emerald-50 font-black rounded-lg text-[8px] flex items-center gap-1 transition"
                      >
                        Dial {BANK_USSD_CODES[payoutBankName]}
                      </a>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">10-Digit NUBAN Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 2091830219"
                      value={payoutAccountNo}
                      onChange={(e) => setPayoutAccountNo(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans"
                    />
                    
                    {/* Real-time Bank Verification Display */}
                    {payoutAccountNo.length === 10 && (
                      <div className="space-y-2 mt-1.5">
                        <div className="p-2 rounded-lg border text-[11px] flex items-center justify-between transition-all duration-200">
                          {isVerifyingBank ? (
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                              <RefreshCw size={12} className="animate-spin text-emerald-600" />
                              <span>Verifying bank account details...</span>
                            </div>
                          ) : bankVerificationError ? (
                            <div className="flex flex-col gap-1.5 w-full bg-rose-50/70 border border-rose-100 p-1.5 rounded animate-in slide-in-from-top-1">
                              <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                                <X size={12} className="shrink-0 text-rose-500" />
                                <span>{bankVerificationError}</span>
                              </div>
                            </div>
                          ) : verifiedAccountName ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 border border-emerald-100 p-1.5 w-full rounded justify-between animate-in slide-in-from-top-1">
                              <div className="flex items-center gap-1.5">
                                <Check size={12} className="shrink-0 text-emerald-600 font-bold" />
                                <div className="leading-tight">
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Account Name:</span>
                                  <span className="font-extrabold uppercase font-mono tracking-wider">{verifiedAccountName}</span>
                                </div>
                              </div>
                              <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">VERIFIED</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Verification Bypass Checkbox */}
                        {(bankVerificationError || isVerifyingBank || !verifiedAccountName) && (
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="bypass-ver"
                              checked={bypassVerification}
                              onChange={(e) => setBypassVerification(e.target.checked)}
                              className="mt-0.5 h-3 w-3 rounded text-emerald-600 border-slate-350 focus:ring-emerald-500"
                            />
                            <label htmlFor="bypass-ver" className="text-[10px] text-slate-500 leading-tight cursor-pointer font-medium select-none">
                              <strong>Skip Auto-Verification</strong>: Check this box if verification is taking too long or failing. This ensures you can still request your withdrawal payout immediately!
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Your USDT TRC20 Wallet Address</label>
                  <input
                    type="text"
                    placeholder="e.g. TY9188djjHshDnw812uHjshfNsh"
                    value={payoutUSDTAddress}
                    onChange={(e) => setPayoutUSDTAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Transaction Security PIN</label>
                <input
                  type="password"
                  pattern="\d*"
                  maxLength={6}
                  required
                  placeholder="Enter your 4-6 digit Security PIN"
                  value={payoutPIN}
                  onChange={(e) => setPayoutPIN(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none transition-all font-mono text-center tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-3xs cursor-pointer transition-colors"
              >
                Submit Withdrawal request
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
