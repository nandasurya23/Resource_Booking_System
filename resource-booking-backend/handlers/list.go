package handlers

import (
	"context"
	"net/http"
	"time"

	"booking-api/db"

	"github.com/gin-gonic/gin"
)

type BookingResponse struct {
	ID         int       `json:"id"`
	ResourceID int       `json:"resource_id"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	Status     string    `json:"status"`
}

func ListBookings(c *gin.Context) {
	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, resource_id, start_time, end_time, status
		 FROM bookings
		 ORDER BY created_at DESC`,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "db query error",
		})
		return
	}
	defer rows.Close()

	bookings := []BookingResponse{}

	for rows.Next() {
		var b BookingResponse

		err := rows.Scan(
			&b.ID,
			&b.ResourceID,
			&b.StartTime,
			&b.EndTime,
			&b.Status,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "scan error: " + err.Error(),
			})
			return
		}

		bookings = append(bookings, b)
	}

	c.JSON(http.StatusOK, bookings)
}
