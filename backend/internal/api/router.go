package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"learnglish/backend/internal/words"
)

type Handler struct {
	repo *words.Repository
}

func NewRouter(repo *words.Repository, frontend http.Handler) http.Handler {
	handler := &Handler{repo: repo}
	router := chi.NewRouter()

	router.Use(middleware.RealIP)
	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Compress(5))

	router.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	router.Route("/api", func(r chi.Router) {
		r.Get("/meta", handler.getMeta)
		r.Get("/deck", handler.getDeck)
		r.Get("/words", handler.listWords)
		r.Get("/words/{id}", handler.getWord)
	})

	router.Handle("/*", frontend)
	return router
}

func (h *Handler) getMeta(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.repo.Meta())
}

func (h *Handler) getDeck(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.repo.Deck())
}

func (h *Handler) listWords(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	limit := clamp(parseInt(query.Get("limit"), 50), 1, 200)
	offset := max(parseInt(query.Get("offset"), 0), 0)
	items, total := h.repo.List(query.Get("search"), limit, offset)

	writeJSON(w, http.StatusOK, map[string]any{
		"items":  items,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *Handler) getWord(w http.ResponseWriter, r *http.Request) {
	id := parseInt(chi.URLParam(r, "id"), -1)
	word, ok := h.repo.FindByID(id)
	if !ok {
		http.NotFound(w, r)
		return
	}

	writeJSON(w, http.StatusOK, word)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func parseInt(raw string, fallback int) int {
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func clamp(value, minValue, maxValue int) int {
	if value < minValue {
		return minValue
	}
	if value > maxValue {
		return maxValue
	}
	return value
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
