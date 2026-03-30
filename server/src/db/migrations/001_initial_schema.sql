-- ====================================
-- AdiPay Database Schema (Neon.tech)
-- ====================================

-- Users Table (from SRS + enhancements)
CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_color VARCHAR(7) DEFAULT '#4285F4',   -- For initials-based avatar
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (from SRS)
CREATE TABLE accounts (
    account_id  SERIAL PRIMARY KEY,
    user_id     INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance     DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (from SRS + enhancements)
CREATE TABLE transactions (
    transaction_id   SERIAL PRIMARY KEY,
    reference_no     VARCHAR(50) UNIQUE NOT NULL,
    sender_id        INTEGER REFERENCES accounts(account_id),
    receiver_id      INTEGER REFERENCES accounts(account_id),
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('TRANSFER', 'CREDIT', 'DEBIT')
    ),
    status           VARCHAR(20) DEFAULT 'COMPLETED' CHECK (
        status IN ('COMPLETED', 'FAILED', 'PENDING')
    ),
    description      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
