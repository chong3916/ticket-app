package models

import (
	"encoding/json"
	"github.com/google/uuid"
	"time"
)

type Outbox struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	EventType string          `json:"event_type" db:"event_type"`
	Payload   json.RawMessage `json:"payload" db:"payload"`
	Status    string          `json:"status" db:"status"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
}
