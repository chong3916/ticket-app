package db

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkspaceRepository struct {
	db *pgxpool.Pool
}

func NewWorkspaceRepository(pool *pgxpool.Pool) *WorkspaceRepository {
	return &WorkspaceRepository{db: pool}
}

func (r *WorkspaceRepository) GetPool() *pgxpool.Pool {
	return r.db
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
	role, err := r.GetUserWorkspaceRole(ctx, workspaceID, userID)
	if err != nil {
		if err.Error() == "user is not a member of this workspace" {
			return false, nil
		}
		return false, err
	}
	return role != "", nil
}

func (r *WorkspaceRepository) GetUserWorkspaces(ctx context.Context, userID uuid.UUID) ([]models.Workspace, error) {
	workspaces := []models.Workspace{}

	query := `
       SELECT w.id, w.name, w.created_at, w.updated_at 
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1
       ORDER BY w.name ASC
    `

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var w models.Workspace
		err := rows.Scan(&w.ID, &w.Name, &w.CreatedAt, &w.UpdatedAt)
		if err != nil {
			return nil, err
		}
		workspaces = append(workspaces, w)
	}

	return workspaces, nil
}

func (r *WorkspaceRepository) GetWorkspaceMembers(ctx context.Context, workspaceID uuid.UUID) ([]models.User, error) {
	members := []models.User{}

	query := `
       SELECT u.id, u.email, u.username, u.created_at
       FROM users u
       JOIN workspace_members wm ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY u.username ASC
    `

	rows, err := r.db.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.ID, &u.Email, &u.Username, &u.CreatedAt)
		if err != nil {
			return nil, err
		}
		members = append(members, u)
	}

	return members, nil
}

func (r *WorkspaceRepository) AddMemberByEmail(ctx context.Context, workspaceID uuid.UUID, email string, role string) error {
	var userID uuid.UUID
	userQuery := `SELECT id FROM users WHERE email = $1`
	err := r.db.QueryRow(ctx, userQuery, email).Scan(&userID)
	if err != nil {
		return errors.New("user with this email does not exist")
	}

	memberQuery := `
        INSERT INTO workspace_members (workspace_id, user_id, role) 
        VALUES ($1, $2, $3)
        ON CONFLICT (workspace_id, user_id) DO NOTHING
    `
	_, err = r.db.Exec(ctx, memberQuery, workspaceID, userID, role)
	return err
}

func (r *WorkspaceRepository) AddMemberByID(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID, role string) error {
	memberQuery := `
        INSERT INTO workspace_members (workspace_id, user_id, role) 
        VALUES ($1, $2, $3)
        ON CONFLICT (workspace_id, user_id) DO NOTHING
    `
	_, err := r.db.Exec(ctx, memberQuery, workspaceID, userID, role)
	return err
}

func (r *WorkspaceRepository) GetUserWorkspaceRole(ctx context.Context, workspaceID, userID uuid.UUID) (string, error) {
	var role string
	query := `
       SELECT role 
       FROM workspace_members 
       WHERE workspace_id = $1 AND user_id = $2
    `
	err := r.db.QueryRow(ctx, query, workspaceID, userID).Scan(&role)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", errors.New("user is not a member of this workspace")
		}
		return "", err
	}

	return role, nil
}

func (r *WorkspaceRepository) CreateWorkspaceWithMemberTx(ctx context.Context, tx pgx.Tx, name string, userID uuid.UUID) (models.Workspace, error) {
	var ws models.Workspace
	wsQuery := `INSERT INTO workspaces (name) VALUES ($1) RETURNING id, name, created_at, updated_at`

	err := tx.QueryRow(ctx, wsQuery, name).Scan(&ws.ID, &ws.Name, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		return models.Workspace{}, err
	}

	memberQuery := `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)`
	_, err = tx.Exec(ctx, memberQuery, ws.ID, userID, "admin")

	return ws, err
}
