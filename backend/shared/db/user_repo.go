package db

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: pool}
}

func (r *UserRepository) CreateUser(ctx context.Context, user models.User) error {
	query := `
		INSERT INTO users (id, username, email, password_hash)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.Exec(ctx, query, user.ID, user.Username, user.Email, user.Password)
	return err
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	query := `
       SELECT id, username, email, password_hash, created_at, updated_at 
       FROM users 
       WHERE email = $1
    `

	var user models.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	query := `
       SELECT id, username, email, password_hash, created_at, updated_at 
       FROM users 
       WHERE id = $1
    `

	var user models.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByIdentity(ctx context.Context, provider, providerID string) (models.User, error) {
	query := `
        SELECT u.id, u.username, u.email, u.password_hash, u.created_at, u.updated_at
        FROM users u
        JOIN user_identities ui ON u.id = ui.user_id
        WHERE ui.provider_name = $1 AND ui.provider_id = $2
    `
	var user models.User
	err := r.db.QueryRow(ctx, query, provider, providerID).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt,
	)
	return user, err
}

func (r *UserRepository) CreateIdentity(ctx context.Context, identity models.UserIdentity) error {
	query := `
        INSERT INTO user_identities (id, user_id, provider_name, provider_id, provider_email)
        VALUES ($1, $2, $3, $4, $5)
    `
	_, err := r.db.Exec(ctx, query, uuid.New(), identity.UserID, identity.ProviderName, identity.ProviderID, identity.ProviderEmail)
	return err
}
