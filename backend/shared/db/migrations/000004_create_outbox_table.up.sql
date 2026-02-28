CREATE TABLE IF NOT EXISTS outbox (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload     JSONB NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    event_type  TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);