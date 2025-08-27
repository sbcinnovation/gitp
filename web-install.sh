#!/bin/bash

# GITP Web Installer
# This script can be hosted on a website and called with: curl -fsSL https://your-domain.com/install | bash

set -e

# Configuration
BINARY_NAME="gitp"
VERSION="1.0.0"
INSTALL_DIR="/usr/local/bin"
BACKUP_DIR="/tmp/gitp-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
        print_error "Please visit: https://github.com/yourusername/gitp/releases"
        exit 1
    fi
    
    BINARY_FILE="gitp-$OS_NAME-$ARCH"
    if [ "$OS" = "windows" ]; then
        BINARY_FILE="$BINARY_FILE.exe"
    fi
    
    # Download URL (GitHub Releases format)
    DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/latest/download/$BINARY_FILE"
    
    # Alternative: Use specific version instead of latest
    # DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/download/v1.0.0/$BINARY_FILE"
    
    print_status "Downloading from: $DOWNLOAD_URL"
    
    if command -v curl >/dev/null 2>&1; then
        if ! curl -fsSL -o "$BINARY_FILE" "$DOWNLOAD_URL"; then
            print_error "Failed to download binary from GitHub"
            print_error "Please check your internet connection and try again"
            exit 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -qO "$BINARY_FILE" "$DOWNLOAD_URL"; then
            print_error "Failed to download binary from GitHub"
            print_error "Please check your internet connection and try again"
            exit 1
        fi
    else
        print_error "Neither curl nor wget is installed. Please install one of them."
        print_error "On macOS: brew install curl"
        print_error "On Ubuntu/Debian: sudo apt-get install curl"
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

# Function to show uninstall info
show_uninstall_info() {
    echo ""
    print_status "To uninstall $BINARY_NAME, run:"
    echo "  sudo rm -f $INSTALL_DIR/$BINARY_NAME"
    echo ""
    print_status "If you created a backup, you can restore it with:"
    echo "  sudo cp $BACKUP_DIR/$BINARY_NAME.backup $INSTALL_DIR/$BINARY_NAME"
    echo ""
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
    
    # Show uninstall info
    show_uninstall_info
}

# Run main function
main "$@"
