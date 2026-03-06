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
