package services

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type BoardService struct {
	Repo *db.BoardRepository
}

func NewBoardService(repo *db.BoardRepository) *BoardService {
	return &BoardService{Repo: repo}
}

func (s *BoardService) CreateDefaultBoard(ctx context.Context, workspaceID uuid.UUID) (models.Board, error) {
	defaultBoard := models.Board{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		Name:        "Main Board",
		Columns: []models.BoardColumn{
			{Name: "To Do", StatusKey: "todo"},
			{Name: "In Progress", StatusKey: "in_progress"},
			{Name: "Done", StatusKey: "done"},
		},
	}
	return s.Repo.CreateDefaultBoard(ctx, defaultBoard)
}

func (s *BoardService) CreateDefaultBoardTx(ctx context.Context, tx pgx.Tx, workspaceID uuid.UUID) (models.Board, error) {
	defaultBoard := models.Board{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		Name:        "Main Board",
		Columns: []models.BoardColumn{
			{Name: "To Do", StatusKey: "todo"},
			{Name: "In Progress", StatusKey: "in_progress"},
			{Name: "Done", StatusKey: "done"},
		},
	}
	return s.Repo.CreateDefaultBoardTx(ctx, tx, defaultBoard)
}
