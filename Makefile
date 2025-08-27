.PHONY: build run clean test install

# Build the application
build:
	go build -o bin/gitp .

# Run the application (requires branch name argument)
run: build
	@if [ -z "$(BRANCH)" ]; then \
		echo "Usage: make run BRANCH=<branch-name>"; \
		echo "Example: make run BRANCH=main"; \
		exit 1; \
	fi
	./bin/gitp $(BRANCH)

# Install dependencies
deps:
	go mod tidy
	go mod download

# Clean build artifacts
clean:
	rm -rf bin/

# Run tests
test:
	go test ./...

# Install to system
install: build
	cp bin/gitp /usr/local/bin/

# Development mode with auto-reload
dev:
	@if [ -z "$(BRANCH)" ]; then \
		echo "Usage: make dev BRANCH=<branch-name>"; \
		echo "Example: make dev BRANCH=main"; \
		exit 1; \
	fi
	air -c .air.toml

# Show help
help:
	@echo "Available targets:"
	@echo "  build   - Build the application"
	@echo "  run     - Run the application (requires BRANCH=<branch-name>)"
	@echo "  deps    - Install dependencies"
	@echo "  clean   - Clean build artifacts"
	@echo "  test    - Run tests"
	@echo "  install - Install to system"
	@echo "  dev     - Development mode with auto-reload (requires BRANCH=<branch-name>)"
	@echo "  help    - Show this help"
