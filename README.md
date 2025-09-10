# gitp: Pretty git exploration for the terminal

_gitp = git print_
![gipt example](docs/assets/demo.gif)

A beautiful Cross-platform CLI for exploring git repos, built with Bun. `gitp` provides an intuitive way to explore commit history and file changes in any git.

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

### macOS (Homebrew)

```bash
brew install sbcinnovation/tap/gitp
```

### Windows (Scoop)

```powershell
scoop bucket add sbcinnovation https://github.com/sbcinnovation/scoop-bucket
scoop install gitp
```

### Linux

- Homebrew on Linux:

```bash
brew install sbcinnovation/tap/gitp
```

- Debian/Ubuntu (.deb):

Download the latest .deb from the [Releases page](https://github.com/sbcinnovation/sbc-gitp/releases), then:

```bash
sudo dpkg -i gitp_<version>_linux_amd64.deb   # or arm64
sudo apt-get -f install
```

- RHEL/CentOS/Fedora (.rpm):

Download the latest .rpm from the [Releases page](https://github.com/sbcinnovation/sbc-gitp/releases), then:

```bash
sudo rpm -i gitp_<version>_linux_x86_64.rpm   # or aarch64
```

### Install from source

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
