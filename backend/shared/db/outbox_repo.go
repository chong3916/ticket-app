package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OutboxRepository struct {
	db *pgxpool.Pool
}

func NewOutboxRepository(pool *pgxpool.Pool) *OutboxRepository {
	return &OutboxRepository{db: pool}
}

func (r *OutboxRepository) CreateOutbox(ctx context.Context, todo models.Todo) error {
	// Your SQLC or manual pgx logic goes here
	return nil
}
