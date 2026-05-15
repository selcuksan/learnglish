package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"learnglish/backend/internal/words"
)

func TestMetaEndpoint(t *testing.T) {
	repo, err := words.NewRepository()
	if err != nil {
		t.Fatalf("NewRepository() error = %v", err)
	}

	router := NewRouter(repo, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodGet, "/api/meta", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	var meta words.Meta
	if err := json.Unmarshal(recorder.Body.Bytes(), &meta); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if meta.TotalWords == 0 {
		t.Fatal("expected total words in meta response")
	}
}

func TestWordsEndpointSupportsSearch(t *testing.T) {
	repo, err := words.NewRepository()
	if err != nil {
		t.Fatalf("NewRepository() error = %v", err)
	}

	router := NewRouter(repo, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodGet, "/api/words?search=habit&limit=5&offset=0", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	var response struct {
		Items []words.Word `json:"items"`
		Total int          `json:"total"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if response.Total == 0 || len(response.Items) == 0 {
		t.Fatal("expected search results")
	}
}
