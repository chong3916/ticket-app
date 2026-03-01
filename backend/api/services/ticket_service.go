package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type TicketService struct {
	TicketRepo    *db.TicketRepository
	WorkspaceRepo *db.WorkspaceRepository
	BoardRepo     *db.BoardRepository
}

func NewTicketService(ticketRepo *db.TicketRepository, wsRepo *db.WorkspaceRepository, boardRepo *db.BoardRepository) *TicketService {
	return &TicketService{
		TicketRepo:    ticketRepo,
		WorkspaceRepo: wsRepo,
		BoardRepo:     boardRepo,
	}
}

func (s *TicketService) CreateTicket(ctx context.Context, workspaceID uuid.UUID, creatorID uuid.UUID, assigneeID uuid.UUID, title string, description string, status string, priority string, tags []string) (models.Ticket, error) {
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

	board, err := s.BoardRepo.GetWorkspaceBoard(ctx, workspaceID)
	if err != nil {
		return models.Ticket{}, errors.New("could not find board configuration for this workspace")
	}

	finalStatus := status
	if finalStatus == "" {
		if len(board.Columns) == 0 {
			finalStatus = "todo"
		} else {
			finalStatus = board.Columns[0].StatusKey
		}
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
		Status:      finalStatus,
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

func (s *TicketService) UpdateTicket(ctx context.Context, ticketID uuid.UUID, userID uuid.UUID, updates map[string]interface{}) error {
	workspaceID, err := s.TicketRepo.GetTicketWorkspaceID(ctx, ticketID)
	if err != nil {
		return errors.New("ticket not found")
	}

	if status, ok := updates["status"].(string); ok {
		board, err := s.BoardRepo.GetWorkspaceBoard(ctx, workspaceID)
		if err != nil {
			return errors.New("failed to fetch board configuration for this ticket")
		}

		isValid := false
		for _, col := range board.Columns {
			if col.StatusKey == status {
				isValid = true
				break
			}
		}

		if !isValid {
			return fmt.Errorf("invalid status: '%s' does not exist on this board", status)
		}
	}

	return s.TicketRepo.UpdateTicket(ctx, ticketID, userID, updates)
}

func (s *TicketService) GetWorkspaceTickets(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID) ([]models.Ticket, error) {
	// Check permission
	isMember, err := s.WorkspaceRepo.IsMember(ctx, workspaceID, userID)
	if err != nil || !isMember {
		return nil, errors.New("forbidden")
	}

	return s.TicketRepo.GetWorkspaceTickets(ctx, workspaceID)
}
