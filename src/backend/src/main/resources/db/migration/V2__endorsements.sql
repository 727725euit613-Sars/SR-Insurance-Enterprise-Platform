CREATE TABLE IF NOT EXISTS endorsements (
    endorsement_id BIGSERIAL PRIMARY KEY,
    endorsement_number VARCHAR(255) NOT NULL UNIQUE,
    endorsement_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    premium_adjustment DOUBLE PRECISION NOT NULL DEFAULT 0,
    effective_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    approved_by VARCHAR(255),
    created_at DATE NOT NULL,
    old_value VARCHAR(500),
    new_value VARCHAR(500),
    policy_id BIGINT NOT NULL REFERENCES policies(policy_id),
    customer_id BIGINT REFERENCES customer(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_endorsements_policy ON endorsements(policy_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_customer ON endorsements(customer_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_status ON endorsements(status);
