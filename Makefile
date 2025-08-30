.PHONY: install start dev build clean help

# Default target
help:
	@echo "GITP - Git Branch Explorer"
	@echo ""
	@echo "Available commands:"
	@echo "  install    Install dependencies"
	@echo "  start      Run the application"
	@echo "  dev        Run in development mode with watch"
	@echo "  build      Build the application"
	@echo "  clean      Clean build artifacts"
	@echo "  help       Show this help message"

# Install dependencies
install:
	bun install

# Start the application
start: install
	bun run start

# Development mode with watch
dev: install
	bun run dev

# Build the application
build: install
	bun run build

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/

# Make the script executable
setup:
	chmod +x src/index.js
