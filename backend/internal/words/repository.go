package words

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
)

//go:embed embed/words.json
var wordsJSON []byte

//go:embed embed/meta.json
var metaJSON []byte

type Repository struct {
	words []Word
	meta  Meta
	byID  map[int]Word
}

func NewRepository() (*Repository, error) {
	var all []Word
	if err := json.Unmarshal(wordsJSON, &all); err != nil {
		return nil, fmt.Errorf("decode words dataset: %w", err)
	}

	var meta Meta
	if err := json.Unmarshal(metaJSON, &meta); err != nil {
		return nil, fmt.Errorf("decode words meta: %w", err)
	}

	byID := make(map[int]Word, len(all))
	for _, word := range all {
		byID[word.ID] = word
	}

	return &Repository{
		words: all,
		meta:  meta,
		byID:  byID,
	}, nil
}

func (r *Repository) Meta() Meta {
	return r.meta
}

func (r *Repository) Deck() []Word {
	return slices.Clone(r.words)
}

func (r *Repository) FindByID(id int) (Word, bool) {
	word, ok := r.byID[id]
	return word, ok
}

func (r *Repository) List(search string, limit, offset int) ([]Word, int) {
	search = strings.TrimSpace(strings.ToLower(search))
	filtered := make([]Word, 0, len(r.words))

	for _, word := range r.words {
		if search == "" || strings.Contains(strings.ToLower(word.Word), search) || strings.Contains(strings.ToLower(word.Definition), search) {
			filtered = append(filtered, word)
		}
	}

	total := len(filtered)
	if offset >= total {
		return []Word{}, total
	}

	end := total
	if limit > 0 && offset+limit < end {
		end = offset + limit
	}

	return slices.Clone(filtered[offset:end]), total
}
