SHELL := /bin/bash
PORT ?= 8080

.PHONY: import frontend-build frontend-build-static build run stop test

import:
	./tools/fetch-tatoeba.sh
	go run ./tools/importer

frontend-build:
	cd frontend && npm run build

frontend-build-static:
	./tools/copy-static-data.sh
	cd frontend && npm run build:static
	./tools/prepare-pages.sh

build: import frontend-build
	go build ./backend/... ./tools/...

run: build
	PORT=$(PORT) go run ./backend/cmd/server

stop:
	-pkill -f './backend/cmd/server'
	-pkill -x server

test:
	go test ./backend/... ./tools/...
	cd frontend && npm run build
