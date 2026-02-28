package models

import "github.com/google/uuid"

type Board struct {
	ID          uuid.UUID     `json:"id"`
	WorkspaceID uuid.UUID     `json:"workspace_id"`
	Name        string        `json:"name"`
	Columns     []BoardColumn `json:"columns"`
}

type BoardColumn struct {
	ID        uuid.UUID `json:"id"`
	BoardID   uuid.UUID `json:"board_id"`
	Name      string    `json:"name"`
	StatusKey string    `json:"status_key"`
	Position  int       `json:"position"`
}
