package main

import (
	"github.com/chong3916/todo-app/backend/api/handlers"
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/gin-gonic/gin"
	"os"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db.RunMigrations(dbURL)
	pool := db.InitPool(dbURL)
	defer pool.Close()

	todoRepo := db.NewTodoRepository(pool)
	outboxRepo := db.NewOutboxRepository(pool)

	todoService := services.NewTodoService(todoRepo)

	todoHandler := handlers.NewTodoHandler(todoService)

	r := gin.Default()
	r.POST("/todos", todoHandler.CreateTodo)
	r.Run(":8080")
}
