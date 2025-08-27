#!/bin/bash

# GITP Installer Script
# This script installs gitp to your system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BINARY_NAME="gitp"
INSTALL_DIR="/usr/local/bin"
BACKUP_DIR="/tmp/gitp-backup"
VERSION="1.0.0"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect OS and architecture
detect_system() {
    OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    ARCH="$(uname -m)"
    
    case "$ARCH" in
        x86_64) ARCH="amd64" ;;
        arm64) ARCH="arm64" ;;
        aarch64) ARCH="arm64" ;;
        *) ARCH="amd64" ;;
    esac
    
    print_status "Detected system: $OS $ARCH"
}

# Function to download binary
download_binary() {
    print_status "Downloading gitp binary for $OS $ARCH..."
    
    # Determine the correct binary name
    if [ "$OS" = "darwin" ]; then
        OS_NAME="darwin"
    elif [ "$OS" = "linux" ]; then
        OS_NAME="linux"
    else
        print_error "Unsupported operating system: $OS"
        exit 1
    fi
    
    BINARY_FILE="gitp-$OS_NAME-$ARCH"
    if [ "$OS" = "windows" ]; then
        BINARY_FILE="$BINARY_FILE.exe"
    fi
    
    # Download URL (replace with your actual domain)
    DOWNLOAD_URL="https://your-domain.com/releases/latest/$BINARY_FILE"
    
    print_status "Downloading from: $DOWNLOAD_URL"
    
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL -o "$BINARY_FILE" "$DOWNLOAD_URL"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$BINARY_FILE" "$DOWNLOAD_URL"
    else
        print_error "Neither curl nor wget is installed. Please install one of them."
        exit 1
    fi
    
    if [ ! -f "$BINARY_FILE" ]; then
        print_error "Failed to download binary"
        exit 1
    fi
    
    chmod +x "$BINARY_FILE"
    print_success "Binary downloaded successfully!"
}

# Function to backup existing installation
backup_existing() {
    if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
        print_warning "Existing $BINARY_NAME found. Creating backup..."
        mkdir -p "$BACKUP_DIR"
        cp "$INSTALL_DIR/$BINARY_NAME" "$BACKUP_DIR/$BINARY_NAME.backup"
        print_success "Backup created at $BACKUP_DIR/$BINARY_NAME.backup"
    fi
}

# Function to install binary
install_binary() {
    print_status "Installing $BINARY_NAME to $INSTALL_DIR..."
    
    if [ ! -w "$INSTALL_DIR" ]; then
        print_status "Need sudo privileges to install to $INSTALL_DIR"
        if ! sudo cp "$BINARY_FILE" "$INSTALL_DIR/$BINARY_NAME"; then
            print_error "Failed to install $BINARY_NAME"
            exit 1
        fi
        sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"
    else
        cp "$BINARY_FILE" "$INSTALL_DIR/$BINARY_NAME"
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    fi
    
    print_success "$BINARY_NAME installed successfully!"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        print_success "$BINARY_NAME is now available system-wide!"
        print_status "You can run: $BINARY_NAME --help"
    else
        print_error "Installation verification failed. $BINARY_NAME not found in PATH."
        print_status "You may need to restart your terminal or add $INSTALL_DIR to your PATH."
        exit 1
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f "$BINARY_FILE"
    print_success "Cleanup complete!"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                        GITP Installer                       ║"
    echo "║              Pretty git branch exploration tool              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_status "Starting GITP installation..."
    
    # Detect system
    detect_system
    
    # Download binary
    download_binary
    
    # Backup existing installation
    backup_existing
    
    # Install binary
    install_binary
    
    # Verify installation
    verify_installation
    
    # Cleanup
    cleanup
    
    echo ""
    print_success "🎉 GITP installation completed successfully!"
    print_status "You can now use 'gitp' from anywhere in your terminal."
    print_status "Try: gitp --help"
    echo ""
}

# Run main function
main "$@"
