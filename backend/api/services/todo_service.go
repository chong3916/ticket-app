package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
)

type TodoService struct {
	Repo *db.TodoRepository
}

func NewTodoService(repo *db.TodoRepository) *TodoService {
	return &TodoService{Repo: repo}
}

func (s *TodoService) CreateTodo(ctx context.Context, item models.Todo) (models.Todo, error) {
	if item.Title == "" {
		return models.Todo{}, errors.New("title cannot be empty")
	}

	item.Status = "pending" // Default status
	item.Completed = false

	err := s.Repo.CreateTodo(ctx, item)
	if err != nil {
		return models.Todo{}, err
	}

	return item, nil
}
