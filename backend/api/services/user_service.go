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

	if user.Password == "" {
		return "", errors.New("please log in with Google")
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
		"sub":   user.ID.String(),
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
		"iat":   time.Now().Unix(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func (s *UserService) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	return s.Repo.GetUserByID(ctx, id)
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	return s.Repo.GetUserByEmail(ctx, email)
}

func (s *UserService) FindOrCreateOAuthUser(ctx context.Context, provider, providerID, email, username string) (models.User, error) {
	user, err := s.Repo.GetUserByIdentity(ctx, provider, providerID)
	if err == nil {
		return user, nil
	}

	existingUser, err := s.Repo.GetUserByEmail(ctx, email)
	var targetUser models.User

	if err != nil {
		targetUser = models.User{
			ID:       uuid.New(),
			Username: username,
			Email:    email,
			Password: "", // No password for oauth users
		}
		if err := s.Repo.CreateUser(ctx, targetUser); err != nil {
			return models.User{}, err
		}
	} else {
		targetUser = existingUser
	}

	// Create identity link for user
	err = s.Repo.CreateIdentity(ctx, models.UserIdentity{
		UserID:        targetUser.ID,
		ProviderName:  provider,
		ProviderID:    providerID,
		ProviderEmail: email,
	})

	if err != nil {
		return targetUser, nil
	}

	return targetUser, err
}
