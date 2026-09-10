import React, { useState, useEffect } from "react";
import { 
  User, Wallet, Transaction, Campaign, TaskSubmission, 
  SavingGoal, SupportTicket, Achievement, LeaderboardEntry, MembershipConfig, Offer, OfferCompletion 
} from "./types";
import { 
  Smartphone, Wallet as WalletIcon, Award, Gift, 
  Cpu, Sparkles, LogIn, UserPlus, ShieldCheck, 
  Layout, TrendingUp, Settings, HelpCircle, LogOut, ChevronRight,
  Key, Terminal, Fingerprint, Lock, Shield, Eye, EyeOff
} from "lucide-react";

import HomeTab from "./components/HomeTab";
import EarnTab from "./components/EarnTab";
import OfferwallTab from "./components/OfferwallTab";
import WalletTab from "./components/WalletTab";
import ProfileTab from "./components/ProfileTab";
import AISupportAssistant from "./components/AISupportAssistant";
import AIVerificationModal from "./components/AIVerificationModal";
import AdminDashboard from "./components/AdminDashboard";
import AdvertiserDashboard from "./components/AdvertiserDashboard";
import MarketingWebsite from "./components/MarketingWebsite";
import LegalDocsModal from "./components/LegalDocsModal";
import { usePreferences } from "./context/PreferenceContext";
import { LanguageSelector } from "./components/LanguageSelector";

export default function App() {
  const { t, language, currency } = usePreferences();

  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Auth Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [webAuthActive, setWebAuthActive] = useState(false);
  const [registerRole, setRegisterRole] = useState<'user' | 'advertiser'>('user');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [appLegalDoc, setAppLegalDoc] = useState<'privacy' | 'terms' | null>(null);

  // Recovery Modal states
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryResult, setRecoveryResult] = useState<any>(null);
  const [recoveryError, setRecoveryError] = useState("");

  // OTP Challenge MFA states
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpUserId, setOtpUserId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSecurityMode, setOtpSecurityMode] = useState<'bypass' | 'sms' | 'email' | 'dual'>('bypass');
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpLatestDispatched, setOtpLatestDispatched] = useState<any>(null);

  // Desktop side column views & live secure admin injection
  const [desktopTab, setDesktopTab] = useState<'info' | 'admin_secured'>('info');
  const [viewDisplayMode, setViewDisplayMode] = useState<'web' | 'mobile'>(() => {
    if (typeof window !== "undefined") {
      // 1. Explicit query param (highly standard for app-wrapper configurations)
      const urlParams = new URLSearchParams(window.location.search);
      const isAppQuery = urlParams.get('app') === 'true' || 
                         urlParams.get('mode') === 'app' || 
                         urlParams.get('source') === 'app' || 
                         urlParams.get('platform') === 'app' ||
                         urlParams.get('webview') === 'true' ||
                         urlParams.get('view') === 'mobile';
      
      if (isAppQuery) {
        return "mobile";
      }

      // 2. Hybrid mobile wrapper signatures (Capacitor, Cordova, WebView containers, etc.)
      const isNativeWrapper = !!(
        (window as any).cordova || 
        (window as any).Capacitor || 
        (window as any).ReactNativeWebView ||
        (window as any).Android ||
        (window as any).webkit?.messageHandlers
      );

      if (isNativeWrapper) {
        return "mobile";
      }

      // 3. Standalone installed PWA checks
      const isStandalonePWA = window.matchMedia?.('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;

      if (isStandalonePWA) {
        return "mobile";
      }

      // 4. WebView User Agent signature checks (separating standard mobile browsers from webview containers)
      const ua = window.navigator.userAgent || "";
      const isAndroidWebView = /Version\/.*Chrome\/.*Mobile/i.test(ua) === false && /Android/i.test(ua) && /Version\/[0-9.]+/i.test(ua);
      const isIosWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
      const isWebViewGeneric = /wv|WebView|Crosswalk/i.test(ua);

      if (isAndroidWebView || isIosWebView || isWebViewGeneric) {
        return "mobile";
      }

      // 5. Default to 'web' for standard browser environments (both desktop & mobile)
      return "web";
    }
    return "web";
  });
  const [isInjectingAdmin, setIsInjectingAdmin] = useState<string | null>(null);
  const [adminBypassLogs, setAdminBypassLogs] = useState<string[]>([]);

  // Secure entry direct gateway for platform admins simulation
  const triggerAdminSecuredBypass = async (adminMail: string, adminPass: string, adminRoleName: string) => {
    setIsInjectingAdmin(adminMail);
    setAdminBypassLogs([
      `ESTABLISHING SECURE ADMIN SESSION LINK...`,
      `PROTOCOL HANDSHAKE: VALIDATING ADMINISTRATIVE SSO METRICS...`,
      `VERIFYING SINGLE SIGN-ON MULTI-TIER AUTHENTICATION...`
    ]);

    await new Promise(resolve => setTimeout(resolve, 350));
    setAdminBypassLogs(prev => [...prev, `CORRELATING ROLE-BASED ACCESS POLICIES FOR: ${adminRoleName.toUpperCase()}`, `REQUESTING SECURED API SESSION FOR: ${adminMail}`]);
    await new Promise(resolve => setTimeout(resolve, 300));
    setAdminBypassLogs(prev => [...prev, `VALIDATION COMPLETE · AUTHORIZING SECURE CONSOLE ACCESS...`]);
    await new Promise(resolve => setTimeout(resolve, 200));

    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminMail, password: adminPass })
      });

      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        setIsInjectingAdmin(null);
        return;
      }

      setUser(data.user);
      setWallet(data.wallet);
      setIsAuthenticated(true);
      localStorage.setItem("earnpay_userId", data.user.id);
      
      if (data.user.role === 'admin') {
        await syncAdminState();
        setIsAdminDashboardOpen(true);
      } else if (data.user.role === 'advertiser') {
        setIsAdvertiserDashboardOpen(true);
      }
      
    } catch (err) {
      console.error(err);
      setAuthError("Secured session establishment interrupted.");
    } finally {
      setIsInjectingAdmin(null);
    }
  };

  // Application Data arrays
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [configs, setConfigs] = useState<Record<string, MembershipConfig>>({});
  const [settings, setSettings] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerCompletions, setOfferCompletions] = useState<OfferCompletion[]>([]);
  const [postbackLogs, setPostbackLogs] = useState<any[]>([]);

  // Navigation index
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  // Toggle auxiliary drawers / views
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [activeTaskVerificationCampaign, setActiveTaskVerificationCampaign] = useState<Campaign | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdvertiserDashboardOpen, setIsAdvertiserDashboardOpen] = useState(false);

  // Administrative stats
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  // 1. Initial State Synchronization from Express DB-Store on Boot
  useEffect(() => {
    const bootApp = async () => {
      await fetchConfigs();
      
      const savedUserId = localStorage.getItem("earnpay_userId");
      if (savedUserId) {
        try {
          const res = await fetch(`/api/user-state?userId=${savedUserId}`);
          const data = await res.json();
          if (res.ok && data && data.user) {
            setUser(data.user);
            setWallet(data.wallet);
            setIsAuthenticated(true);
            
            if (data.user.role === 'advertiser') {
              setIsAdvertiserDashboardOpen(true);
            } else if (data.user.role === 'admin') {
              setIsAdminDashboardOpen(true);
              try {
                const metricsRes = await fetch("/api/admin/metrics");
                const metricsData = await metricsRes.json();
                setAdminStats(metricsData.stats);
                setUsersList(metricsData.users);
              } catch (metricsErr) {
                console.error("Admin metrics fetch failed during boot", metricsErr);
              }
            }
            
            setCampaigns(data.campaigns);
            setSubmissions(data.submissions);
            setTransactions(data.transactions);
            setSavingGoals(data.savingGoals);
            setTickets(data.tickets);
            setAchievements(data.achievements);
            setLeaderboard(data.leaderboard);
            setConfigs(data.configs);
            setSettings(data.settings);
            if (data.offers) setOffers(data.offers);
            if (data.offerCompletions) setOfferCompletions(data.offerCompletions);
            if (data.postbackLogs) setPostbackLogs(data.postbackLogs);
          } else if (res.status === 404) {
            // User explicitly does not exist anymore
            localStorage.removeItem("earnpay_userId");
          }
        } catch (e) {
          console.error("Auto login temporary failure during boot (session preserved):", e);
        }
      }
    };
    
    bootApp();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/configs");
      const data = await res.json();
      setConfigs(data);
    } catch (e) {
      console.error("Config fetch failed", e);
    }
  };

  const syncAppState = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/user-state?userId=${userId}`);
      const data = await res.json();
      if (!data.error) {
        setUser(data.user);
        setWallet(data.wallet);
        setCampaigns(data.campaigns);
        setSubmissions(data.submissions);
        setTransactions(data.transactions);
        setSavingGoals(data.savingGoals);
        setTickets(data.tickets);
        setAchievements(data.achievements);
        setLeaderboard(data.leaderboard);
        setConfigs(data.configs);
        setSettings(data.settings);
        if (data.offers) setOffers(data.offers);
        if (data.offerCompletions) setOfferCompletions(data.offerCompletions);
        if (data.postbackLogs) setPostbackLogs(data.postbackLogs);
      }
    } catch (err) {
      console.error("Data syncing failed", err);
    }
  };

  // Helper sync triggered for admin reviews
  const syncAdminState = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      setAdminStats(data.stats);
      setUsersList(data.users);
    } catch (e) {
      console.error("Admin stats failed", e);
    }
  };

  // 2. Authentication handlers
  const fetchOtpLatestState = async () => {
    try {
      const res = await fetch("/api/auth/latest-otp");
      const data = await res.json();
      if (data.latestDispatchedOTP) {
        setOtpLatestDispatched(data.latestDispatchedOTP);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otpUserId, code: otpCode })
      });
      const data = await res.json();
      if (data.error) {
        setOtpError(data.error);
        return;
      }
      
      // Successfully authenticated!
      setUser(data.user);
      setWallet(data.wallet);
      setIsAuthenticated(true);
      setOtpRequired(false);
      setOtpCode("");
      localStorage.setItem("earnpay_userId", data.user.id);
      
      if (data.user.role === 'advertiser') {
        setIsAdvertiserDashboardOpen(true);
      } else if (data.user.role === 'admin') {
        setIsAdminDashboardOpen(true);
      }
      
      await syncAppState(data.user.id);
    } catch (err) {
      setOtpError("Security verification node disconnected. Try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otpUserId, actionType: "Security Login Challenge" })
      });
      const data = await res.json();
      if (data.error) {
        setOtpError(data.error);
      } else {
        fetchOtpLatestState();
      }
    } catch (err) {
      setOtpError("OTP resubmission timed out.");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const isReg = isRegistering;
    const endpoint = isReg ? "/api/auth/register" : "/api/auth/login";
    const body = isReg 
      ? { email, password, name: fullName, role: registerRole } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        return;
      }

      // Check if Multi-Mode OTP verification is triggered
      if (data.otpRequired) {
        setOtpRequired(true);
        setOtpUserId(data.userId);
        setOtpSecurityMode(data.securityMode);
        setOtpEmail(data.email || "");
        setOtpPhone(data.phone || "");
        await fetchOtpLatestState();
        return;
      }

      setUser(data.user);
      setWallet(data.wallet);
      setIsAuthenticated(true);
      localStorage.setItem("earnpay_userId", data.user.id);
      
      // Auto-open console workspace based on user profile roles
      if (data.user.role === 'advertiser') {
        setIsAdvertiserDashboardOpen(true);
      } else if (data.user.role === 'admin') {
        setIsAdminDashboardOpen(true);
      }
      
      // Load current lists
      await syncAppState(data.user.id);
    } catch (err) {
      console.error(err);
      setAuthError("Communication with authorization server interrupted. Try again.");
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryResult(null);
    try {
      const res = await fetch("/api/user/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryError(data.error || "Failed to recover security PIN or password details.");
      } else {
        setRecoveryResult(data);
      }
    } catch (err) {
      setRecoveryError("Connection timeout. Failed to query recovery server.");
    }
  };

  // Switch sandbox role
  const handleSandboxRoleSwitch = async (role: "user" | "advertiser" | "admin") => {
    if (!user) return;
    try {
      const res = await fetch("/api/sandbox/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role })
      });
      const data = await res.json();
      if (data.success) {
        await syncAppState(user.id);
        if (role === 'admin') {
          await syncAdminState();
          setIsAdminDashboardOpen(true);
        } else if (role === 'advertiser') {
          setIsAdvertiserDashboardOpen(true);
        } else {
          setIsAdminDashboardOpen(false);
          setIsAdvertiserDashboardOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Log Out
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setWallet(null);
    setEmail("");
    setPassword("");
    setFullName("");
    setActiveTabIdx(0);
    setIsAdminDashboardOpen(false);
    isAdvertiserDashboardOpen && setIsAdvertiserDashboardOpen(false);
    setWebAuthActive(false);
    localStorage.removeItem("earnpay_userId");
  };

  // 3. Transactions & Earning Actions

  // Check In reward
  const handleCheckIn = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (!data.error) {
        syncAppState(user.id);
      }
    } catch (e) {
      console.error("Check-In failed", e);
    }
  };

  // Peer to Peer Send
  const handleTransferFunds = async (recipient: string, amount: number, pin: string) => {
    if (!user) return { success: false, error: "Authentication expired." };
    try {
      const res = await fetch("/api/user/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, recipientEmail: recipient, amount, pin })
      });
      const data = await res.json();
      if (data.error) {
        return { success: false, error: data.error };
      }
      syncAppState(user.id);
      return { success: true };
    } catch (e) {
      return { success: false, error: "P2P transfer error." };
    }
  };

  // Digital Bill Payment purchase
  const handleBillPayment = async (serviceType: string, providerName: string, targetDetails: string, amount: number) => {
    if (!user) return { success: false, error: "Authentication expired." };
    try {
      const res = await fetch("/api/user/pay-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, serviceType, providerName, targetDetails, amount })
      });
      const data = await res.json();
      if (data.error) {
        return { success: false, error: data.error };
      }
      syncAppState(user.id);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Bill gateway failure. Try MTN/Airtel airtime." };
    }
  };

  // Savings creator
  const handleCreateSavings = async (title: string, targetAmount: number) => {
    if (!user) return;
    try {
      await fetch("/api/user/savings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, title, targetAmount })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDepositSavings = async (goalId: string, amount: number) => {
    if (!user) return;
    try {
      await fetch("/api/user/savings/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, goalId, amount })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdrawSavings = async (goalId: string, amount: number) => {
    if (!user) return;
    try {
      await fetch("/api/user/savings/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, goalId, amount })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Financial withdrawal dispatch
  const handleWithdrawRequest = async (amount: number, method: string, accountNo: string, bankName: string, usdtAddress: string, pin: string, country?: string, currency?: string) => {
    if (!user) return { success: false, error: "Access denied." };
    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, method, accountNo, bankName, usdtAddress, pin, country, currency })
      });
      const data = await res.json();
      if (data.error) {
        return { success: false, error: data.error };
      }
      syncAppState(user.id);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Pipelined payouts issue." };
    }
  };

  // Offer completions postback simulator
  const handleCompleteOffer = async (offerId: string) => {
    if (!user) return;
    try {
      if (offerId.startsWith("camp-offer-")) {
        const campaignId = offerId.replace("camp-offer-", "");
        const res = await fetch("/api/gemini/verify-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            campaignId, 
            submissionText: "Live Tracked via S2S Postback Integration" 
          })
        });
        const data = await res.json();
        if (!data.error) {
          syncAppState(user.id);
        }
        return;
      }

      const res = await fetch("/api/user/complete-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, offerId })
      });
      const data = await res.json();
      if (!data.error) {
        syncAppState(user.id);
      }
    } catch (e) {
      console.error("CPA completion error", e);
    }
  };

  // Register offer click (pending state)
  const handleRegisterClick = async (offerId: string, network: string, amountNGN: number) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/click-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, offerId, network, amountNGN })
      });
      if (res.ok) {
        syncAppState(user.id);
      }
    } catch (e) {
      console.error("Register click error", e);
    }
  };

  // KYC validation document submit
  const handleKYCSubmit = async (details: { idType: string; idNumber: string; fullName: string; level: 'basic' | 'advanced' }) => {
    if (!user) return;
    try {
      await fetch("/api/user/kyc-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...details })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Membership elevations
  const handleMembershipUpgrade = async (tier: any) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/upgrade-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tier })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Achievements extra wage claimer
  const handleClaimAchievement = async (achId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/claim-achievement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, achievementId: achId })
      });
      const data = await res.json();
      if (!data.error) {
        syncAppState(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Help support tickets spawning
  const handleCreateTicket = async (subject: string, category: string, message: string) => {
    if (!user) return;
    try {
      await fetch("/api/user/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, subject, category, message })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Chat message support responses
  const handleSendTicketReply = async (ticketId: string, reply: string) => {
    if (!user) return;
    try {
      await fetch("/api/user/reply-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ticketId, messageText: reply })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Create campaign bounds for advertisers
  const handleCampaignCreate = async (details: any) => {
    if (!user) return { success: false, error: "Expiry error." };
    try {
      const res = await fetch("/api/advertiser/create-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: user.id, ...details })
      });
      const data = await res.json();
      if (data.error) {
        return { success: false, error: data.error };
      }
      syncAppState(user.id);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Campaign creation server error." };
    }
  };

  // manual advertiser reviewer approval
  const handleApproveSubmission = async (subId: string) => {
    if (!user) return;
    try {
      await fetch("/api/advertiser/approve-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subId })
      });
      syncAppState(user.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Admin approval triggers
  const handleAdminAction = async (action: string, targetId: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId })
      });
      const data = await res.json();
      if (data.success) {
        await syncAdminState();
        if (user) await syncAppState(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans selection:bg-emerald-500/20 selection:text-emerald-100 overflow-x-hidden">
      
      {/* Responsive Full-Screen Workspace */}
      <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col relative text-slate-800">
        
        {/* Mobile top status bar indicator layout (Aesthetic details) */}
        <div className="bg-emerald-800 text-white text-[10px] px-4 py-2 flex justify-between items-center shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <p className="font-black">EarnPay Global Network</p>
            <span className="bg-emerald-950/60 text-[7px] text-emerald-300 border border-emerald-600/30 px-1 py-0.2 rounded font-black uppercase tracking-widest font-mono">
              {currency}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTranslatorOpen(!isTranslatorOpen)}
              className="bg-emerald-950/85 hover:bg-emerald-900 border border-emerald-600/50 text-[8.5px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 text-emerald-200 cursor-pointer transition-all active:scale-95"
            >
              🌐 {language.toUpperCase()} / {currency}
            </button>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>

        {isTranslatorOpen && <LanguageSelector />}

        {/* Dynamic header / exit dashboard flags */}
        {isAuthenticated && user && (
          <div className="bg-emerald-700 text-white px-4 py-2 flex justify-between items-center text-[10px] shrink-0 border-b border-emerald-600">
            <span className="font-bold">Role active: <span className="uppercase text-emerald-200">{user.role}</span></span>
            <div className="flex gap-2 items-center">
              {user.role === 'advertiser' && !isAdvertiserDashboardOpen && (
                <button 
                  onClick={() => setIsAdvertiserDashboardOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-2 py-0.5 rounded text-[8.5px] cursor-pointer"
                >
                  💼 Open Console
                </button>
              )}
              {user.role === 'admin' && !isAdminDashboardOpen && (
                <button 
                  onClick={() => setIsAdminDashboardOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-2 py-0.5 rounded text-[8.5px] cursor-pointer"
                >
                  🛡️ Open Admin
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="font-bold text-emerald-250 hover:text-white flex items-center gap-0.5 ml-1 cursor-pointer"
              >
                <LogOut size={10} /> Logout
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          
          {/* A. AUTH PANEL SCREEN */}
          {!isAuthenticated ? (
            otpRequired ? (
              <div className="p-6 space-y-6 pt-12 animate-in fade-in duration-300 max-w-sm mx-auto">
                <div className="text-center space-y-2">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-emerald-500 text-emerald-450 font-black flex items-center justify-center text-xl shadow-lg mx-auto font-mono">
                    MFA
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-slate-800 font-sans tracking-tight">Security Check Active</h1>
                    <p className="text-[11px] text-slate-500 max-w-[245px] mx-auto leading-relaxed">
                      Two-factor authentication is active on this account to prevent unauthorized access.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold tracking-wide uppercase">
                      GSM Operator: {otpSecurityMode.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode("");
                        setOtpError(null);
                        setOtpRequired(false);
                      }}
                      className="text-[9px] text-slate-400 font-bold hover:text-slate-600 cursor-pointer font-sans"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    {otpError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-xl font-medium">
                        ⚠️ {otpError}
                      </div>
                    )}

                    <div className="text-center space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans">ENTER 6-DIGIT OTP TOKEN</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="______"
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full text-center tracking-[0.6em] text-lg font-black text-slate-905 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition-all placeholder:text-slate-350 font-mono"
                      />
                    </div>

                    <p className="text-[9px] text-slate-455 leading-relaxed text-center font-sans">
                      {otpSecurityMode === "sms" && `A verification text message has been pushed to your mobile device at ${otpPhone}`}
                      {otpSecurityMode === "email" && `A secure OTP email has been dispatched to backup mailbox: ${otpEmail}`}
                      {otpSecurityMode === "dual" && `Twin OTP codes sent to mobile network ${otpPhone} and backup email address ${otpEmail}`}
                    </p>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingOtp ? "Routing Handshake Code..." : "🔐 Confirm Verification Code"}
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] px-1 font-bold font-sans">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-emerald-805 hover:underline cursor-pointer"
                    >
                      🔄 Resend OTP Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode("");
                        setOtpError(null);
                        setOtpRequired(false);
                      }}
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Return to Login
                    </button>
                  </div>
                </div>

                {/* GSM Live Network Handshake Terminal Tracer Component */}
                <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950 font-mono shadow-lg text-[8px] text-[#22c55e] p-3 space-y-1.5 select-none font-mono">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1 flex-wrap gap-1 font-mono">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse font-mono" />
                      <span className="font-extrabold uppercase text-white tracking-wider text-[8px] font-mono">LTE LIVE CARRIER TRACER</span>
                    </div>
                    <button
                      type="button"
                      onClick={fetchOtpLatestState}
                      className="text-[7px] bg-white/10 hover:bg-white/20 text-white px-1.5 py-0.2 rounded transition-all cursor-pointer font-bold font-mono"
                    >
                      REFRESH
                    </button>
                  </div>

                  {otpLatestDispatched ? (
                    <div className="space-y-1 max-h-[120px] overflow-y-auto leading-relaxed scrollbar-none font-mono">
                      <p className="text-white font-bold opacity-90 truncate font-mono">
                        Target Address: {otpLatestDispatched.gatewayAddress}
                      </p>
                      {otpLatestDispatched.handshakes && otpLatestDispatched.handshakes.map((h: string, idx: number) => (
                        <p key={idx} className={h.includes("[FAIL]") || h.includes("[Warn]") ? "text-amber-400 font-mono" : h.includes("[LIVE") ? "text-cyan-400 font-bold font-mono" : "font-mono"}>
                          &gt; {h}
                        </p>
                      ))}
                      <div className="pt-1.5 border-t border-white/5 flex justify-between items-center bg-emerald-950/20 p-1.5 rounded flex-wrap gap-1 mt-1 font-mono">
                        <span className="text-white font-bold text-[8px] font-mono">VERIFICATION AUTH CODE:</span>
                        <span className="text-xs font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded tracking-widest font-mono">{otpLatestDispatched.code}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-slate-500 font-bold text-[8px] font-mono animate-pulse">CONNECTING ROUTED CELL PACKET BASE STATION...</p>
                  )}
                </div>
              </div>
            ) : viewDisplayMode === 'web' && !webAuthActive ? (
              <MarketingWebsite 
                membershipConfigs={configs}
                settings={settings}
                onNavigateAuth={(isRegister) => {
                  setIsRegistering(isRegister);
                  setWebAuthActive(true);
                  setAuthError(null);
                }}
                onMockLogin={(mockEmail) => {
                  setEmail(mockEmail);
                  setPassword("password123");
                  setWebAuthActive(true);
                }}
              />
            ) : (
              <div className="p-6 space-y-6 pt-12 animate-in fade-in duration-300">
                {viewDisplayMode === 'web' && (
                  <button
                    onClick={() => setWebAuthActive(false)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 cursor-pointer text-left mb-2 select-none"
                  >
                    ⬅️ Back to Public Website
                  </button>
                )}
              
              {/* Branding and banner */}
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shadow-lg mx-auto">
                  EP
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800 font-sans tracking-tight">{t("Welcome to EarnPay")}</h1>
                  <p className="text-xs text-slate-450 leading-relaxed max-w-[240px] mx-auto">
                    {t("The professional enterprise fintech rewards platform for world wide users and advertisers.")}
                  </p>
                </div>
              </div>

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs space-y-4">
                <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wide">
                  {isRegistering ? t("Unleash Client account nodes") : t("Login Securely")}
                </h3>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] rounded-xl font-medium">
                      {authError}
                    </div>
                  )}

                  {isRegistering && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-550 uppercase">{t("Account Profile Type")}</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setRegisterRole("user")}
                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition-all uppercase cursor-pointer ${
                              registerRole === "user"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            👥 {t("Earner / User")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterRole("advertiser")}
                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition-all uppercase cursor-pointer ${
                              registerRole === "advertiser"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            📣 {t("Advertiser")}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-550 uppercase">{t("Legal Full Name")}</label>
                        <input
                          type="text"
                          placeholder="e.g. Kolawole Adeleke"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-emerald-600 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-550 uppercase">{t("Email or Phone Number")}</label>
                    <input
                      type="text"
                      placeholder="e.g. tunde@gmail.com or 08123456789"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-550 uppercase">Secure Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-emerald-600 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer focus:outline-none"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer mt-2"
                  >
                    {isRegistering ? t("Complete Register & Onboard") : t("Access Personal Wallet")}
                  </button>

                  {isRegistering && (
                    <p className="text-[9.5px] text-slate-450 text-center leading-relaxed mt-2.5">
                      By registering, you agree to our{" "}
                      <button 
                        type="button" 
                        onClick={() => setAppLegalDoc("terms")}
                        className="text-emerald-700 hover:underline font-bold bg-transparent border-0 p-0 cursor-pointer text-[9.5px]"
                      >
                        Terms of Operation
                      </button>{" "}
                      and accept the{" "}
                      <button 
                        type="button" 
                        onClick={() => setAppLegalDoc("privacy")}
                        className="text-emerald-700 hover:underline font-bold bg-transparent border-0 p-0 cursor-pointer text-[9.5px]"
                      >
                        Privacy Statement
                      </button>.
                    </p>
                  )}
                </form>

                <div className="text-center pt-2 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setAuthError(null);
                    }}
                    className="text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {isRegistering ? t("Have an account? Login here") : t("Don't have an account? Sign up here")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecoveryModalOpen(true)}
                    className="text-[9.5px] font-black text-amber-600 hover:text-amber-700 hover:underline cursor-pointer transition-all bg-transparent border-none mt-1"
                  >
                    🔑 {t("Recover Lost Password or Security PIN")}
                  </button>
                </div>
              </div>



            </div>
          )
          ) : (
            
            // B. LOGGED IN FLOW CONTENT
            (() => {
              if (!user || !wallet) return null;

              return (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex-1">
                    {/* Render active Tab */}
                    {activeTabIdx === 0 && (
                      <HomeTab 
                        user={user}
                        wallet={wallet}
                        transactions={transactions}
                        leaderboard={leaderboard}
                        configs={configs}
                        settings={settings}
                        onTabChange={setActiveTabIdx}
                        onCheckIn={handleCheckIn}
                        onOpenAssistant={() => setIsAIAssistantOpen(true)}
                      />
                    )}

                    {activeTabIdx === 1 && (
                      <EarnTab 
                        user={user}
                        campaigns={campaigns}
                        submissions={submissions}
                        configs={configs}
                        settings={settings}
                        onRefresh={() => syncAppState(user.id)}
                        onVerifyTaskTrigger={(c) => setActiveTaskVerificationCampaign(c)}
                        onTabChange={setActiveTabIdx}
                      />
                    )}

                    {activeTabIdx === 2 && (
                      <OfferwallTab 
                        user={user}
                        settings={settings}
                        offers={offers}
                        campaigns={campaigns}
                        offerCompletions={offerCompletions}
                        onCompleteOffer={handleCompleteOffer}
                        onRegisterClick={handleRegisterClick}
                      />
                    )}

                    {activeTabIdx === 3 && (
                      <WalletTab 
                        user={user}
                        settings={settings}
                        wallet={wallet}
                        transactions={transactions}
                        savingGoals={savingGoals}
                        onTransferFunds={handleTransferFunds}
                        onBillPayment={handleBillPayment}
                        onCreateSavings={handleCreateSavings}
                        onDepositSavings={handleDepositSavings}
                        onWithdrawSavings={handleWithdrawSavings}
                        onWithdrawRequest={handleWithdrawRequest}
                        onRefresh={() => syncAppState(user.id)}
                      />
                    )}

                    {activeTabIdx === 4 && (
                      <ProfileTab 
                        user={user}
                        tickets={tickets}
                        achievements={achievements}
                        configs={configs}
                        settings={settings}
                        onKYCSubmit={handleKYCSubmit}
                        onMembershipUpgrade={handleMembershipUpgrade}
                        onClaimAchievement={handleClaimAchievement}
                        onCreateTicket={handleCreateTicket}
                        onSendTicketReply={handleSendTicketReply}
                        onUpdateUser={setUser}
                      />
                    )}
                  </div>

                  {/* BOTTOM TAP SWITCHER (OPay styled bottom rail) */}
                  <div className="bg-white border-t border-slate-100 py-2.5 flex justify-around items-center shrink-0 shadow-inner rounded-t-3xl">
                    {[
                      { icon: "🏠", label: t("Home"), idx: 0 },
                      { icon: "🎯", label: t("Earn"), idx: 1 },
                      { icon: "🎁", label: t("Offers"), idx: 2 },
                      { icon: "💰", label: t("Wallet"), idx: 3 },
                      { icon: "👤", label: t("Me"), idx: 4 }
                    ].map((btn) => (
                      <button
                        key={btn.idx}
                        onClick={() => setActiveTabIdx(btn.idx)}
                        className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                          activeTabIdx === btn.idx ? "text-emerald-750 font-black animate-pulse" : "text-slate-400 font-bold"
                        }`}
                      >
                        <span className="text-base">{btn.icon}</span>
                        <span className="text-[9px] tracking-wide uppercase">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          )}

        </div>

      </div>

      {/* AUX DRAWERS / POPUPS COMPLEMENT */}

      {/* 1. AI Support Assistant Chat Drawer */}
      <AISupportAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />

      {/* 2. AI Task Verification modal */}
      {activeTaskVerificationCampaign && (
        <AIVerificationModal 
          campaign={activeTaskVerificationCampaign}
          onClose={() => setActiveTaskVerificationCampaign(null)}
          onSuccess={async (sub) => {
            if (user) syncAppState(user.id);
            setTimeout(() => {
              setActiveTaskVerificationCampaign(null);
            }, 3000);
          }}
        />
      )}

      {/* 3. Secure Admin Panel */}
      {isAdminDashboardOpen && user && adminStats && (
        <AdminDashboard 
          stats={adminStats}
          users={usersList}
          allTransactions={transactions}
          allSubmissions={submissions}
          campaigns={campaigns}
          user={user}
          configs={configs}
          settings={settings}
          tickets={tickets}
          offers={offers}
          postbackLogs={postbackLogs}
          onRefresh={async () => {
            await syncAppState(user.id);
            await syncAdminState();
          }}
          onAdminAction={handleAdminAction}
          onClose={() => {
            handleSandboxRoleSwitch("user");
            setIsAdminDashboardOpen(false);
          }}
        />
      )}

      {/* 4. Advertiser Console Panel */}
      {isAdvertiserDashboardOpen && user && (
        <AdvertiserDashboard 
          user={user}
          wallet={wallet!}
          campaigns={campaigns}
          submissions={submissions}
          usersList={usersList}
          onCampaignCreate={handleCampaignCreate}
          onApproveSubmission={handleApproveSubmission}
          onRefresh={() => syncAppState(user.id)}
          settings={settings}
          tickets={tickets}
          onCreateTicket={handleCreateTicket}
          onSendTicketReply={handleSendTicketReply}
          onClose={() => {
            handleSandboxRoleSwitch("user");
            setIsAdvertiserDashboardOpen(false);
          }}
        />
      )}

      {appLegalDoc && (
        <LegalDocsModal 
          initialTab={appLegalDoc}
          onClose={() => setAppLegalDoc(null)}
        />
      )}

      {/* Credentials and PIN Recovery Modal - Requirement 9 */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#111c2a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsRecoveryModalOpen(false);
                setRecoveryEmail("");
                setRecoveryResult(null);
                setRecoveryError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-sans text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 font-sans justify-center sm:justify-start">
                🔑 Lost Credentials & PIN Retrieval
              </h3>
              <p className="text-[10px] text-slate-400">
                Authorized EarnPay ledger scanning. Specify your registered email or phone number to automatically retrieve password and PIN.
              </p>
            </div>

            <form onSubmit={handleRecover} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold block">Registered Email or Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tunde@gmail.com or 08123456789"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#090e16] border border-slate-800 text-slate-150 rounded-xl text-xs outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                Scan Node Security Registry
              </button>
            </form>

            {recoveryError && (
              <p className="p-2 text-[9px] bg-red-950/20 text-rose-400 border border-rose-950/40 rounded-lg text-center font-bold">
                ⚠️ {recoveryError}
              </p>
            )}

            {recoveryResult && (
              <div className="bg-[#090e16] border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 font-mono text-[10.5px]">
                <p className="text-emerald-400 text-[10px] font-sans font-black uppercase text-center border-b border-slate-805 pb-1">
                  Secure Retrieval Successful
                </p>
                <div className="space-y-1.5 text-slate-300">
                  <p><span className="text-slate-500 font-sans font-bold">Node Name:</span> {recoveryResult.name}</p>
                  <p><span className="text-slate-500 font-sans font-bold">Email Address:</span> {recoveryResult.email}</p>
                  {recoveryResult.phone && <p><span className="text-slate-500 font-sans font-bold">Phone Number:</span> {recoveryResult.phone}</p>}
                  <p className="bg-slate-900/50 p-1.5 rounded border border-slate-800/40"><span className="text-slate-550 font-sans font-bold">Account Password:</span> <strong className="text-white text-xs">{recoveryResult.password}</strong></p>
                  <p className="bg-amber-950/10 p-1.5 rounded border border-amber-950/20"><span className="text-amber-500/80 font-sans font-bold">Security PIN:</span> <strong className="text-amber-300 text-xs font-sans tracking-widest">{recoveryResult.pin}</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
