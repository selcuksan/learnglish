SHELL := /bin/bash
PORT ?= 8080

.PHONY: import frontend-build build run stop test

import:
	go run ./tools/importer

frontend-build:
	cd frontend && npm run build

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
