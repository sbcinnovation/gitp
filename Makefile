.PHONY: install start dev build clean help binary install-binary uninstall-binary

# Default target
help:
	@echo "GITP - Git Branch Explorer"
	@echo ""
	@echo "Available commands:"
	@echo "  install         Install dependencies"
	@echo "  start           Run the application"
	@echo "  dev             Run in development mode with watch"
	@echo "  build           Build the application"
	@echo "  binary          Create standalone binary executable"
	@echo "  install-binary  Install binary to system PATH (/usr/local/bin)"
	@echo "  uninstall-binary Remove binary from system PATH"
	@echo "  clean           Clean build artifacts"
	@echo "  help            Show this help message"

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

# Create portable script
binary: install
	mkdir -p dist
	@echo '#!/usr/bin/env bun' > dist/gitp
	@echo '' >> dist/gitp
	@echo '// Gitp - Git Branch Explorer' >> dist/gitp
	@echo '// This script runs the gitp application' >> dist/gitp
	@echo '' >> dist/gitp
	@echo 'import { join } from "path";' >> dist/gitp
	@echo 'import { spawn } from "child_process";' >> dist/gitp
	@echo '' >> dist/gitp
	@echo '// Project root directory (embedded during build)' >> dist/gitp
	@echo 'const PROJECT_ROOT = "$(shell pwd)";' >> dist/gitp
	@echo 'const scriptPath = join(PROJECT_ROOT, "src", "index.tsx");' >> dist/gitp
	@echo '' >> dist/gitp
	@echo '// Change to project directory to ensure node_modules are found' >> dist/gitp
	@echo 'process.chdir(PROJECT_ROOT);' >> dist/gitp
	@echo '' >> dist/gitp
	@echo 'spawn("bun", [scriptPath], { stdio: "inherit" });' >> dist/gitp
	chmod +x dist/gitp

# Install binary to system PATH
install-binary: binary
	@echo "Installing gitp to /usr/local/bin..."
	sudo cp dist/gitp /usr/local/bin/gitp
	@echo "gitp has been installed successfully!"
	@echo "You can now run 'gitp' from anywhere in your terminal."
	@echo "Note: This requires bun to be installed on the system."

# Uninstall binary from system PATH
uninstall-binary:
	@echo "Removing gitp binary from /usr/local/bin..."
	sudo rm -f /usr/local/bin/gitp
	@echo "gitp has been uninstalled successfully!"

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/

# Make the script executable
setup:
	chmod +x src/index.js
