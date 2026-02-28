package main

import (
	"context"
	"github.com/chong3916/todo-app/backend/shared/broker"
	"github.com/rabbitmq/amqp091-go"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	conn, err := amqp091.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Unable to open RabbitMQ channel: %v", err)
	}
	defer ch.Close()

	// Initialize broker & repo
	rabbitBroker := broker.NewRabbitMQBroker(conn, ch)
	outboxRepo := db.NewOutboxRepository(pool)

	processor := &TaskProcessor{
		repo:   outboxRepo,
		broker: rabbitBroker,
	}

	log.Println("Worker started: Polling outbox every 2 seconds...")

	// Start the loop using the processor
	runWorker(ctx, processor)
}

func runWorker(ctx context.Context, p *TaskProcessor) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Shutting down worker gracefully...")
			return
		case <-ticker.C:
			tasks, err := p.repo.GetPendingTasks(ctx)
			if err != nil {
				log.Printf("Error fetching tasks: %v", err)
				continue
			}

			for _, task := range tasks {
				p.ProcessTask(ctx, task)
			}
		}
	}
}
