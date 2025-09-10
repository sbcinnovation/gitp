# GITP: Pretty git branch exploration for the terminal

_gitp = git print_

A beautiful, terminal-based git branch explorer built with Bun and Ink. `gitp` provides an intuitive way to explore commit history and file changes in any git branch without the need for pushing or committing.

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

## Navigation Flow

1. **Branches View**: Select a git branch to explore
2. **Commits View**: Browse commit history for the selected branch
3. **Files View**: See which files changed in the selected commit
4. **File Content**: View the actual file content at that commit

## Contributing

We welcome pull requests. If you're passionate about lmux and want to help long-term, we're open to adding maintainers, feel free to open an issue to introduce yourself!

## Requirements

- **Bun**: Latest version (install from [bun.sh](https://bun.sh))
- **Git**: Must be in a git repository
- **Terminal**: Supports colors and arrow keys

## License

MIT
