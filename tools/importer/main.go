package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

const (
	sourceFile = "NGSL_1.2_with_English_definitions.xlsx"
	sheetName  = "Sheet1"
)

type wordRecord struct {
	ID         int    `json:"id"`
	Word       string `json:"word"`
	Definition string `json:"definition"`
	Slug       string `json:"slug"`
}

type metaRecord struct {
	Version     string    `json:"version"`
	GeneratedAt time.Time `json:"generatedAt"`
	TotalWords  int       `json:"totalWords"`
}

func main() {
	root, err := os.Getwd()
	if err != nil {
		log.Fatalf("resolve cwd: %v", err)
	}

	workbook, err := excelize.OpenFile(filepath.Join(root, sourceFile))
	if err != nil {
		log.Fatalf("open workbook: %v", err)
	}
	defer func() { _ = workbook.Close() }()

	rows, err := workbook.GetRows(sheetName)
	if err != nil {
		log.Fatalf("read sheet rows: %v", err)
	}
	if len(rows) < 2 {
		log.Fatal("sheet is empty")
	}

	columnMap := headerIndex(rows[0])
	wordIndex, ok := columnMap["word"]
	if !ok {
		log.Fatal("missing Word header")
	}
	defIndex, ok := columnMap["definitons"]
	if !ok {
		log.Fatal("missing Definitons header")
	}

	seen := make(map[string]struct{})
	list := make([]wordRecord, 0, len(rows)-1)

	for _, row := range rows[1:] {
		word := strings.TrimSpace(cell(row, wordIndex))
		definition := strings.TrimSpace(cell(row, defIndex))
		if word == "" || definition == "" {
			continue
		}

		key := strings.ToLower(word + "::" + definition)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}

		list = append(list, wordRecord{
			Word:       word,
			Definition: definition,
		})
	}

	sort.SliceStable(list, func(i, j int) bool {
		return strings.ToLower(list[i].Word) < strings.ToLower(list[j].Word)
	})

	for index := range list {
		list[index].ID = index + 1
		list[index].Slug = slugify(list[index].Word)
	}

	meta := metaRecord{
		Version:     time.Now().UTC().Format("2006-01-02"),
		GeneratedAt: time.Now().UTC(),
		TotalWords:  len(list),
	}

	if err := writeJSON(filepath.Join(root, "data", "words.json"), list); err != nil {
		log.Fatalf("write words dataset: %v", err)
	}
	if err := writeJSON(filepath.Join(root, "data", "meta.json"), meta); err != nil {
		log.Fatalf("write meta dataset: %v", err)
	}
	if err := writeJSON(filepath.Join(root, "backend", "internal", "words", "embed", "words.json"), list); err != nil {
		log.Fatalf("write embedded words dataset: %v", err)
	}
	if err := writeJSON(filepath.Join(root, "backend", "internal", "words", "embed", "meta.json"), meta); err != nil {
		log.Fatalf("write embedded meta dataset: %v", err)
	}

	fmt.Printf("generated %d normalized words\n", len(list))
}

func headerIndex(header []string) map[string]int {
	out := make(map[string]int, len(header))
	for index, item := range header {
		out[strings.ToLower(strings.TrimSpace(item))] = index
	}
	return out
}

func cell(row []string, index int) string {
	if index < 0 || index >= len(row) {
		return ""
	}
	return row[index]
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer("'", "", "\"", "", "/", "-", " ", "-")
	value = replacer.Replace(value)
	parts := strings.FieldsFunc(value, func(r rune) bool {
		return !(r >= 'a' && r <= 'z') && !(r >= '0' && r <= '9') && r != '-'
	})
	slug := strings.Join(parts, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		return "word"
	}
	return slug
}

func writeJSON(path string, payload any) error {
	bytes, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return err
	}
	bytes = append(bytes, '\n')
	return os.WriteFile(path, bytes, 0o644)
}
