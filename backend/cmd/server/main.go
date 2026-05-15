package main

import (
	"log"
	"net/http"
	"os"

	"learnglish/backend/internal/api"
	"learnglish/backend/internal/app"
	"learnglish/backend/internal/words"
)

func main() {
	repo, err := words.NewRepository()
	if err != nil {
		log.Fatalf("load repository: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler := api.NewRouter(repo, app.FrontendHandler())
	log.Printf("Learnglish server listening on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
