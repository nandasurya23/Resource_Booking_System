package main

import (
	"time"

	"booking-api/db"
	"booking-api/handlers"
	"booking-api/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	db.ConnectPostgres()
	db.ConnectRedis()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		MaxAge: 12 * time.Hour,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "API running"})
	})

	r.POST("/login", handlers.Login)

	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())

	auth.POST("/bookings", handlers.CreateBooking)
	auth.GET("/bookings", handlers.ListBookings)

	auth.POST("/bookings/:id/approve", handlers.ApproveBooking)
	auth.POST("/bookings/:id/cancel", handlers.CancelBooking)

	r.Run(":8080")
}
