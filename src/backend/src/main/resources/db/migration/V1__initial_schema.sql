-- ====================================================================
-- V1__initial_schema.sql
-- Premium Enterprise Insurance App Initial Database Migration Schema
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS agent (
    agent_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    specialization VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS surveyor (
    surveyor_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    department VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS policies (
    policy_id BIGSERIAL PRIMARY KEY,
    policy_number VARCHAR(255) UNIQUE,
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    premium_amount DOUBLE PRECISION NOT NULL,
    duration INTEGER NOT NULL,
    policy_status VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    coverage_amount DOUBLE PRECISION,
    customer_id BIGINT REFERENCES customer(customer_id),
    agent_id BIGINT REFERENCES agent(agent_id)
);

CREATE TABLE IF NOT EXISTS claims (
    claim_id BIGSERIAL PRIMARY KEY,
    claim_number VARCHAR(255) NOT NULL,
    claim_amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    incident_date DATE,
    incident_location VARCHAR(255),
    approved_amount DOUBLE PRECISION,
    assessment_notes TEXT,
    customer_id BIGINT REFERENCES customer(customer_id),
    policy_id BIGINT REFERENCES policies(policy_id),
    surveyor_id BIGINT REFERENCES surveyor(surveyor_id)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE,
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(100),
    payment_date DATE,
    payment_status VARCHAR(50),
    description VARCHAR(255),
    customer_id BIGINT REFERENCES customer(customer_id),
    policy_id BIGINT REFERENCES policies(policy_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    description VARCHAR(500),
    timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_policies_customer ON policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_policies_agent ON policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_customer ON claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_surveyor ON claims(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_policy ON payments(policy_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);
