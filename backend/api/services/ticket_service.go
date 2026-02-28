package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type TicketService struct {
	Repo *db.TicketRepository
}

func NewTicketService(repo *db.TicketRepository) *TicketService {
	return &TicketService{Repo: repo}
}

func (s *TicketService) CreateTicket(ctx context.Context, workspaceID uuid.UUID, creatorID uuid.UUID, assigneeID uuid.UUID, title string, description string, priority string, tags []string) (models.Ticket, error) {
	if title == "" {
		return models.Ticket{}, errors.New("title cannot be empty")
	}
	if priority == "" {
		priority = "medium"
	}
	if tags == nil {
		tags = []string{}
	}

	var assigneePtr *uuid.UUID
	if assigneeID != uuid.Nil {
		assigneePtr = &assigneeID
	}

	todo := models.Ticket{
		WorkspaceID: workspaceID,
		CreatorID:   creatorID,
		AssigneeID:  assigneePtr,
		Title:       title,
		Description: description,
		Status:      "open", // Default status
		Priority:    priority,
		Tags:        tags,
	}

	result, err := s.Repo.CreateTicket(ctx, todo)
	if err != nil {
		return models.Ticket{}, err
	}

	return result, nil
}

func (s *TicketService) GetCreatorTicket(ctx context.Context, userID uuid.UUID) ([]models.Ticket, error) {
	result, err := s.Repo.GetCreatorTicket(ctx, userID)
	if err != nil {
		return []models.Ticket{}, err
	}

	return result, nil
}

func (s *TicketService) UpdateTicketStatus(ctx context.Context, ticketID uuid.UUID, userID uuid.UUID, status string) error {
	return s.Repo.UpdateTicketStatus(ctx, ticketID, userID, status)
}
