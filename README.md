# GITP: Pretty git branch exploration for the terminal

A beautiful, terminal-based git branch explorer built with Bun and Ink. GITP provides an intuitive way to explore commit history and file changes in any git branch without the need for pushing or committing.

## TODO

- Add fuzzy search for finding branches
- Goreleaser equivalent

## Features

- 🌿 **Branch Navigation**: Browse all local and remote branches
- 🪟🔄 **Dynamic Git Diff views**: Readable giffs for the terminal
- 📝 **Commit History**: View commit messages and details
- 📁 **File Explorer**: See which files changed in each commit
- 🎨 **Beautiful UI**: Rich terminal interface with colors and navigation
- ⌨️ **VIM-like Controls**: Intuitive keyboard navigation
- 🔍 **Fuzzy Search**: Be fast, lightning fast.
- ⚡ **Fast**: Built with Bun for optimal performance

## Tech Stack

- **Bun** - Fast JavaScript runtime
- **Ink** - React for CLI apps
- **React** - UI framework

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd sbc-gitp
```

2. Install dependencies:

```bash
make install
# or
bun install
```

3. Make the script executable:

```bash
make setup
```

## Usage

### Quick Start

```bash
make start
# or
bun run start
```

### Development Mode

```bash
make dev
# or
bun run dev
```

### Build

```bash
make build
```

### Clean

```bash
make clean
```

## Controls

- **↑/↓ Arrow Keys**: Navigate through items
- **Enter**: Select item or view details
- **Esc**: Go back or exit
- **q**: Exit the application

## Navigation Flow

1. **Branches View**: Select a git branch to explore
2. **Commits View**: Browse commit history for the selected branch
3. **Files View**: See which files changed in the selected commit
4. **File Content**: View the actual file content at that commit

## Requirements

- **Bun**: Latest version (install from [bun.sh](https://bun.sh))
- **Git**: Must be in a git repository
- **Terminal**: Supports colors and arrow keys

## Development

The app is structured with React components and uses Ink for terminal rendering:

- `src/index.js` - Main application entry point
- Uses React hooks for state management
- Executes git commands to fetch repository data
- Provides a hierarchical navigation system

## License

MIT
