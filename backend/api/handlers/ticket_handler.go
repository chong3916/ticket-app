package handlers

import (
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"net/http"
)

type TicketHandler struct {
	Service *services.TicketService
}

func NewTicketHandler(svc *services.TicketService) *TicketHandler {
	return &TicketHandler{Service: svc}
}

type CreateTicketRequest struct {
	WorkspaceIDStr string   `json:"workspace_id_str" binding:"required"`
	AssigneeIDStr  string   `json:"assignee_id_str"`
	Title          string   `json:"title" binding:"required"`
	Description    string   `json:"description"`
	Priority       string   `json:"priority"`
	Tags           []string `json:"tags"`
}

func (h *TicketHandler) CreateTicket(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDStr, ok := val.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user context"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id format"})
		return
	}

	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Workspace ID or Title is required"})
		return
	}

	var workspaceID uuid.UUID
	if req.WorkspaceIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id format"})
		return
	} else {
		var err error
		workspaceID, err = uuid.Parse(req.WorkspaceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id format"})
			return
		}
	}

	var assigneeID uuid.UUID
	if req.AssigneeIDStr != "" {
		var err error
		assigneeID, err = uuid.Parse(req.AssigneeIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid assignee id format"})
			return
		}
	} else {
		assigneeID = uuid.Nil
	}

	result, err := h.Service.CreateTicket(c.Request.Context(), workspaceID, userID, assigneeID, req.Title, req.Description, req.Priority, req.Tags)
	if err != nil {
		log.Printf("CreateTicket Error: %v", err)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *TicketHandler) GetUserCreatorTodo(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDStr, ok := val.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user context"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id format"})
		return
	}

	result, err := h.Service.GetCreatorTicket(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch todos"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *TicketHandler) UpdateTodoStatus(c *gin.Context) {
	idParam := c.Param("id")
	ticketID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid todo id"})
		return
	}

	val, _ := c.Get("user_id")
	userIDStr := val.(string)
	userID, _ := uuid.Parse(userIDStr)

	// Bind the request body
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// Update
	err = h.Service.UpdateTicketStatus(c.Request.Context(), ticketID, userID, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
