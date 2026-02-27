package models

import "time"

type Todo struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"created_at"`
}
