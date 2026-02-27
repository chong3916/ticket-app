package handlers

import (
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type TodoHandler struct {
	Service *services.TodoService
}

func NewTodoHandler(svc *services.TodoService) *TodoHandler {
	return &TodoHandler{Service: svc}
}

func (h *TodoHandler) CreateTodo(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var item models.Todo
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.UserID = uuid.MustParse(userID.(string)) // set owner

	result, err := h.Service.CreateTodo(c.Request.Context(), item)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}
