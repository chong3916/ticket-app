package models

import (
	"github.com/google/uuid"
	"time"
)

type Todo struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	Status    string    `json:"status" db:"status"`
	Completed bool      `json:"completed" db:"completed"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
