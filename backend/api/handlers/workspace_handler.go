package handlers

import (
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"net/http"
)

type WorkspaceHandler struct {
	Service *services.WorkspaceService
}

func NewWorkspaceHandler(svc *services.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{Service: svc}
}

type CreateWorkspaceRequest struct {
	Name string `json:"name" binding:"required,min=3"`
}

type InviteMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func (h *WorkspaceHandler) CreateWorkspace(c *gin.Context) {
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

	var req CreateWorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.Service.CreateNewWorkspace(c.Request.Context(), req.Name, userID)
	if err != nil {
		log.Printf("CreateNewWorkspace Error: %v", err)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *WorkspaceHandler) GetUserWorkspaces(c *gin.Context) {
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

	workspaces, err := h.Service.GetUserWorkspaces(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workspaces"})
		return
	}

	c.JSON(http.StatusOK, workspaces)
}

func (h *WorkspaceHandler) GetWorkspaceMembers(c *gin.Context) {
	wsIDStr := c.Param("id")
	workspaceID, err := uuid.Parse(wsIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workspace id"})
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

	members, err := h.Service.GetWorkspaceMembers(c.Request.Context(), workspaceID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

func (h *WorkspaceHandler) InviteMember(c *gin.Context) {
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

	var req InviteMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valid email required"})
		return
	}

	err = h.Service.InviteMember(c.Request.Context(), wsID, userID, req.Email)
	if err != nil {
		if err.Error() == "user with this email does not exist" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
