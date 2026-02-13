CREATE TABLE reconciliation_entries (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES daily_reports(id),

    transaction_id UUID NULL REFERENCES transactions(id),
    agent_collection_id UUID NULL REFERENCES agent_collections(id),
    bank_deposit_id UUID NULL REFERENCES bank_deposits(id),

    expected_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) NOT NULL,

    status VARCHAR(20) NOT NULL CHECK (status IN (
        'matched',
        'pending',
        'discrepancy'
    )),

    discrepancy_amount DECIMAL(12,2) GENERATED ALWAYS AS (actual_amount - expected_amount) STORED,

    notes TEXT NULL,

    created_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID NULL REFERENCES users(id),
    approved_by UUID NULL REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
