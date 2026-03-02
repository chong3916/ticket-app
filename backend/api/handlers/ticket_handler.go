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
	Status         string   `json:"status"`
	Priority       string   `json:"priority"`
	Tags           []string `json:"tags"`
}

type UpdateTicketRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	Priority    *string `json:"priority"`
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

	result, err := h.Service.CreateTicket(c.Request.Context(), workspaceID, userID, assigneeID, req.Title, req.Description, req.Status, req.Priority, req.Tags)
	if err != nil {
		log.Printf("CreateTicket Error: %v", err)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *TicketHandler) GetCreatorTicket(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *TicketHandler) UpdateTicket(c *gin.Context) {
	idParam := c.Param("id")
	ticketID, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ticket id"})
		return
	}

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

	var req struct {
		Title       *string `json:"title" binding:"omitempty,min=1"`
		Description *string `json:"description"`
		Status      *string `json:"status"`
		Priority    *string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update data"})
		return
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Priority != nil {
		updates["priority"] = *req.Priority
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No valid fields to update"})
		return
	}

	err = h.Service.UpdateTicket(c.Request.Context(), ticketID, userID, updates)
	if err != nil {
		c.Error(err)

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *TicketHandler) GetWorkspaceTickets(c *gin.Context) {
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

	wsIDStr := c.Param("id")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id"})
		return
	}

	result, err := h.Service.GetWorkspaceTickets(c.Request.Context(), wsID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workspace tickets"})
		return
	}

	c.JSON(http.StatusOK, result)
}
