package words

import "testing"

func TestRepositoryLoadsEmbeddedDataset(t *testing.T) {
	repo, err := NewRepository()
	if err != nil {
		t.Fatalf("NewRepository() error = %v", err)
	}

	if repo.Meta().TotalWords == 0 {
		t.Fatal("expected embedded dataset to contain words")
	}

	results, total := repo.List("abuse", 10, 0)
	if total == 0 || len(results) == 0 {
		t.Fatal("expected search results for known word")
	}

	if results[0].Word == "" || results[0].Definition == "" {
		t.Fatal("expected populated word record")
	}

	if results[0].ExampleSentence == "" {
		t.Fatal("expected example sentence enrichment on word record")
	}
}
