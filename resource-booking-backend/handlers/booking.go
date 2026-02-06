package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"booking-api/db"

	"github.com/gin-gonic/gin"
)

type BookingRequest struct {
	ResourceID int    `json:"resource_id"`
	StartTime  string `json:"start_time"`
	EndTime    string `json:"end_time"`
}

func CreateBooking(c *gin.Context) {
	var req BookingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	start, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_time"})
		return
	}

	end, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_time"})
		return
	}

	if end.Before(start) || end.Equal(start) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_time must be after start_time"})
		return
	}

	// ==========================================
	//  Redis Lock (Anti Double Booking)
	// ==========================================
	lockKey := "lock:resource:" + strconv.Itoa(req.ResourceID)

	ok, err := db.Redis.SetNX(db.Ctx, lockKey, "locked", 5*time.Second).Result()

	if err != nil || !ok {
		c.JSON(429, gin.H{"error": "resource is being booked, try again"})
		return
	}

	// Unlock after done
	defer db.Redis.Del(db.Ctx, lockKey)

	// ==========================================
	//  Conflict Check
	// ==========================================
	var count int
	query := `
		SELECT COUNT(*)
		FROM bookings
		WHERE resource_id=$1
		AND status IN ('pending','approved')
		AND ($2 < end_time AND $3 > start_time)
	`

	err = db.Pool.QueryRow(context.Background(), query,
		req.ResourceID, start, end,
	).Scan(&count)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "resource already booked in that time range",
		})
		return
	}

	// ==========================================
	// Insert Booking
	// ==========================================
	insert := `
		INSERT INTO bookings (resource_id, start_time, end_time, status)
		VALUES ($1,$2,$3,'pending')
		RETURNING id
	`

	var bookingID int
	err = db.Pool.QueryRow(context.Background(), insert,
		req.ResourceID, start, end,
	).Scan(&bookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "booking created",
		"booking_id": bookingID,
		"status":     "pending",
	})
}
