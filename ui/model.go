package ui

import (
	"fmt"
	"strings"

	"gitp/git"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type Model struct {
	commits    []git.Commit
	cursor     int
	viewOffset int
	width      int
	height     int
	showHelp   bool
}

var (
	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#7D56F4")).
			Padding(0, 1).
			Bold(true)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#626262")).
			Padding(0, 1)

	commitStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#DCD7BA")).
			Padding(0, 1)

	fileStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#7FB4CA")).
			Padding(0, 2)

	mutedFileStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#727169")).
			Padding(0, 2)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#727169")).
			Italic(true)
)

func NewModel(commits []git.Commit) *Model {
	return &Model{
		commits: commits,
		cursor:  0,
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "j", "down":
			if m.cursor < len(m.commits)-1 {
				m.cursor++
			}
		case "k", "up":
			if m.cursor > 0 {
				m.cursor--
			}
		case "gg":
			m.cursor = 0
		case "G":
			m.cursor = len(m.commits) - 1
		case "space":
			if m.cursor < len(m.commits) {
				m.commits[m.cursor].Collapsed = !m.commits[m.cursor].Collapsed
			}
		case "h":
			m.showHelp = !m.showHelp
		case "ctrl+d":
			if m.cursor+10 < len(m.commits) {
				m.cursor += 10
			} else {
				m.cursor = len(m.commits) - 1
			}
		case "ctrl+u":
			if m.cursor-10 >= 0 {
				m.cursor -= 10
			} else {
				m.cursor = 0
			}
		}
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	}

	return m, nil
}

func (m Model) View() string {
	if m.showHelp {
		return m.helpView()
	}

	var b strings.Builder

	// Title
	title := titleStyle.Render(fmt.Sprintf(" GITP - Branch Explorer (%d commits) ", len(m.commits)))
	b.WriteString(title)
	b.WriteString("\n\n")

	// Commits list
	for i, commit := range m.commits {
		if i < m.viewOffset {
			continue
		}

		// Check if we've exceeded the available height
		if i-m.viewOffset >= m.height-10 {
			break
		}

		// Commit line
		commitLine := m.renderCommitLine(i, commit)
		b.WriteString(commitLine)
		b.WriteString("\n")

		// Files (if not collapsed)
		if !commit.Collapsed {
			for _, file := range commit.Files {
				fileLine := m.renderFileLine(file)
				b.WriteString(fileLine)
				b.WriteString("\n")
			}
		}
	}

	// Footer
	b.WriteString("\n")
	footer := helpStyle.Render(" j/k: navigate • space: toggle • h: help • q: quit ")
	b.WriteString(footer)

	return b.String()
}

func (m Model) renderCommitLine(index int, commit git.Commit) string {
	var line strings.Builder

	// Cursor indicator
	if index == m.cursor {
		line.WriteString(selectedStyle.Render("▶ "))
	} else {
		line.WriteString("  ")
	}

	// Commit hash
	line.WriteString(commitStyle.Render(fmt.Sprintf("%s ", commit.Hash)))

	// Commit message (truncated if too long)
	message := commit.Message
	if len(message) > 50 {
		message = message[:47] + "..."
	}
	line.WriteString(commitStyle.Render(message))

	// Author and date
	line.WriteString(commitStyle.Render(fmt.Sprintf(" • %s • %s",
		commit.Author,
		commit.Date.Format("2006-01-02 15:04"))))

	// Collapse indicator
	if commit.Collapsed {
		line.WriteString(commitStyle.Render(" [collapsed]"))
	}

	return line.String()
}

func (m Model) renderFileLine(file git.FileChange) string {
	var line strings.Builder

	// File status and name
	statusColor := "#7FB4CA" // Default blue
	switch file.Status {
	case "A":
		statusColor = "#98BB6C" // Green for added
	case "D":
		statusColor = "#E46876" // Red for deleted
	case "M":
		statusColor = "#FFA066" // Orange for modified
	}

	statusStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(statusColor)).
		Bold(true)

	line.WriteString("    ")
	line.WriteString(statusStyle.Render(file.Status))
	line.WriteString(" ")

	// File name
	line.WriteString(fileStyle.Render(file.Name))

	// Changes count
	if file.Addition > 0 || file.Deletion > 0 {
		line.WriteString(fileStyle.Render(fmt.Sprintf(" (+%d/-%d)", file.Addition, file.Deletion)))
	}

	return line.String()
}

func (m Model) helpView() string {
	var b strings.Builder

	title := titleStyle.Render(" GITP - Help ")
	b.WriteString(title)
	b.WriteString("\n\n")

	helpText := []string{
		"Navigation:",
		"  j/k     - Move down/up",
		"  gg      - Go to top",
		"  G       - Go to bottom",
		"  ctrl+d  - Page down",
		"  ctrl+u  - Page up",
		"",
		"Actions:",
		"  space   - Toggle commit collapse",
		"  h       - Toggle this help",
		"  q       - Quit",
		"",
		"File Status:",
		"  A       - Added (green)",
		"  M       - Modified (orange)",
		"  D       - Deleted (red)",
	}

	for _, line := range helpText {
		b.WriteString(helpStyle.Render(line))
		b.WriteString("\n")
	}

	b.WriteString("\n")
	footer := helpStyle.Render(" Press h to return to commits view • q to quit ")
	b.WriteString(footer)

	return b.String()
}
