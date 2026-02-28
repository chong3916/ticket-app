package main

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/broker"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/chong3916/todo-app/backend/shared/models"
	"log"
)

type TaskProcessor struct {
	repo   *db.OutboxRepository
	broker broker.MessageBroker
}

func (p *TaskProcessor) ProcessTask(ctx context.Context, task models.Outbox) {
	var err error

	switch task.EventType {
	case "todo_created":
		err = p.broker.Publish("todo_events", task.Payload)
	default:
		log.Printf("Unknown event type: %s", task.EventType)
		return
	}

	if err != nil {
		log.Printf("Failed to publish event: %v", err)
		return
	}

	// Only mark as processed if the broker successfully took the message
	err = p.repo.MarkAsProcessed(ctx, task.ID)
	if err != nil {
		log.Printf("Failed to update outbox status: %v", err)
	}
}
