package models

import "time"
import "github.com/google/uuid"

type User struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password_hash"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type UserIdentity struct {
	ID            uuid.UUID `json:"id" db:"id"`
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	ProviderName  string    `json:"provider_name" db:"provider_name"`
	ProviderID    string    `json:"provider_id" db:"provider_id"`
	ProviderEmail string    `json:"provider_email" db:"provider_email"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type WorkspaceMember struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}
