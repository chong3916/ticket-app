package models

import "encoding/json"

// Generic websocket event
type WSEvent struct {
	Type        string          `json:"type"`
	WorkspaceID string          `json:"workspaceId"`
	Payload     json.RawMessage `json:"payload"`
	SenderID    string          `json:"senderId"`
}

type TicketUpdatePayload struct {
	TicketID string `json:"ticketId"`
	Status   string `json:"status"`
	Editor   string `json:"editor"`
}
