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
	invitationService := services.NewInvitationService(invitationRepo, wsRepo, userRepo)

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

	// Protected routes
	api := r.Group("/api")
	{
		api.POST("/register", userHandler.Register)
		api.POST("/login", userHandler.Login)
	}

	protected := r.Group("/api", middleware.AuthMiddleware())
	{
		protected.POST("/workspaces", wsHandler.CreateWorkspace)
		protected.GET("/workspaces", wsHandler.GetUserWorkspaces)

		protected.POST("/invites/accept", invitationHandler.AcceptInvite)
		protected.GET("/invites/pending", invitationHandler.GetMyInvites)

		ws := protected.Group("/workspaces/:id")
		{
			ws.GET("/tickets", middleware.RequireRole(wsRepo, "admin", "member", "viewer"), ticketHandler.GetWorkspaceTickets)
			ws.POST("/tickets", middleware.RequireRole(wsRepo, "admin", "member"), ticketHandler.CreateTicket)
			ws.PATCH("/tickets/:ticket_id", middleware.RequireRole(wsRepo, "admin", "member"), ticketHandler.UpdateTicket)
			ws.DELETE("/tickets/:ticket_id", middleware.RequireRole(wsRepo, "admin", "member"), ticketHandler.DeleteTicket)

			ws.GET("/members", middleware.RequireRole(wsRepo, "admin", "member", "viewer"), wsHandler.GetWorkspaceMembers)
			ws.PATCH("/members/:member_id/role", middleware.RequireRole(wsRepo, "admin"), wsHandler.UpdateMemberRole)
			ws.DELETE("/members/:member_id", middleware.RequireRole(wsRepo, "admin"), wsHandler.RemoveMember)

			ws.POST("/invite", middleware.RequireRole(wsRepo, "admin"), wsHandler.InviteMember)
			ws.GET("/board", middleware.RequireRole(wsRepo, "admin", "member", "viewer"), boardHandler.GetWorkspaceBoard)
			ws.POST("/board/columns", middleware.RequireRole(wsRepo, "admin"), boardHandler.AddColumn)
		}
	}

	log.Println("Server starting on :8080")

	r.Run(":8080")
}
