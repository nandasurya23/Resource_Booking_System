package db

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func ConnectPostgres() {
	dsn := "postgres://booking:bookingpass@localhost:5432/bookingdb"

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal("Failed to connect Postgres:", err)
	}

	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatal("Postgres not responding:", err)
	}

	log.Println("Connected to PostgreSQL")

	Pool = pool
}
