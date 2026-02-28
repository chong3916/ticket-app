package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type WorkspaceService struct {
	Repo *db.WorkspaceRepository
}

func NewWorkspaceService(repo *db.WorkspaceRepository) *WorkspaceService {
	return &WorkspaceService{Repo: repo}
}

func (s *WorkspaceService) CreateNewWorkspace(ctx context.Context, name string, creatorID uuid.UUID) (models.Workspace, error) {
	if name == "" {
		return models.Workspace{}, errors.New("workspace name is required")
	}
	return s.Repo.CreateWorkspaceWithMember(ctx, name, creatorID)
}

func (s *WorkspaceService) GetUserWorkspaces(ctx context.Context, userID uuid.UUID) ([]models.Workspace, error) {
	return s.Repo.GetUserWorkspaces(ctx, userID)
}

func (s *WorkspaceService) GetWorkspaceMembers(ctx context.Context, workspaceID uuid.UUID, requestingUserID uuid.UUID) ([]models.User, error) {
	isMember, err := s.Repo.IsMember(ctx, workspaceID, requestingUserID)
	if err != nil || !isMember {
		return nil, errors.New("forbidden: you cannot view members of this workspace")
	}

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
