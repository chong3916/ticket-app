package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
)

type TodoService struct {
	Repo *db.TodoRepository
}

func NewTodoService(repo *db.TodoRepository) *TodoService {
	return &TodoService{Repo: repo}
}

func (s *TodoService) CreateTodo(ctx context.Context, userID uuid.UUID, title string) (models.Todo, error) {
	if title == "" {
		return models.Todo{}, errors.New("title cannot be empty")
	}

	todo := models.Todo{
		UserID: userID,
		Title:  title,
		Status: "pending", // Default status
	}

	result, err := s.Repo.CreateTodo(ctx, todo)
	if err != nil {
		return models.Todo{}, err
	}

	return result, nil
}
