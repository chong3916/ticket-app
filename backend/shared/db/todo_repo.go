package db

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TodoRepository struct {
	db *pgxpool.Pool
}

func NewTodoRepository(pool *pgxpool.Pool) *TodoRepository {
	return &TodoRepository{db: pool}
}

func (r *TodoRepository) CreateTodo(ctx context.Context, todo models.Todo) (models.Todo, error) {
	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Todo{}, err
	}
	// Defer a rollback in case something fails mid-way
	defer tx.Rollback(ctx)

	// Insert
	todoQuery := `
		INSERT INTO todos (user_id, title, status) 
		VALUES ($1, $2, $3) RETURNING id, status, created_at, updated_at
   `
	err = tx.QueryRow(ctx, todoQuery, todo.UserID, todo.Title, todo.Status).
		Scan(&todo.ID, &todo.Status, &todo.CreatedAt, &todo.UpdatedAt)
	if err != nil {
		return models.Todo{}, err
	}

	// Insert into Outbox
	outboxQuery := `
		INSERT INTO outbox (payload, event_type) 
		VALUES ($1, $2)
	`
	_, err = tx.Exec(ctx, outboxQuery, todo, "todo_created")
	if err != nil {
		return models.Todo{}, err
	}

	// Commit everything
	err = tx.Commit(ctx)
	if err != nil {
		return models.Todo{}, err
	}

	return todo, nil
}

func (r *TodoRepository) GetUserTodo(ctx context.Context, userID uuid.UUID) ([]models.Todo, error) {
	todos := []models.Todo{}

	query := `
       SELECT id, user_id, title, status, created_at, updated_at 
       FROM todos
       WHERE user_id = $1
       ORDER BY created_at DESC
    `

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var t models.Todo
		err := rows.Scan(
			&t.ID,
			&t.UserID,
			&t.Title,
			&t.Status,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		todos = append(todos, t)
	}

	// Check for errors encountered during iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return todos, nil
}

func (r *TodoRepository) UpdateTodoStatus(ctx context.Context, todoID uuid.UUID, userID uuid.UUID, status string) error {
	query := `
        UPDATE todos 
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
    `
	result, err := r.db.Exec(ctx, query, status, todoID, userID)
	if err != nil {
		return err
	}

	// Check if any row was actually updated
	if result.RowsAffected() == 0 {
		return errors.New("todo not found or unauthorized")
	}

	return nil
}
