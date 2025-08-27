#!/bin/bash

# GITP Installer Script
# This script installs gitp to your system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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
    
    # This would be your actual download URL
    # DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/latest/download/gitp-$OS-$ARCH"
    # For now, we'll build locally since this is a development setup
    
    print_status "Building gitp from source..."
    
    if ! command_exists go; then
        print_error "Go is not installed. Please install Go 1.21 or later first."
        print_error "Visit: https://golang.org/doc/install"
        exit 1
    fi
    
    # Build the binary
    if [ -f "go.mod" ] && [ -f "main.go" ]; then
        print_status "Building from source..."
        go build -o "$BINARY_NAME" .
    else
        print_error "Not in a gitp source directory. Please run this script from the gitp project root."
        exit 1
    fi
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
    
    # Check if we have write permissions
    if [ ! -w "$INSTALL_DIR" ]; then
        print_status "Need sudo privileges to install to $INSTALL_DIR"
        if ! sudo cp "$BINARY_NAME" "$INSTALL_DIR/"; then
            print_error "Failed to install $BINARY_NAME"
            exit 1
        fi
        sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"
    else
        cp "$BINARY_NAME" "$INSTALL_DIR/"
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    fi
    
    print_success "$BINARY_NAME installed successfully!"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    if command_exists "$BINARY_NAME"; then
        print_success "$BINARY_NAME is now available system-wide!"
        print_status "You can run: $BINARY_NAME --help"
        
        # Test the binary
        if "$BINARY_NAME" --help >/dev/null 2>&1; then
            print_success "Binary test successful!"
        else
            print_warning "Binary installed but test failed. You may need to restart your terminal."
        fi
    else
        print_error "Installation verification failed. $BINARY_NAME not found in PATH."
        print_status "You may need to restart your terminal or add $INSTALL_DIR to your PATH."
        exit 1
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f "$BINARY_NAME"
    print_success "Cleanup complete!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --version  Show version information"
    echo "  --uninstall    Uninstall gitp"
    echo ""
    echo "Examples:"
    echo "  $0                    # Install gitp"
    echo "  $0 --uninstall        # Uninstall gitp"
    echo ""
    echo "Or install directly from the web:"
    echo "  curl -fsSL https://your-domain.com/install.sh | bash"
}

# Function to uninstall
uninstall() {
    print_status "Uninstalling $BINARY_NAME..."
    
    if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
        if [ ! -w "$INSTALL_DIR" ]; then
            sudo rm -f "$INSTALL_DIR/$BINARY_NAME"
        else
            rm -f "$INSTALL_DIR/$BINARY_NAME"
        fi
        print_success "$BINARY_NAME uninstalled successfully!"
        
        # Restore backup if it exists
        if [ -f "$BACKUP_DIR/$BINARY_NAME.backup" ]; then
            print_status "Restoring previous version..."
            if [ ! -w "$INSTALL_DIR" ]; then
                sudo cp "$BACKUP_DIR/$BINARY_NAME.backup" "$INSTALL_DIR/$BINARY_NAME"
                sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"
            else
                cp "$BACKUP_DIR/$BINARY_NAME.backup" "$INSTALL_DIR/$BINARY_NAME"
                chmod +x "$INSTALL_DIR/$BINARY_NAME"
            fi
            print_success "Previous version restored!"
        fi
    else
        print_warning "$BINARY_NAME not found in $INSTALL_DIR"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                        GITP Installer                       ║"
    echo "║              Pretty git branch exploration tool              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--version)
                echo "GITP Installer v$VERSION"
                exit 0
                ;;
            --uninstall)
                uninstall
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting GITP installation..."
    
    # Detect system
    detect_system
    
    # Download/build binary
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
