package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TodoRepository struct {
	db *pgxpool.Pool
}

func NewTodoRepository(pool *pgxpool.Pool) *TodoRepository {
	return &TodoRepository{db: pool}
}

//func (r *TodoRepository) CreateTodo(ctx context.Context, todo models.Todo) (models.Todo, error) {
//	query := `
//		INSERT INTO todos (user_id, title, status)
//       	VALUES ($1, $2, $3)
//       	RETURNING id, completed, created_at, updated_at
//	`
//
//	err := r.db.QueryRow(ctx, query,
//		todo.UserID,
//		todo.Title,
//		todo.Status,
//	).Scan(&todo.ID, &todo.Completed, &todo.CreatedAt, &todo.UpdatedAt)
//
//	if err != nil {
//		return models.Todo{}, err
//	}
//	return todo, nil
//}

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
		VALUES ($1, $2, $3) RETURNING id, completed, created_at, updated_at
   `
	err = tx.QueryRow(ctx, todoQuery, todo.UserID, todo.Title, todo.Status).
		Scan(&todo.ID, &todo.Completed, &todo.CreatedAt, &todo.UpdatedAt)
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
