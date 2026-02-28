CREATE TABLE IF NOT EXISTS workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);