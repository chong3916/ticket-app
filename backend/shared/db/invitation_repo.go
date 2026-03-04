package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
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

func (r *InvitationRepository) CreateInvitation(ctx context.Context, workspaceID, inviterID uuid.UUID, email, token string, role string) error {
	query := `
       INSERT INTO workspace_invitations (workspace_id, invited_by, email, token, expires_at, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       ON CONFLICT (workspace_id, email) WHERE status = 'pending' 
       DO UPDATE SET 
          token = EXCLUDED.token,
          role = EXCLUDED.role,
          invited_by = EXCLUDED.invited_by,
          expires_at = EXCLUDED.expires_at,
          created_at = NOW()
    `
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // Expires in 7 days
	_, err := r.db.Exec(ctx, query, workspaceID, inviterID, email, token, expiresAt)
	return err
}

func (r *InvitationRepository) GetByToken(ctx context.Context, token string) (uuid.UUID, string, string, error) {
	var workspaceID uuid.UUID
	var email string
	var role string
	query := `SELECT workspace_id, email, role FROM workspace_invitations WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`
	err := r.db.QueryRow(ctx, query, token).Scan(&workspaceID, &email, &role)
	return workspaceID, email, role, err
}

func (r *InvitationRepository) MarkAsAccepted(ctx context.Context, token string) error {
	query := `UPDATE workspace_invitations SET status = 'accepted' WHERE token = $1`
	_, err := r.db.Exec(ctx, query, token)
	return err
}

func (r *InvitationRepository) GetPendingByEmail(ctx context.Context, email string) ([]models.InvitationView, error) {
	query := `
        SELECT i.id, i.token, w.name, u.username
        FROM workspace_invitations i
        JOIN workspaces w ON i.workspace_id = w.id
        JOIN users u ON i.invited_by = u.id
        WHERE i.email = $1 AND i.status = 'pending' AND i.expires_at > NOW()
    `

	rows, err := r.db.Query(ctx, query, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invites []models.InvitationView
	for rows.Next() {
		var iv models.InvitationView
		if err := rows.Scan(&iv.ID, &iv.Token, &iv.WorkspaceName, &iv.InviterName); err != nil {
			return nil, err
		}
		invites = append(invites, iv)
	}
	return invites, nil
}
