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
	err = rabbitBroker.Subscribe("notification_queue", "todo_events", func(payload []byte) {
		var todo models.Todo
		if err := json.Unmarshal(payload, &todo); err != nil {
			log.Printf("Failed to unmarshal todo: %v", err)
			return
		}

		// Send the notification
		sendEmailNotification(todo)
		sendPhoneNotification(todo)
	})

	if err != nil {
		log.Fatalf("Failed to subscribe to queue: %v", err)
	}

	<-ctx.Done()
	log.Println("Notification service shutting down...")
}

func sendEmailNotification(todo models.Todo) {
	log.Printf("SENDING EMAIL: 'Hey User %s, your todo [%s] was created!'", todo.UserID, todo.Title)
}

func sendPhoneNotification(todo models.Todo) {
	log.Printf("SENDING PHONE NOTIFICATION: 'Hey User %s, your todo [%s] was created!'", todo.UserID, todo.Title)
}
