package handlers

import (
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type BoardHandler struct {
	Service *services.BoardService
}

func NewBoardHandler(svc *services.BoardService) *BoardHandler {
	return &BoardHandler{Service: svc}
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
