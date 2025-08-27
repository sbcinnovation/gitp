# GITP Usage Guide

## Quick Start

1. **Build the application:**

   ```bash
   make build
   ```

2. **Run with a branch name:**
   ```bash
   ./bin/gitp main
   ```

## Navigation

### Basic Movement

- `j` - Move down to next commit
- `k` - Move up to previous commit
- `gg` - Jump to top of commit list
- `G` - Jump to bottom of commit list

### Advanced Navigation

- `Ctrl+d` - Page down (10 commits)
- `Ctrl+u` - Page up (10 commits)

### Actions

- `Space` - Toggle commit collapse/expand
- `h` - Toggle help view
- `q` or `Ctrl+c` - Quit application

## Understanding the Display

### Commit Line Format

```
▶ abc1234 Commit message • Author Name • 2024-01-15 14:30
```

- `▶` - Current selection indicator
- `abc1234` - Short commit hash
- `Commit message` - Commit description
- `Author Name` - Who made the commit
- `2024-01-15 14:30` - When the commit was made

### File Changes

```
    A newfile.go (+15/-0)
    M modified.go (+3/-1)
    D deleted.go (+0/-8)
```

- `A` (Green) - File added
- `M` (Orange) - File modified
- `D` (Red) - File deleted
- `(+15/-0)` - Lines added/removed

## Examples

### Explore Current Branch

```bash
# Get current branch name
git branch --show-current

# Explore current branch
./bin/gitp $(git branch --show-current)
```

### Explore Specific Branch

```bash
# Explore main branch
./bin/gitp main

# Explore feature branch
./bin/gitp feature/new-feature

# Explore remote branch
./bin/gitp origin/main
```

### Using Makefile

```bash
# Build and run in one command
make run BRANCH=main

# Development mode with auto-reload
make dev BRANCH=main
```

## Troubleshooting

### Common Issues

1. **"Not in git repository"**

   - Ensure you're running the command from within a git repository
   - Check with `git status`

2. **"Branch not found"**

   - Verify the branch exists with `git branch -a`
   - Use exact branch name (case-sensitive)

3. **No commits shown**
   - Check if the branch has any commits
   - Verify you're in the correct repository

### Debug Mode

```bash
# Run with verbose output
GITP_DEBUG=1 ./bin/gitp main
```

## Integration

### With Git Aliases

Add to your `~/.gitconfig`:

```ini
[alias]
    explore = !./path/to/gitp/bin/gitp
```

Then use:

```bash
git explore main
```

### With Shell Functions

Add to your shell profile:

```bash
gitp() {
    ./path/to/gitp/bin/gitp "$@"
}
```

## Advanced Features

### Custom Styling

The application uses Lip Gloss for styling. You can customize colors by modifying the style definitions in `ui/model.go`.

### Keyboard Shortcuts

All VIM-style shortcuts are configurable in the `ui/model.go` file. The current mapping follows standard VIM conventions.

## Contributing

See the main README.md for contribution guidelines. The application is built with a modular architecture making it easy to extend and modify.
