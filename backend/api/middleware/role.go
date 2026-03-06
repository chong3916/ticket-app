package middleware

import (
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

func RequireRole(wsRepo *db.WorkspaceRepository, allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract workspace id from url
		idParam := c.Param("id")
		if idParam == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Workspace ID required"})
			return
		}

		wsID, err := uuid.Parse(idParam)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid workspace ID"})
			return
		}

		// Get user id from AuthMiddleware
		val, exists := c.Get("user_id")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID, err := uuid.Parse(val.(string))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
			return
		}

		// Query the db for the role
		role, err := wsRepo.GetUserWorkspaceRole(c.Request.Context(), wsID, userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: not a member"})
			return
		}

		// Check permissions
		for _, r := range allowedRoles {
			if r == role {
				c.Set("user_role", role)
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
	}
}
