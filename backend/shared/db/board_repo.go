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

func (r *BoardRepository) AddColumn(ctx context.Context, boardID uuid.UUID, name string, statusKey string) (models.BoardColumn, error) {
	var col models.BoardColumn
	query := `
        INSERT INTO board_columns (board_id, name, status_key, position)
        VALUES ($1, $2, $3, (SELECT COALESCE(MAX(position) + 1, 0) FROM board_columns WHERE board_id = $1))
        RETURNING id, board_id, name, status_key, position
    `
	err := r.db.QueryRow(ctx, query, boardID, name, statusKey).Scan(
		&col.ID, &col.BoardID, &col.Name, &col.StatusKey, &col.Position,
	)
	return col, err
}

func (r *BoardRepository) RemoveColumn(ctx context.Context, boardID uuid.UUID, statusKey string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	ticketDeleteQuery := `
        DELETE FROM tickets 
        WHERE status = $1 
        AND workspace_id = (SELECT workspace_id FROM boards WHERE id = $2)
    `
	_, err = tx.Exec(ctx, ticketDeleteQuery, statusKey, boardID)
	if err != nil {
		return fmt.Errorf("failed to delete associated tickets: %w", err)
	}

	columnDeleteQuery := `
        DELETE FROM board_columns 
        WHERE status_key = $1 AND board_id = $2
    `
	result, err := tx.Exec(ctx, columnDeleteQuery, statusKey, boardID)
	if err != nil {
		return fmt.Errorf("failed to delete board column: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("no column found with status_key %s for board %s", statusKey, boardID)
	}

	return tx.Commit(ctx)
}

func (r *BoardRepository) UpdateColumn(ctx context.Context, columnID uuid.UUID, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	query := `UPDATE board_columns SET `
	args := []interface{}{}
	i := 1

	for key, val := range updates {
		query += fmt.Sprintf("%s = $%d, ", key, i)
		args = append(args, val)
		i++
	}

	query = query[:len(query)-2] + fmt.Sprintf(" WHERE id = $%d", i)
	args = append(args, columnID)

	result, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("no column found with ID %s", columnID)
	}

	return nil
}

func (r *BoardRepository) ReorderColumns(ctx context.Context, boardID uuid.UUID, columnPositions map[uuid.UUID]int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for id, pos := range columnPositions {
		tempPos := -(pos + 1)
		_, err := tx.Exec(ctx, `UPDATE board_columns SET position = $1 WHERE id = $2 AND board_id = $3`, tempPos, id, boardID)
		if err != nil {
			return err
		}
	}

	for id, pos := range columnPositions {
		_, err := tx.Exec(ctx, `UPDATE board_columns SET position = $1 WHERE id = $2 AND board_id = $3`, pos, id, boardID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
