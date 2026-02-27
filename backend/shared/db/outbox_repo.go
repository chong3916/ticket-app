package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OutboxRepository struct {
	db *pgxpool.Pool
}

func NewOutboxRepository(pool *pgxpool.Pool) *OutboxRepository {
	return &OutboxRepository{db: pool}
}

func (r *OutboxRepository) GetPendingTasks(ctx context.Context) ([]models.Outbox, error) {
	query := `
		SELECT id, payload, event_type 
		FROM outbox 
		WHERE status = 'pending' LIMIT 10
   `
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Outbox
	for rows.Next() {
		var t models.Outbox
		err := rows.Scan(&t.ID, &t.Payload, &t.EventType, &t.Status, &t.CreatedAt)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (r *OutboxRepository) MarkAsProcessed(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE outbox SET status = 'processed' WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
