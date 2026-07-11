#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_DIR="$DIR/../data"
TSV_FILE="$DATA_DIR/eng_sentences.tsv"
BZ2_FILE="$DATA_DIR/eng_sentences.tsv.bz2"
URL="https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2"

if [ -f "$TSV_FILE" ]; then
    echo "Tatoeba dataset already exists at $TSV_FILE"
    exit 0
fi

echo "Downloading Tatoeba English sentences..."
curl -L -s -o "$BZ2_FILE" "$URL"

echo "Extracting..."
bzip2 -d "$BZ2_FILE"

echo "Done. Dataset ready at $TSV_FILE"
