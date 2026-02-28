package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type TicketService struct {
	TicketRepo    *db.TicketRepository
	WorkspaceRepo *db.WorkspaceRepository
}

func NewTicketService(ticketRepo *db.TicketRepository, wsRepo *db.WorkspaceRepository) *TicketService {
	return &TicketService{
		TicketRepo:    ticketRepo,
		WorkspaceRepo: wsRepo,
	}
}

func (s *TicketService) CreateTicket(ctx context.Context, workspaceID uuid.UUID, creatorID uuid.UUID, assigneeID uuid.UUID, title string, description string, priority string, tags []string) (models.Ticket, error) {
	isMember, err := s.WorkspaceRepo.IsMember(ctx, workspaceID, creatorID)
	if err != nil {
		return models.Ticket{}, err
	}
	if !isMember {
		return models.Ticket{}, errors.New("forbidden: you do not have access to this workspace")
	}

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

	result, err := s.TicketRepo.CreateTicket(ctx, todo)
	if err != nil {
		return models.Ticket{}, err
	}

	return result, nil
}

func (s *TicketService) GetCreatorTicket(ctx context.Context, userID uuid.UUID) ([]models.Ticket, error) {
	result, err := s.TicketRepo.GetCreatorTicket(ctx, userID)
	if err != nil {
		return []models.Ticket{}, err
	}

	return result, nil
}

func (s *TicketService) UpdateTicketStatus(ctx context.Context, ticketID uuid.UUID, userID uuid.UUID, status string) error {
	return s.TicketRepo.UpdateTicketStatus(ctx, ticketID, userID, status)
}

func (s *TicketService) GetWorkspaceTickets(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID) ([]models.Ticket, error) {
	// Check permission
	isMember, err := s.WorkspaceRepo.IsMember(ctx, workspaceID, userID)
	if err != nil || !isMember {
		return nil, errors.New("forbidden")
	}

	return s.TicketRepo.GetWorkspaceTickets(ctx, workspaceID)
}
