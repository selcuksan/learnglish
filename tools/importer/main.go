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
	ID              int    `json:"id"`
	Word            string `json:"word"`
	Definition      string `json:"definition"`
	Slug            string `json:"slug"`
	ExampleSentence string `json:"exampleSentence"`
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
			Word:            word,
			Definition:      definition,
			ExampleSentence: buildExampleSentence(word, definition),
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

var exampleOverrides = map[string]string{
	"a":       "I saw a bird near the window this morning.",
	"about":   "We talked about the next lesson after dinner.",
	"above":   "The picture hangs above the sofa in the living room.",
	"abroad":  "She studied abroad for a year before starting work.",
	"after":   "We met after class to review the notes.",
	"against": "The ladder rested against the wall all afternoon.",
	"along":   "We walked along the river before sunset.",
	"around":  "They sat around the table and shared ideas.",
	"at":      "I will meet you at the station at noon.",
	"because": "We stayed inside because it was raining heavily.",
	"before":  "Finish the task before lunch if you can.",
	"between": "The cafe is between the bank and the post office.",
	"by":      "She sat by the window and started reading.",
	"down":    "The ball rolled down the hill after the kick.",
	"for":     "This shelf is for books, not for boxes.",
	"from":    "I got a message from my friend last night.",
	"in":      "The keys are in my bag next to the notebook.",
	"into":    "She walked into the room without making a sound.",
	"of":      "The cover of the book was bright red.",
	"on":      "The notebook is on the desk near the lamp.",
	"out":     "He went out for some fresh air after work.",
	"over":    "A narrow bridge runs over the river here.",
	"through": "Sunlight came through the window in long stripes.",
	"to":      "We went to the library after school.",
	"under":   "The cat slept under the chair all evening.",
	"with":    "She came with her brother to the meeting.",
	"without": "He left without his umbrella and got soaked.",
}

func buildExampleSentence(word, definition string) string {
	lowerWord := strings.ToLower(strings.TrimSpace(word))
	if sentence, ok := exampleOverrides[lowerWord]; ok {
		return sentence
	}

	lowerDefinition := strings.ToLower(strings.TrimSpace(definition))

	switch {
	case strings.HasPrefix(lowerDefinition, "to "):
		return fmt.Sprintf("They %s the plan when the situation changes.", word)
	case strings.HasSuffix(lowerWord, "ly"):
		return fmt.Sprintf("She spoke %s so everyone could follow her clearly.", word)
	case looksLikeAdjective(lowerWord, lowerDefinition):
		return fmt.Sprintf("It was %s %s decision in a difficult moment.", articleFor(word), word)
	case looksLikePlaceWord(lowerDefinition):
		return fmt.Sprintf("The sign stayed %s the main entrance all day.", word)
	default:
		return fmt.Sprintf("The %s was important in that situation.", word)
	}
}

func looksLikeAdjective(word, definition string) bool {
	if strings.HasPrefix(definition, "having ") ||
		strings.HasPrefix(definition, "being ") ||
		strings.HasPrefix(definition, "full of ") ||
		strings.HasPrefix(definition, "complete ") ||
		strings.HasPrefix(definition, "concerning ") ||
		strings.HasPrefix(definition, "not ") ||
		strings.HasPrefix(definition, "used ") {
		return true
	}

	for _, suffix := range []string{"able", "ible", "al", "ful", "ic", "ive", "less", "ous", "ish"} {
		if strings.HasSuffix(word, suffix) {
			return true
		}
	}

	return false
}

func looksLikePlaceWord(definition string) bool {
	for _, prefix := range []string{
		"in or to ",
		"in a ",
		"in the ",
		"into ",
		"on ",
		"over ",
		"under ",
		"between ",
		"through ",
		"across ",
		"behind ",
		"near ",
	} {
		if strings.HasPrefix(definition, prefix) {
			return true
		}
	}

	return false
}

func articleFor(value string) string {
	trimmed := strings.TrimSpace(strings.ToLower(value))
	if trimmed == "" {
		return "a"
	}

	switch trimmed[0] {
	case 'a', 'e', 'i', 'o', 'u':
		return "an"
	default:
		return "a"
	}
}

func writeJSON(path string, payload any) error {
	bytes, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return err
	}
	bytes = append(bytes, '\n')
	return os.WriteFile(path, bytes, 0o644)
}
