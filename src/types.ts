/**
 * EarnPay Types Definition
 * Inspired by Opay & PalmPay - scalable enterprise-grade structure
 */

export type UserRole = 'user' | 'advertiser' | 'admin';

export interface Wallet {
  available: number; // in NGN (₦)
  pending: number;
  referral: number;
  bonus: number;
}

export type MembershipTier = 
  | 'Free' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  | 'Sapphire' | 'Emerald' | 'Ruby' | 'Crown' | 'Ultimate' | 'Infinity';

export interface MembershipConfig {
  tier: MembershipTier;
  price: number;
  dailyTasksLimit: number;
  referralCommission: number; // fractional (e.g. 0.03 for 3%)
  withdrawalLimit: number; // NGN per day
  adsLimit: number; // Max Google AdSense / Premium ads available per day
  benefits: string[];
  durationDays?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  membershipTier: MembershipTier;
  membershipExpiresAt?: string; // Expire date (60 days for Free, 365 days for Paid)
  tasksCompletedToday: number;
  adsCompletedToday?: number; // Count of ads completed today
  referralCode: string;
  referredBy?: string; // ID of the user who referred them
  kycLevel: 'none' | 'basic' | 'advanced';
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  kycDetails?: KYCDetails;
  pinSet: boolean;
  avatarUrl?: string;
  createdAt: string;
  streakCount: number;
  lastCheckIn?: string;
  lastAdDate?: string; // Last date user watched an ad
  visitedLinks?: string[]; // Array of visited/completed links to avoid repeats
  adminRole?: 'operations' | 'financial' | 'support' | 'sole'; // Specific multi-admin role
  password?: string; // Simple login credential
  securityMode?: 'bypass' | 'sms' | 'email' | 'dual';
  carrierGateway?: string;
  securityPhone?: string;
  securityEmail?: string;
  pin?: string;
  pinAttempts?: number;
  suspendedUntil?: string;
  wallet?: Wallet;
}

export interface KYCDetails {
  idType?: string; // NIN, BVN, Voter's Card, Driver's License
  idNumber?: string;
  fullName?: string;
  selfieUrl?: string; // base64 or placeholder
  bvnVerified?: boolean;
}

export type TransactionType = 
  | 'deposit' 
  | 'withdraw' 
  | 'transfer_send' 
  | 'transfer_receive' 
  | 'task_earning' 
  | 'offer_earning' 
  | 'referral_bonus' 
  | 'membership_upgrade' 
  | 'airtime_cashback' 
  | 'bill_payment' 
  | 'savings_deposit' 
  | 'savings_withdraw'
  | 'admin_revenue';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string; // NGN or USDT
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  description: string;
  recipientId?: string; // for transfers
  recipientName?: string;
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  userId: string;
  title: string; // e.g. Business Fund, School Fees, Laptop
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  category: 'App Promotion' | 'Website Promotion' | 'Lead Generation' | 'Social Media Promotion' | 'Brand Awareness' | 'Product Review' | 'Video Engagement' | 'Survey & Market Research' | 'Newsletter Subscription' | 'Forum & Discord Joining' | 'Mobile Game Playing' | 'Business Map Review';
  instructions: string;
  rewardValue: number; // reward amount paid to user (e.g. ₦120)
  totalBudget: number;
  remainingBudget: number;
  status: 'active' | 'paused' | 'completed';
  timeRequired: string; // e.g. "5 mins"
  difficulty: 'Easy' | 'Medium' | 'Hard';
  creativeUrl?: string; // image or promotional link
  targetLink?: string; // Target advert link pasted by advertiser
  submissionsCount: number;
  approvalRate: number;
}

export interface TaskSubmission {
  id: string;
  campaignId: string;
  userId: string;
  submissionProof: string; // text description or screenshot data url
  proofType: 'text' | 'screenshot';
  status: 'pending' | 'verified_ai' | 'approved' | 'rejected';
  aiFeedback?: string;
  reviewedByAdmin: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  network: string;
  title: string;
  description: string;
  rewardAmount: number; // NGN
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Watch Videos' | 'Read & Comment' | 'Likes & Shares' | 'Opinions & Reviews' | 'App Installs' | 'Surveys' | 'Finance Offers' | 'Gaming Offers' | 'Registration Offers' | 'Shopping Offers' | 'Crypto Offers' | 'Education Offers';
  offerUrl: string;
}

export interface OfferCompletion {
  id: string;
  userId: string;
  offerId: string;
  network: string;
  amountNGN: number;
  status: 'completed' | 'pending' | 'pending_postback';
  createdAt: string;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  membershipTier: MembershipTier;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'Earn' | 'Withdraw' | 'Membership' | 'KYC' | 'Technical' | 'Advertiser';
  status: 'open' | 'answered' | 'closed';
  messages: {
    sender: 'user' | 'agent';
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  assignedAdminRole?: 'operations' | 'financial' | 'support' | 'sole';
}

export interface Achievement {
  id: string;
  userId: string;
  badge: 'first_task' | 'first_referral' | 'first_withdraw' | 'hundred_tasks' | 'diamond_member';
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt: string;
  bonusClaimed: boolean;
  bonusAmount: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  membershipTier: MembershipTier;
  amountEarned: number;
  tasksCompleted: number;
  referralsCount: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  cpaRevenue: number; // what offerwalls paid (gross platform margin)
  campaignRevenue: number; // what advertisers funded
  membershipRevenue: number; // paid for membership upgrades
  billPaymentRevenue: number; // markup or transaction fee income
  adRevenue: number; // AdSense earnings
  expenses: number; // user payouts/completions/rewards
  netProfit: number;
}

export interface SecurityRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'user' | 'advertiser';
  type: 'forgot_password' | 'forgot_pin' | 'change_password' | 'change_pin';
  requestedValue?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

