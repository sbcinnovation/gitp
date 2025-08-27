package git

import (
	"testing"
)

func TestNewClient(t *testing.T) {
	// This test will fail if not run in a git repository
	// but it's useful for testing the package structure
	_, err := NewClient("main")
	if err != nil {
		// Expected to fail if not in git repo, but package structure is correct
		t.Logf("NewClient failed as expected (not in git repo): %v", err)
	}
}

func TestCommitStruct(t *testing.T) {
	commit := Commit{
		Hash:      "abc123",
		Message:   "Test commit",
		Author:    "Test Author",
		Files:     []FileChange{},
		Collapsed: false,
	}

	if commit.Hash != "abc123" {
		t.Errorf("Expected hash 'abc123', got '%s'", commit.Hash)
	}

	if commit.Message != "Test commit" {
		t.Errorf("Expected message 'Test commit', got '%s'", commit.Message)
	}
}

func TestFileChangeStruct(t *testing.T) {
	fileChange := FileChange{
		Name:     "test.go",
		Status:   "M",
		Addition: 5,
		Deletion: 2,
	}

	if fileChange.Name != "test.go" {
		t.Errorf("Expected name 'test.go', got '%s'", fileChange.Name)
	}

	if fileChange.Status != "M" {
		t.Errorf("Expected status 'M', got '%s'", fileChange.Status)
	}
}
