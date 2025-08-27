package app

import (
	"fmt"
	"log"

	"gitp/git"
	"gitp/ui"

	tea "github.com/charmbracelet/bubbletea"
)

type App struct {
	gitClient *git.Client
	ui        *ui.Model
}

func NewApp(branchName string) *App {
	gitClient, err := git.NewClient(branchName)
	if err != nil {
		log.Fatalf("Failed to initialize git client: %v", err)
	}

	commits, err := gitClient.GetCommits()
	if err != nil {
		log.Fatalf("Failed to get commits: %v", err)
	}

	ui := ui.NewModel(commits)

	return &App{
		gitClient: gitClient,
		ui:        ui,
	}
}

func (a *App) Run() error {
	p := tea.NewProgram(
		a.ui,
		tea.WithAltScreen(),
		tea.WithMouseCellMotion(),
	)

	if _, err := p.Run(); err != nil {
		return fmt.Errorf("failed to run program: %w", err)
	}

	return nil
}
