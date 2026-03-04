package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type WorkspaceService struct {
	Repo         *db.WorkspaceRepository
	BoardService *BoardService
}

func NewWorkspaceService(repo *db.WorkspaceRepository, boardSvc *BoardService) *WorkspaceService {
	return &WorkspaceService{
		Repo:         repo,
		BoardService: boardSvc,
	}
}

func (s *WorkspaceService) CreateNewWorkspace(ctx context.Context, name string, creatorID uuid.UUID) (models.Workspace, error) {
	if name == "" {
		return models.Workspace{}, errors.New("workspace name is required")
	}
	tx, err := s.Repo.GetPool().Begin(ctx)
	if err != nil {
		return models.Workspace{}, err
	}
	defer tx.Rollback(ctx)

	ws, err := s.Repo.CreateWorkspaceWithMemberTx(ctx, tx, name, creatorID)
	if err != nil {
		return models.Workspace{}, err
	}

	_, err = s.BoardService.CreateDefaultBoardTx(ctx, tx, ws.ID)
	if err != nil {
		return ws, fmt.Errorf("workspace created but failed to setup board: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return models.Workspace{}, err
	}

	return ws, nil
}

func (s *WorkspaceService) GetUserWorkspaces(ctx context.Context, userID uuid.UUID) ([]models.Workspace, error) {
	return s.Repo.GetUserWorkspaces(ctx, userID)
}

func (s *WorkspaceService) GetWorkspaceMembers(ctx context.Context, workspaceID uuid.UUID) ([]models.WorkspaceMember, error) {
	return s.Repo.GetWorkspaceMembers(ctx, workspaceID)
}

func (s *WorkspaceService) InviteMember(ctx context.Context, workspaceID, adminID uuid.UUID, targetEmail string) error {
	// Check the requester is an admin of workspace
	role, err := s.Repo.GetUserWorkspaceRole(ctx, workspaceID, adminID)

	if err != nil || role != "admin" {
		return errors.New("forbidden: only admins can invite members")
	}

	// Add the member
	return s.Repo.AddMemberByEmail(ctx, workspaceID, targetEmail, "member")
}

func (s *WorkspaceService) RemoveMember(ctx context.Context, workspaceID, userID uuid.UUID) error {
	// TODO: prevent deletion of last admin (if last admin is being deleted, ask to delete workspace instead)
	return s.Repo.RemoveMember(ctx, workspaceID, userID)
}

func (s *WorkspaceService) UpdateMemberRole(ctx context.Context, workspaceID, userID uuid.UUID, role string) error {
	return s.Repo.UpdateMemberRole(ctx, workspaceID, userID, role)
}
