CREATE TABLE IF NOT EXISTS workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    role         TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE workspace_invitations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email        VARCHAR(255) NOT NULL,
    token        VARCHAR(255) NOT NULL UNIQUE,
    invited_by   UUID NOT NULL REFERENCES users(id),
    role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    status       VARCHAR(20) DEFAULT 'pending',
    expires_at   TIMESTAMP NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON workspace_invitations(token);
CREATE INDEX idx_invitation_email ON workspace_invitations(email);

CREATE UNIQUE INDEX idx_unique_pending_invitation
    ON workspace_invitations (workspace_id, email)
    WHERE status = 'pending';