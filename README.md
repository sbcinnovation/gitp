# GITP: Pretty git branch exploration for the terminal

A beautiful, terminal-based git branch explorer built in Go with VIM keybindings. GITP provides an intuitive way to explore commit history and file changes in any git branch without the need for pushing or committing.

## Features

- **Terminal-based interface** - Works in any terminal emulator
- **VIM keybindings** - Familiar navigation for VIM users
- **Chronological commit listing** - View commits in chronological order
- **Collapsible commits** - Toggle commit details on/off
- **Beautiful file change display** - Color-coded file status indicators
- **No write operations** - Read-only exploration of git history
- **Cross-platform** - Works on macOS, Linux, and Windows

## Installation

### Prerequisites

- Go 1.21 or later (for building from source)
- Git repository with the target branch

### Quick Install (Recommended)

Install directly from GitHub with a single command:

```bash
# Install the latest version
curl -fsSL https://raw.githubusercontent.com/yourusername/gitp/latest/install.sh | bash

# Or if you prefer wget
wget -qO- https://raw.githubusercontent.com/yourusername/gitp/latest/install.sh | bash

# Or install from a specific release
curl -fsSL https://raw.githubusercontent.com/yourusername/gitp/v1.0.0/install.sh | bash
```

### Build from source

```bash
# Clone the repository
git clone <your-repo-url>
cd gitp

# Install dependencies
make deps

# Build the application
make build

# Install to system
make install

# Or build release binaries for distribution
make release
```

### Manual Installation

If you prefer to install manually:

```bash
# Download the appropriate binary for your system
# Visit: https://github.com/yourusername/gitp/releases

# Make it executable and move to PATH
chmod +x gitp-darwin-amd64
sudo mv gitp-darwin-amd64 /usr/local/bin/gitp
```

## Usage

### Basic usage

```bash
# Explore commits in the main branch
./bin/gitp main

# Explore commits in a feature branch
./bin/gitp feature/new-feature

# If installed system-wide
gitp main
```

### Using Makefile

```bash
# Build and run
make run BRANCH=main

# Development mode with auto-reload
make dev BRANCH=main
```

## Keybindings

### Navigation

- `j` / `k` - Move down/up through commits
- `gg` - Go to top of commit list
- `G` - Go to bottom of commit list
- `Ctrl+d` - Page down
- `Ctrl+u` - Page up

### Actions

- `Space` - Toggle commit collapse/expand
- `h` - Toggle help view
- `q` / `Ctrl+c` - Quit application

## File Status Indicators

- **A** (Green) - File added
- **M** (Orange) - File modified
- **D** (Red) - File deleted

Each file shows the number of additions and deletions in parentheses.

## Architecture

The application is built with a clean, modular architecture:

- **`main.go`** - Application entry point and argument handling
- **`app/app.go`** - Main application logic and bubbletea setup
- **`git/client.go`** - Git repository operations and commit parsing
- **`ui/model.go`** - Terminal UI with bubbletea model

## Dependencies

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - Terminal UI framework
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) - Terminal styling
- [go-git](https://github.com/go-git/go-git) - Git operations in Go

## Development

### Project structure

```
gitp/
├── main.go          # Application entry point
├── go.mod           # Go module definition
├── Makefile         # Build and development tasks
├── README.md        # This file
├── app/             # Application logic
│   └── app.go       # Main app structure
├── git/             # Git operations
│   └── client.go    # Git client and commit parsing
└── ui/              # User interface
    └── model.go     # Bubbletea UI model
```

### Running tests

```bash
make test
```

### Building

```bash
make build
```

## Distribution

### Building Release Binaries

To create distributable binaries for all platforms:

```bash
make release
```

This will:

- Build binaries for macOS (Intel/Apple Silicon), Linux (Intel/ARM), and Windows
- Create SHA256 checksums for verification
- Generate an install script for easy distribution

### Setting Up Web Installation

1. **Build release binaries**: `make release`
2. **Upload to your hosting service** (GitHub Releases, your website, etc.)
3. **Host the install script**: Upload `web-install.sh` to your domain
4. **Update URLs**: Edit `web-install.sh` with your actual download URLs
5. **Users can install with**: `curl -fsSL https://your-domain.com/install | bash`

### Release Workflow

```bash
# 1. Update version in scripts/build-release.sh
# 2. Build release binaries
make release

# 3. Upload dist/ directory contents to your hosting service
# 4. Update your website with the curl | bash install command
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]

## Screenshots

[Add screenshots of the application in action]
