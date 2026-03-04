package main

import (
	"github.com/chong3916/todo-app/backend/api/handlers"
	"github.com/chong3916/todo-app/backend/api/middleware"
	"github.com/chong3916/todo-app/backend/api/services"
	"github.com/chong3916/todo-app/backend/shared/db"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
	"log"
	"os"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	db.RunMigrations(dbURL)
	pool := db.InitPool(dbURL)
	defer pool.Close()

	userRepo := db.NewUserRepository(pool)
	boardRepo := db.NewBoardRepository(pool)
	wsRepo := db.NewWorkspaceRepository(pool)
	ticketRepo := db.NewTicketRepository(pool)
	invitationRepo := db.NewInvitationRepository(pool)

	userService := services.NewUserService(userRepo)
	boardService := services.NewBoardService(boardRepo)
	wsService := services.NewWorkspaceService(wsRepo, boardService)
	ticketService := services.NewTicketService(ticketRepo, wsRepo, boardRepo)
	invitationService := services.NewInvitationService(invitationRepo, wsRepo)

	userHandler := handlers.NewUserHandler(userService)
	boardHandler := handlers.NewBoardHandler(boardService)
	ticketHandler := handlers.NewTicketHandler(ticketService)
	invitationHandler := handlers.NewInvitationHandler(invitationService)

	wsHandler := handlers.NewWorkspaceHandler(wsService, invitationService)

	r := gin.Default()
	r.Use(middleware.ErrorLogger())

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // React app
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	})
	r.Use(func(ctx *gin.Context) {
		c.HandlerFunc(ctx.Writer, ctx.Request)
	})

	r.POST("/register", userHandler.Register)
	r.POST("/login", userHandler.Login)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/tickets", ticketHandler.GetCreatorTicket)
		api.POST("/tickets", ticketHandler.CreateTicket)
		api.PATCH("/tickets/:id", ticketHandler.UpdateTicket)
		api.DELETE("/tickets/:id", ticketHandler.DeleteTicket)

		api.GET("/workspaces/:id/tickets", ticketHandler.GetWorkspaceTickets)

		api.POST("/workspaces", wsHandler.CreateWorkspace)
		api.GET("/workspaces", wsHandler.GetUserWorkspaces)
		api.GET("/workspaces/:id/members", wsHandler.GetWorkspaceMembers)
		api.POST("/workspaces/:id/invite", wsHandler.InviteMember)
		api.GET("/workspaces/:id/board", boardHandler.GetWorkspaceBoard)
		api.POST("/workspaces/:id/board/columns", boardHandler.AddColumn)

		api.POST("/invites/accept", invitationHandler.AcceptInvite)
		api.GET("/invites/pending", invitationHandler.GetMyInvites)
	}

	log.Println("Server starting on :8080")

	r.Run(":8080")
}
