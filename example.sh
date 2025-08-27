#!/bin/bash

# Example usage of the gitp application
# This script demonstrates how to use gitp to explore different branches

echo "GITP - Git Branch Explorer Example"
echo "=================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    echo "Please run this script from within a git repository"
    exit 1
fi

# Show available branches
echo "Available branches:"
git branch -a | sed 's/^/  /'
echo ""

# Check if gitp binary exists
if [ ! -f "./bin/gitp" ]; then
    echo "Building gitp application..."
    make build
    if [ $? -ne 0 ]; then
        echo "Error: Failed to build gitp application"
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Show usage examples
echo "Usage examples:"
echo "  ./bin/gitp $CURRENT_BRANCH    # Explore current branch"
echo "  ./bin/gitp main               # Explore main branch"
echo "  ./bin/gitp origin/main        # Explore remote main branch"
echo ""

# Show keybindings
echo "Keybindings:"
echo "  j/k     - Navigate up/down"
echo "  space   - Toggle commit collapse"
echo "  h       - Show help"
echo "  q       - Quit"
echo ""

echo "Ready to explore! Run: ./bin/gitp <branch-name>"
