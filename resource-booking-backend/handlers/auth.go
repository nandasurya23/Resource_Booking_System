package handlers

import (
	"context"

	"booking-api/db"
	"booking-api/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	var id int
	var role string
	var password string

	err := db.Pool.QueryRow(context.Background(),
		"SELECT id, password, role FROM users WHERE email=$1",
		req.Email,
	).Scan(&id, &password, &role)

	if err != nil || password != req.Password {
		c.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}

	token, _ := utils.GenerateToken(id, role)

	c.JSON(200, gin.H{
		"token": token,
		"role":  role,
	})
}
