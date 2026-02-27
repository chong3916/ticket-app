package main

import (
	"github.com/chong3916/todo-app/backend/api/handlers"
	"github.com/chong3916/todo-app/backend/api/middleware"
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

	userRepo := db.NewUserRepository(pool)
	todoRepo := db.NewTodoRepository(pool)
	outboxRepo := db.NewOutboxRepository(pool)

	userService := services.NewUserService(userRepo)
	todoService := services.NewTodoService(todoRepo)

	userHandler := handlers.NewUserHandler(userService)
	todoHandler := handlers.NewTodoHandler(todoService)

	r := gin.Default()
	r.POST("/register", userHandler.Register)
	r.POST("/login", userHandler.Login)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		r.POST("/todos", todoHandler.CreateTodo)
	}
	r.Run(":8080")
}
