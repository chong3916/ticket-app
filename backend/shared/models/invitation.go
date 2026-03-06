package models

import (
	"github.com/google/uuid"
	"time"
)

type Invitation struct {
	ID          uuid.UUID `json:"id" db:"id"`
	WorkspaceID uuid.UUID `json:"workspace_id" db:"workspace_id"`
	Email       string    `json:"email" db:"email"`
	Token       string    `json:"token" db:"token"`
	InvitedBy   uuid.UUID `json:"invited_by" db:"invited_by"`
	Role        string    `json:"role" db:"role"`
	Status      string    `json:"status" db:"status"`
	ExpiresAt   time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type InvitationView struct {
	ID            uuid.UUID `json:"id"`
	Token         string    `json:"token"`
	WorkspaceName string    `json:"workspace_name"`
	InviterName   string    `json:"inviter_name"`
}
