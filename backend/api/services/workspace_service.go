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
