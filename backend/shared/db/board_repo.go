package db

import (
	"context"
	"fmt"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BoardRepository struct {
	db *pgxpool.Pool
}

func NewBoardRepository(pool *pgxpool.Pool) *BoardRepository {
	return &BoardRepository{db: pool}
}

func (r *BoardRepository) CreateDefaultBoard(ctx context.Context, board models.Board) (models.Board, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Board{}, err
	}
	defer tx.Rollback(ctx)

	// Insert board
	boardQuery := `INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, $3) RETURNING id`
	err = tx.QueryRow(ctx, boardQuery, board.ID, board.WorkspaceID, board.Name).Scan(&board.ID)
	if err != nil {
		return models.Board{}, fmt.Errorf("failed to insert board: %w", err)
	}

	// Insert columns
	columnQuery := `INSERT INTO board_columns (id, board_id, name, status_key, position) VALUES ($1, $2, $3, $4, $5)`
	for i, col := range board.Columns {
		_, err = tx.Exec(ctx, columnQuery, uuid.New(), board.ID, col.Name, col.StatusKey, i)
		if err != nil {
			return models.Board{}, fmt.Errorf("failed to insert column %s: %w", col.Name, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return models.Board{}, err
	}

	return board, nil
}

func (r *BoardRepository) GetWorkspaceBoard(ctx context.Context, workspaceID uuid.UUID) (models.Board, error) {
	var board models.Board

	// Get board
	err := r.db.QueryRow(ctx,
		"SELECT id, workspace_id, name FROM boards WHERE workspace_id = $1",
		workspaceID).Scan(&board.ID, &board.WorkspaceID, &board.Name)

	if err != nil {
		return models.Board{}, err
	}

	// Get board columns
	rows, err := r.db.Query(ctx,
		"SELECT id, board_id, name, status_key, position FROM board_columns WHERE board_id = $1 ORDER BY position ASC",
		board.ID)
	if err != nil {
		return models.Board{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var col models.BoardColumn
		if err := rows.Scan(&col.ID, &col.BoardID, &col.Name, &col.StatusKey, &col.Position); err != nil {
			return models.Board{}, err
		}
		board.Columns = append(board.Columns, col)
	}

	return board, nil
}

func (r *BoardRepository) CreateDefaultBoardTx(ctx context.Context, tx pgx.Tx, board models.Board) (models.Board, error) {
	boardQuery := `INSERT INTO boards (id, workspace_id, name) VALUES ($1, $2, $3) RETURNING id`
	err := tx.QueryRow(ctx, boardQuery, board.ID, board.WorkspaceID, board.Name).Scan(&board.ID)
	if err != nil {
		return models.Board{}, err
	}

	columnQuery := `INSERT INTO board_columns (id, board_id, name, status_key, position) VALUES ($1, $2, $3, $4, $5)`
	for i, col := range board.Columns {
		_, err = tx.Exec(ctx, columnQuery, uuid.New(), board.ID, col.Name, col.StatusKey, i)
		if err != nil {
			return models.Board{}, err
		}
	}
	return board, nil
}
