package git

import (
	"fmt"
	"sort"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

type Client struct {
	repo       *git.Repository
	branchName string
}

type Commit struct {
	Hash      string
	Message   string
	Author    string
	Date      time.Time
	Files     []FileChange
	Collapsed bool
}

type FileChange struct {
	Name     string
	Status   string
	Addition int
	Deletion int
}

func NewClient(branchName string) (*Client, error) {
	repo, err := git.PlainOpen(".")
	if err != nil {
		return nil, fmt.Errorf("failed to open git repository: %w", err)
	}

	return &Client{
		repo:       repo,
		branchName: branchName,
	}, nil
}

func (c *Client) GetCommits() ([]Commit, error) {
	// Get the commit object for the branch head
	// We need to find the commit hash for this branch
	ref, err := c.repo.Reference(plumbing.NewBranchReferenceName(c.branchName), true)
	if err != nil {
		return nil, fmt.Errorf("failed to get branch reference: %w", err)
	}

	commit, err := c.repo.CommitObject(ref.Hash())
	if err != nil {
		return nil, fmt.Errorf("failed to get commit object: %w", err)
	}

	var commits []Commit

	// Iterate through commit history
	err = c.iterateCommits(commit, &commits)
	if err != nil {
		return nil, fmt.Errorf("failed to iterate commits: %w", err)
	}

	// Sort commits by date (newest first)
	sort.Slice(commits, func(i, j int) bool {
		return commits[i].Date.After(commits[j].Date)
	})

	return commits, nil
}

func (c *Client) iterateCommits(commit *object.Commit, commits *[]Commit) error {
	if commit == nil {
		return nil
	}

	// Get files changed in this commit
	files, err := c.getFilesChanged(commit)
	if err != nil {
		return fmt.Errorf("failed to get files changed: %w", err)
	}

	*commits = append(*commits, Commit{
		Hash:      commit.Hash.String()[:8],
		Message:   commit.Message,
		Author:    commit.Author.Name,
		Date:      commit.Author.When,
		Files:     files,
		Collapsed: false,
	})

	// Get parent commits - handle the Parents() function properly
	parentIter := commit.Parents()
	for {
		parent, err := parentIter.Next()
		if err != nil {
			break
		}
		if err := c.iterateCommits(parent, commits); err != nil {
			return err
		}
	}

	return nil
}

func (c *Client) getFilesChanged(commit *object.Commit) ([]FileChange, error) {
	var files []FileChange

	// Get the parent commit if it exists
	parentIter := commit.Parents()
	parent, err := parentIter.Next()
	if err != nil {
		// This is the first commit, no files to compare
		return files, nil
	}

	// Get the diff between this commit and its parent
	patch, err := parent.Patch(commit)
	if err != nil {
		return nil, fmt.Errorf("failed to get patch: %w", err)
	}

	for _, filePatch := range patch.FilePatches() {
		from, to := filePatch.Files()

		var fileName string
		var status string

		if from != nil {
			fileName = from.Path()
		} else if to != nil {
			fileName = to.Path()
		}

		if from == nil && to != nil {
			status = "A" // Added
		} else if from != nil && to == nil {
			status = "D" // Deleted
		} else {
			status = "M" // Modified
		}

		// Calculate additions and deletions
		addition := 0
		deletion := 0

		for _, chunk := range filePatch.Chunks() {
			chunkType := chunk.Type()
			if chunkType == 1 { // Add
				addition += len(chunk.Content())
			} else if chunkType == 2 { // Delete
				deletion += len(chunk.Content())
			}
		}

		files = append(files, FileChange{
			Name:     fileName,
			Status:   status,
			Addition: addition,
			Deletion: deletion,
		})
	}

	return files, nil
}
