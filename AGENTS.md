# AGENTS

This file gives coding agents the minimum context needed to work effectively in this repository.

## Project Shape
- `backend/`: Go HTTP server, API routes, dataset repository, static frontend serving
- `frontend/`: React + TypeScript + Vite single-page app
- `tools/importer/`: Excel to normalized JSON pipeline
- `data/`: generated normalized dataset for inspection

## Primary Commands
```bash
make import
make build
make run
make stop
make test
```

## Runtime Assumptions
- The app is local-first and single-user.
- No auth, no remote persistence, no multi-user behavior.
- Browser `localStorage` is the source of truth for learner progress.
- The Go backend is the source of truth for the word catalog.

## Data Notes
- Source workbook: `NGSL_1.2_with_English_definitions.xlsx`
- Source sheet: `Sheet1`
- Required headers: `Word`, `Definitons`
- Importer output is written to:
  - `data/words.json`
  - `data/meta.json`
  - `backend/internal/words/embed/words.json`
  - `backend/internal/words/embed/meta.json`

## API Contract
- `GET /healthz`
- `GET /api/meta`
- `GET /api/deck`
- `GET /api/words?search=&limit=&offset=`
- `GET /api/words/:id`

## Frontend State Contract
- `studyProgress`: per-word review state
- `appSettings`: session size preferences
- `sessionHistory`: recent study and quiz summaries

## Current Product Status
- Core MVP is implemented and locally runnable.
- Quiz progression bug has already been fixed and covered by frontend tests.
- Mistake notebook flow is implemented and backed by local progress fields.
- Daily goals are implemented using enriched `sessionHistory` records.
- `TASKS.md` is the source of truth for implementation order and progress tracking.

## Next Priority Features
- Example sentence support
- Progress export/import
- Typed quiz
- Early semantic layer:
  - better distractors
  - related words
  - semantic search

## Agent Constraints
- Preserve the local-first product shape unless the user asks to change it.
- Keep API responses simple JSON; avoid introducing auth or a database casually.
- If importer logic changes, regenerate both `data/` and `backend/internal/words/embed/`.
- When verifying backend code, prefer `go test ./backend/... ./tools/...`.
- When verifying frontend code, prefer `cd frontend && npm run build` and `cd frontend && npm run test`.
- When starting a new feature, update `TASKS.md` status markers in the same change set if the implementation meaningfully changes roadmap progress.
