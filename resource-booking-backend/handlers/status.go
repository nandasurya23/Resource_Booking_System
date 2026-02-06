package handlers

import (
	"context"
	"net/http"

	"booking-api/db"

	"github.com/gin-gonic/gin"
)

func ApproveBooking(c *gin.Context) {
	id := c.Param("id")

	_, err := db.Pool.Exec(context.Background(),
		`UPDATE bookings SET status='approved' WHERE id=$1`, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed approve"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "approved"})
}

func CancelBooking(c *gin.Context) {
	id := c.Param("id")

	_, err := db.Pool.Exec(context.Background(),
		`UPDATE bookings SET status='cancelled' WHERE id=$1`, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed cancel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cancelled"})
}
