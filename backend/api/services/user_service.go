package services

import (
	"context"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"os"
	"time"
)

type UserService struct {
	Repo *db.UserRepository
}

func NewUserService(repo *db.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) Register(ctx context.Context, username, email, password string) (models.User, error) {
	if len(password) < 8 {
		return models.User{}, errors.New("password too short")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return models.User{}, err
	}

	// Create the user
	newUser := models.User{
		ID:       uuid.New(),
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
	}

	err = s.Repo.CreateUser(ctx, newUser)
	if err != nil {
		return models.User{}, errors.New("username or email already exists")
	}

	return newUser, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (string, error) {
	// Find user by email
	user, err := s.Repo.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	// Compare password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	return s.GenerateToken(user)
}

func (s *UserService) GenerateToken(user models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID.String(),
		"exp": time.Now().Add(time.Hour * 72).Unix(),
		"iat": time.Now().Unix(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
