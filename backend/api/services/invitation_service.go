package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/google/uuid"
	"strings"
)

type InvitationService struct {
	InvitationRepo *db.InvitationRepository
	WorkspaceRepo  *db.WorkspaceRepository
}

func NewInvitationService(invitationRepo *db.InvitationRepository, wsRepo *db.WorkspaceRepository) *InvitationService {
	return &InvitationService{
		InvitationRepo: invitationRepo,
		WorkspaceRepo:  wsRepo,
	}
}

func (s *InvitationService) InviteUser(ctx context.Context, workspaceID, inviterID uuid.UUID, email string) (string, error) {
	// Generate random token
	b := make([]byte, 16)
	rand.Read(b)
	token := hex.EncodeToString(b)

	// Save to db
	err := s.InvitationRepo.CreateInvitation(ctx, workspaceID, inviterID, email, token)
	if err != nil {
		return "", err
	}

	// TODO: send email with token
	return token, nil
}

func (s *InvitationService) AcceptInvitation(ctx context.Context, token string, userID uuid.UUID, userEmail string) error {
	workspaceID, invitedEmail, err := s.InvitationRepo.GetByToken(ctx, token)
	if err != nil {
		return errors.New("invalid or expired invitation")
	}

	if strings.ToLower(invitedEmail) != strings.ToLower(userEmail) {
		return errors.New("this invitation was sent to a different email address")
	}

	// Add member
	err = s.WorkspaceRepo.AddMemberByID(ctx, workspaceID, userID, "member")
	if err != nil {
		return err
	}

	return s.InvitationRepo.MarkAsAccepted(ctx, token)
}
