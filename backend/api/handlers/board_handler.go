package handlers

import (
	"encoding/json"
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/chong3916/todo-app/backend/api/websocket"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type BoardHandler struct {
	Service *services.BoardService
	hub     *websocket.Hub
}

func NewBoardHandler(svc *services.BoardService, h *websocket.Hub) *BoardHandler {
	return &BoardHandler{Service: svc, hub: h}
}

func (h *BoardHandler) GetWorkspaceBoard(c *gin.Context) {
	wsIDStr := c.Param("id")
	workspaceID, err := uuid.Parse(wsIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id"})
		return
	}

	board, err := h.Service.Repo.GetWorkspaceBoard(c.Request.Context(), workspaceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "board not found for this workspace"})
		return
	}

	c.JSON(http.StatusOK, board)
}

func (h *BoardHandler) AddColumn(c *gin.Context) {
	wsID, _ := uuid.Parse(c.Param("id"))

	var req struct {
		Name      string `json:"name" binding:"required"`
		StatusKey string `json:"status_key" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	column, err := h.Service.AddColumnByWorkspace(c.Request.Context(), wsID, req.Name, req.StatusKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	payloadBytes, _ := json.Marshal(column)
	h.hub.Broadcast <- models.WSEvent{
		Type:        "COLUMN_ADDED",
		WorkspaceID: wsID.String(),
		Payload:     json.RawMessage(payloadBytes),
	}

	c.JSON(http.StatusCreated, column)
}

func (h *BoardHandler) RemoveColumn(c *gin.Context) {
	wsID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id"})
		return
	}

	statusKey := c.Param("status_key")
	if statusKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status key is required"})
		return
	}

	err = h.Service.RemoveColumnByWorkspace(c.Request.Context(), wsID, statusKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	payloadBytes, _ := json.Marshal(gin.H{"status_key": statusKey})
	h.hub.Broadcast <- models.WSEvent{
		Type:        "COLUMN_REMOVED",
		WorkspaceID: wsID.String(),
		Payload:     json.RawMessage(payloadBytes),
	}

	c.Status(http.StatusNoContent)
}

func (h *BoardHandler) UpdateColumn(c *gin.Context) {
	wsID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id"})
		return
	}
	colID, _ := uuid.Parse(c.Param("column_id"))

	var req struct {
		Name       *string     `json:"name"`
		OrderedIDs []uuid.UUID `json:"ordered_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Reorder columns
	if req.OrderedIDs != nil {
		err := h.Service.ReorderColumns(c.Request.Context(), wsID, req.OrderedIDs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		payloadBytes, _ := json.Marshal(req.OrderedIDs)
		h.hub.Broadcast <- models.WSEvent{
			Type:        "COLUMNS_REORDERED",
			WorkspaceID: wsID.String(),
			Payload:     json.RawMessage(payloadBytes),
		}
		c.Status(http.StatusNoContent)
		return
	}

	// Rename columns
	if req.Name != nil {
		updates := map[string]interface{}{"name": *req.Name}
		err := h.Service.UpdateColumn(c.Request.Context(), colID, updates)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		payloadBytes, _ := json.Marshal(gin.H{"id": colID, "name": *req.Name})
		h.hub.Broadcast <- models.WSEvent{
			Type:        "COLUMN_UPDATED",
			WorkspaceID: wsID.String(),
			Payload:     json.RawMessage(payloadBytes),
		}
	}

	c.Status(http.StatusNoContent)
}
