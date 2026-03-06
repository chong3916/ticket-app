package services

import (
	"context"
	"errors"
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

func (s *BoardService) AddColumnByWorkspace(ctx context.Context, workspaceID uuid.UUID, name string, statusKey string) (models.BoardColumn, error) {
	board, err := s.Repo.GetWorkspaceBoard(ctx, workspaceID)
	if err != nil {
		return models.BoardColumn{}, err
	}

	return s.Repo.AddColumn(ctx, board.ID, name, statusKey)
}

func (s *BoardService) RemoveColumnByWorkspace(ctx context.Context, workspaceID uuid.UUID, statusKey string) error {
	board, err := s.Repo.GetWorkspaceBoard(ctx, workspaceID)
	if err != nil {
		return err
	}

	// Prevent deleting the last column
	if len(board.Columns) <= 1 {
		return errors.New("cannot delete the last column on the board")
	}

	return s.Repo.RemoveColumn(ctx, board.ID, statusKey)
}

func (s *BoardService) UpdateColumn(ctx context.Context, columnID uuid.UUID, updates map[string]interface{}) error {
	return s.Repo.UpdateColumn(ctx, columnID, updates)
}

func (s *BoardService) ReorderColumns(ctx context.Context, workspaceID uuid.UUID, orderedIDs []uuid.UUID) error {
	board, err := s.Repo.GetWorkspaceBoard(ctx, workspaceID)
	if err != nil {
		return err
	}

	positions := make(map[uuid.UUID]int)
	for i, id := range orderedIDs {
		positions[id] = i
	}

	return s.Repo.ReorderColumns(ctx, board.ID, positions)
}
