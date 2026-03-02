package db

import (
	"context"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type InvitationRepository struct {
	db *pgxpool.Pool
}

func NewInvitationRepository(pool *pgxpool.Pool) *InvitationRepository {
	return &InvitationRepository{db: pool}
}

func (r *InvitationRepository) CreateInvitation(ctx context.Context, workspaceID, inviterID uuid.UUID, email, token string) error {
	query := `
		INSERT INTO workspace_invitations (workspace_id, invited_by, email, token, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // Expires in 7 days
	_, err := r.db.Exec(ctx, query, workspaceID, inviterID, email, token, expiresAt)
	return err
}

func (r *InvitationRepository) GetByToken(ctx context.Context, token string) (uuid.UUID, string, error) {
	var workspaceID uuid.UUID
	var email string
	query := `SELECT workspace_id, email FROM workspace_invitations WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`
	err := r.db.QueryRow(ctx, query, token).Scan(&workspaceID, &email)
	return workspaceID, email, err
}

func (r *InvitationRepository) MarkAsAccepted(ctx context.Context, token string) error {
	query := `UPDATE workspace_invitations SET status = 'accepted' WHERE token = $1`
	_, err := r.db.Exec(ctx, query, token)
	return err
}
