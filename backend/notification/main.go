package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/chong3916/todo-app/backend/shared/broker"
	"github.com/chong3916/todo-app/backend/shared/models"
	"github.com/rabbitmq/amqp091-go"
)

func main() {
	// Connect to rabbit mq
	conn, err := amqp091.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("Notification service failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}
	defer ch.Close()

	rabbitBroker := broker.NewRabbitMQBroker(conn, ch)

	// Keep the process alive
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Println("Notification Service is online. Waiting for messages...")

	// Subscribe as notification_queue
	err = rabbitBroker.Subscribe("notification_queue", "ticket_events", func(payload []byte) {
		var wrapper struct {
			Type string          `json:"type"`
			Data json.RawMessage `json:"data"`
		}

		if err := json.Unmarshal(payload, &wrapper); err != nil {
			log.Printf("Failed to unmarshal wrapper: %v", err)
			return
		}

		switch wrapper.Type {
		case "ticket_created":
			var ticket models.Ticket
			if err := json.Unmarshal(wrapper.Data, &ticket); err != nil {
				log.Printf("Failed to unmarshal ticket: %v", err)
				return
			}
			sendEmailNotification(ticket)
			sendPhoneNotification(ticket)

		case "ticket_status_updated":
			log.Printf("Received status update event - decide if you want to notify for this!")

		default:
			log.Printf("Notification service ignoring event type: %s", wrapper.Type)
		}
	})

	if err != nil {
		log.Fatalf("Failed to subscribe to queue: %v", err)
	}

	<-ctx.Done()
	log.Println("Notification service shutting down...")
}

func sendEmailNotification(ticket models.Ticket) {
	log.Printf("SENDING EMAIL: 'Hey User %s, your ticket [%s] was created!'", ticket.CreatorID, ticket.Title)
}

func sendPhoneNotification(ticket models.Ticket) {
	log.Printf("SENDING PHONE NOTIFICATION: 'Hey User %s, your ticket [%s] was created!'", ticket.CreatorID, ticket.Title)
}
