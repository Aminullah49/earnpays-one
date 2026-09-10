-- EarnPay Relational Database Schema (PostgreSQL)
-- Optimized for scale (100k+ active users) with indexes, locks, and strict constraints.

-- CREATE TABLES

-- 1. Users & Profiles
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) DEFAULT 'user' CHECK (role IN ('user', 'advertiser', 'admin')),
    membership_tier VARCHAR(30) DEFAULT 'Free' CHECK (membership_tier IN ('Free', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
    referral_code VARCHAR(30) UNIQUE NOT NULL,
    referred_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    kyc_level VARCHAR(30) DEFAULT 'none' CHECK (kyc_level IN ('none', 'basic', 'advanced')),
    kyc_status VARCHAR(30) DEFAULT 'unsubmitted' CHECK (kyc_status IN ('unsubmitted', 'pending', 'approved', 'rejected')),
    pin_hash VARCHAR(255),
    avatar_url VARCHAR(255),
    streak_count INTEGER DEFAULT 0,
    last_check_in DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wallets for balances
CREATE TABLE wallets (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (pending_balance >= 0),
    referral_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (referral_balance >= 0),
    bonus_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (bonus_balance >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions Statement History
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer_send', 'transfer_receive', 'task_earning', 'offer_earning', 'referral_bonus', 'membership_upgrade', 'airtime_cashback', 'bill_payment', 'savings_deposit', 'savings_withdraw')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(15, 2) DEFAULT 0.00 CHECK (fee >= 0),
    currency VARCHAR(10) DEFAULT 'NGN',
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    reference VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    recipient_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Savings Goal Vaults
CREATE TABLE saving_goals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    saved_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (saved_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Advertiser Campaigns (funded tasks marketplace)
CREATE TABLE campaigns (
    id VARCHAR(50) PRIMARY KEY,
    advertiser_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    reward_value NUMERIC(15, 2) NOT NULL CHECK (reward_value > 0),
    total_budget NUMERIC(15, 2) NOT NULL CHECK (total_budget > 0),
    remaining_budget NUMERIC(15, 2) NOT NULL CHECK (remaining_budget >= 0),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    time_required VARCHAR(50),
    difficulty VARCHAR(30) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    creative_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Task Proof Submissions
CREATE TABLE task_submissions (
    id VARCHAR(50) PRIMARY KEY,
    campaign_id VARCHAR(50) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_proof TEXT NOT NULL,
    proof_type VARCHAR(30) DEFAULT 'text' CHECK (proof_type IN ('text', 'screenshot')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'verified_ai', 'approved', 'rejected')),
    ai_feedback TEXT,
    reviewed_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Platform CPA Offers config (CPAlead, Lootably, Wannads etc)
CREATE TABLE offers (
    id VARCHAR(50) PRIMARY KEY,
    network VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reward_amount NUMERIC(15, 2) NOT NULL CHECK (reward_amount > 0),
    estimated_time VARCHAR(50),
    difficulty VARCHAR(30) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category VARCHAR(100) NOT NULL,
    offer_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CPA Offerwall Completions
CREATE TABLE offer_completions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_id VARCHAR(50) NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    network VARCHAR(50) NOT NULL,
    amount_ngn NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Community Chat Forum Messages
CREATE TABLE community_messages (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    userName VARCHAR(150),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Customer Support Channels
CREATE TABLE support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender VARCHAR(30) CHECK (sender IN ('user', 'agent')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Achievements
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bonus_claimed BOOLEAN DEFAULT FALSE,
    bonus_amount NUMERIC(15, 2) DEFAULT 0.00
);


-- DATABASE INDEXES FOR HIGH-SPEED QUERY PERFORMANCE

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral ON users(referral_code);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_submissions_user ON task_submissions(user_id);
CREATE INDEX idx_submissions_campaign ON task_submissions(campaign_id);
CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);


-- TRIGGER FOR WALLET SYNC ON USER CREATION

CREATE OR REPLACE FUNCTION initialize_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, available_balance, pending_balance, referral_balance, bonus_balance)
    VALUES (NEW.id, 0.00, 0.00, 0.00, 0.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_after_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_wallet();
