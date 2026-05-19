#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/frontend/public/data"

mkdir -p "$TARGET_DIR"
cp "$ROOT_DIR/data/words.json" "$TARGET_DIR/words.json"
cp "$ROOT_DIR/data/meta.json" "$TARGET_DIR/meta.json"
