package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkspaceRepository struct {
	db *pgxpool.Pool
}

func NewWorkspaceRepository(pool *pgxpool.Pool) *WorkspaceRepository {
	return &WorkspaceRepository{db: pool}
}

func (r *WorkspaceRepository) CreateWorkspaceWithMember(ctx context.Context, name string, userID uuid.UUID) (models.Workspace, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Workspace{}, err
	}
	defer tx.Rollback(ctx)

	var ws models.Workspace

	// Create workspace
	wsQuery := `
        INSERT INTO workspaces (name) 
        VALUES ($1) 
        RETURNING id, name, created_at, updated_at
    `
	err = tx.QueryRow(ctx, wsQuery, name).Scan(
		&ws.ID, &ws.Name, &ws.CreatedAt, &ws.UpdatedAt,
	)
	if err != nil {
		return models.Workspace{}, err
	}

	// Create membership (owner is admin)
	memberQuery := `
        INSERT INTO workspace_members (workspace_id, user_id, role) 
        VALUES ($1, $2, $3)
    `
	_, err = tx.Exec(ctx, memberQuery, ws.ID, userID, "admin")
	if err != nil {
		return models.Workspace{}, err
	}

	// Commit both
	if err := tx.Commit(ctx); err != nil {
		return models.Workspace{}, err
	}

	return ws, nil
}

func (r *WorkspaceRepository) IsMember(ctx context.Context, workspaceID, userID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM workspace_members 
			         WHERE workspace_id = $1 AND user_id = $2
		)
	`
	var exists bool
	err := r.db.QueryRow(ctx, query, workspaceID, userID).Scan(&exists)
	return exists, err
}
