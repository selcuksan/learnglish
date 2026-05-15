package words

import "time"

type Word struct {
	ID         int    `json:"id"`
	Word       string `json:"word"`
	Definition string `json:"definition"`
	Slug       string `json:"slug"`
}

type Meta struct {
	Version     string    `json:"version"`
	GeneratedAt time.Time `json:"generatedAt"`
	TotalWords  int       `json:"totalWords"`
}
