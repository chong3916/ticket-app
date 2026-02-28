package db

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TicketRepository struct {
	db *pgxpool.Pool
}

func NewTicketRepository(pool *pgxpool.Pool) *TicketRepository {
	return &TicketRepository{db: pool}
}

func (r *TicketRepository) CreateTicket(ctx context.Context, ticket models.Ticket) (models.Ticket, error) {
	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Ticket{}, err
	}
	// Defer a rollback in case something fails mid-way
	defer tx.Rollback(ctx)

	// Insert
	ticketQuery := `
	   INSERT INTO tickets (workspace_id, creator_id, assignee_id, title, description, priority, status, tags) 
	   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
	   RETURNING id, workspace_id, creator_id, assignee_id, title, description, priority, status, tags, created_at, updated_at
	`
	err = tx.QueryRow(ctx, ticketQuery, ticket.WorkspaceID, ticket.CreatorID, ticket.AssigneeID, ticket.Title, ticket.Description, ticket.Priority, ticket.Status, ticket.Tags).
		Scan(
			&ticket.ID, &ticket.WorkspaceID, &ticket.CreatorID, &ticket.AssigneeID, &ticket.Title,
			&ticket.Description, &ticket.Priority, &ticket.Status, &ticket.Tags,
			&ticket.CreatedAt, &ticket.UpdatedAt,
		)

	if err != nil {
		return models.Ticket{}, err
	}

	// Insert into Outbox
	outboxQuery := `
		INSERT INTO outbox (payload, event_type) 
		VALUES ($1, $2)
	`
	_, err = tx.Exec(ctx, outboxQuery, ticket, "ticket_created")
	if err != nil {
		return models.Ticket{}, err
	}

	// Commit everything
	err = tx.Commit(ctx)
	if err != nil {
		return models.Ticket{}, err
	}

	return ticket, nil
}

func (r *TicketRepository) GetCreatorTicket(ctx context.Context, creatorID uuid.UUID) ([]models.Ticket, error) {
	tickets := []models.Ticket{}

	query := `
	   SELECT id, workspace_id, creator_id, assignee_id, title, description, priority, status, tags, created_at, updated_at 
	   FROM tickets
	   WHERE creator_id = $1
	   ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var t models.Ticket
		err := rows.Scan(
			&t.ID,
			&t.WorkspaceID,
			&t.CreatorID,
			&t.AssigneeID,
			&t.Title,
			&t.Description,
			&t.Priority,
			&t.Status,
			&t.Tags,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, t)
	}

	// Check for errors encountered during iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return tickets, nil
}

func (r *TicketRepository) UpdateTicketStatus(ctx context.Context, ticketID uuid.UUID, userID uuid.UUID, status string) error {
	query := `
        UPDATE tickets 
        SET status = $1, updated_at = NOW()
        WHERE id = $2 
    `
	result, err := r.db.Exec(ctx, query, status, ticketID)
	if err != nil {
		return err
	}

	// Check if any row was actually updated
	if result.RowsAffected() == 0 {
		return errors.New("ticket not found or unauthorized")
	}

	return nil
}
