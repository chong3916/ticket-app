package handlers

import (
	"encoding/json"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type OAuthRequest struct {
	Code string `json:"code" binding:"required"`
}

func (h *UserHandler) GoogleLogin(c *gin.Context) {
	var req OAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code is required"})
		return
	}

	// Verify the id token with Google
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  "postmessage",
		Endpoint:     google.Endpoint,
		Scopes:       []string{"profile", "email"},
	}

	// Get token with code
	tok, err := conf.Exchange(c.Request.Context(), req.Code)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to exchange code: " + err.Error()})
		return
	}

	client := conf.Client(c.Request.Context(), tok)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		Sub   string `json:"sub"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Find or create user
	user, err := h.Service.FindOrCreateOAuthUser(
		c.Request.Context(),
		"google",
		googleUser.Sub,
		googleUser.Email,
		googleUser.Name,
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
