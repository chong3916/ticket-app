package handlers

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type OAuthRequest struct {
	Token string `json:"token" binding:"required"`
}

func (h *UserHandler) GoogleLogin(c *gin.Context) {
	var req OAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Token is required"})
		return
	}

	// Verify the id token with Google
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	payload, err := idtoken.Validate(context.Background(), req.Token, clientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}

	// Extract user info from payload
	googleID := payload.Subject
	email := payload.Claims["email"].(string)
	name := payload.Claims["name"].(string)

	// Find or create user
	user, err := h.Service.FindOrCreateOAuthUser(
		c.Request.Context(),
		"google",
		googleID,
		email,
		name,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync user data"})
		return
	}

	// Generate internal jwt
	token, err := h.Service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
		"type":  "Bearer",
	})
}
