package app

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func FrontendHandler() http.Handler {
	distPath := filepath.Join("frontend", "dist")
	fileServer := http.FileServer(http.Dir(distPath))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cleanPath := strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		if cleanPath == "." || cleanPath == "" {
			http.ServeFile(w, r, filepath.Join(distPath, "index.html"))
			return
		}

		if _, err := os.Stat(filepath.Join(distPath, cleanPath)); err == nil {
			fileServer.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, filepath.Join(distPath, "index.html"))
	})
}
