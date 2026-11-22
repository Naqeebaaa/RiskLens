CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL,
    transaction_id TEXT NOT NULL REFERENCES transactions(id),

    risk_score INTEGER NOT NULL
        CHECK (risk_score BETWEEN 30 AND 100),

    risk_level VARCHAR(20) NOT NULL
        CHECK (risk_level IN ('MEDIUM', 'HIGH', 'CRITICAL')),

    triggered_rules TEXT[] NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'NEW'
        CHECK (status IN ('NEW', 'INVESTIGATING', 'CLOSED')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_account_transaction_alert
        UNIQUE (account_id, transaction_id)
);