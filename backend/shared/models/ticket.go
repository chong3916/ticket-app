package models

import (
	"github.com/google/uuid"
	"time"
)

type Ticket struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id" db:"workspace_id"`
	CreatorID   uuid.UUID  `json:"creator_id" db:"creator_id"`
	AssigneeID  *uuid.UUID `json:"assignee_id" db:"assignee_id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	Priority    string     `json:"priority" db:"priority"`
	Status      string     `json:"status" db:"status"`
	Tags        []string   `json:"tags" db:"tags"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}
