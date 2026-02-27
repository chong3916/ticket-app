package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	// Connect to the same db pool the api uses
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	// Initialize the outbox repo
	outboxRepo := db.NewOutboxRepository(pool)

	log.Println("Worker started: Polling outbox every 2 seconds...")

	// Start the polling loop
	runWorker(ctx, outboxRepo)
}

func runWorker(ctx context.Context, repo *db.OutboxRepository) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Shutting down worker gracefully...")
			return
		case <-ticker.C:
			// Fetch pending tasks
			tasks, err := repo.GetPendingTasks(ctx)
			if err != nil {
				log.Printf("Error fetching tasks: %v", err)
				continue
			}

			for _, task := range tasks {
				log.Printf("Processing %s (ID: %s)", task.EventType, task.ID)

				// Mark as processed
				if err := repo.MarkAsProcessed(ctx, task.ID); err != nil {
					log.Printf("Failed to mark task %s as processed: %v", task.ID, err)
				}
			}
		}
	}
}
