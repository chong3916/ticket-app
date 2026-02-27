package db

import (
	"errors"
	"fmt"
	"log"

	"embed"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func RunMigrations(databaseURL string) {
	d, _ := iofs.New(migrationFiles, "migrations")
	m, err := migrate.NewWithSourceInstance("iofs", d, databaseURL)

	if err != nil {
		log.Fatalf("Migration init failed: %v", err)
	}

	// Apply migrations
	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			fmt.Println("Database schema is up to date.")
		} else {
			log.Fatalf("Migration execution failed: %v", err)
		}
	} else {
		fmt.Println("Migrations applied successfully!")
	}
}
