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

func (r *TodoRepository) CreateTodo(ctx context.Context, todo models.Todo) error {
	// Your SQLC or manual pgx logic goes here
	return nil
}
