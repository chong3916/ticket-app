package main

import (
	"github.com/chong3916/todo-app/backend/api/handlers"
	"github.com/chong3916/todo-app/backend/api/middleware"
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
	"log"
	"net/http"
	"os"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db.RunMigrations(dbURL)
	pool := db.InitPool(dbURL)
	defer pool.Close()

	userRepo := db.NewUserRepository(pool)
	todoRepo := db.NewTicketRepository(pool)

	userService := services.NewUserService(userRepo)
	todoService := services.NewTicketService(todoRepo)

	userHandler := handlers.NewUserHandler(userService)
	todoHandler := handlers.NewTicketHandler(todoService)

	r := gin.Default()

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // React app
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	})

	r.POST("/register", userHandler.Register)
	r.POST("/login", userHandler.Login)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/todos", todoHandler.GetCreatorTicket)
		api.POST("/todos", todoHandler.CreateTicket)
		api.PATCH("/todos/:id", todoHandler.UpdateTicketStatus)
	}

	log.Println("Server starting on :8080")
	http.ListenAndServe(":8080", c.Handler(r))
}
