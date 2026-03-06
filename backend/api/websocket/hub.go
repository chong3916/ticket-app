package websocket

import (
	"github.com/chong3916/todo-app/backend/shared/models"
	"sync"
)

type Hub struct {
	// Map of WorkspaceID -> Map of Clients
	Rooms      map[string]map[*Client]bool
	Broadcast  chan models.WSEvent
	Register   chan *Client
	Unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan models.WSEvent),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Rooms[client.WorkspaceID] == nil {
				h.Rooms[client.WorkspaceID] = make(map[*Client]bool)
			}
			h.Rooms[client.WorkspaceID][client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Rooms[client.WorkspaceID][client]; ok {
				delete(h.Rooms[client.WorkspaceID], client)
				close(client.Send)
				if len(h.Rooms[client.WorkspaceID]) == 0 {
					delete(h.Rooms, client.WorkspaceID)
				}
			}
			h.mu.Unlock()

		case event := <-h.Broadcast:
			h.mu.RLock()
			for client := range h.Rooms[event.WorkspaceID] {
				select {
				case client.Send <- event:
				default:
					close(client.Send)
					delete(h.Rooms[event.WorkspaceID], client)
				}
			}
			h.mu.RUnlock()
		}
	}
}
