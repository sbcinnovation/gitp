# GITP Distribution Guide

This guide explains how to distribute GITP so users can install it with a simple `curl | bash` command.

## Overview

The distribution system consists of:
1. **Release Builder** - Creates cross-platform binaries
2. **Web Installer** - Script that downloads and installs the correct binary
3. **Hosting Setup** - Where to host your binaries and install script

## Quick Start

### 1. Build Release Binaries

```bash
make release
```

This creates:
- Cross-platform binaries in `dist/` directory
- SHA256 checksums for verification
- An install script for distribution

### 2. Host Your Files

Upload the contents of `dist/` to your hosting service:
- **GitHub Releases** (recommended)
- **Your website**
- **CDN service**

### 3. Update Install URLs

Edit `web-install.sh` with your actual download URLs:

```bash
# Replace this line in web-install.sh
DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/latest/download/$BINARY_FILE"
```

### 4. Host the Install Script

Upload `web-install.sh` to your domain as `install` (no extension).

### 5. Users Can Install With

```bash
curl -fsSL https://your-domain.com/install | bash
```

## Detailed Workflow

### Step 1: Prepare for Release

1. Update version in `scripts/build-release.sh`:
   ```bash
   VERSION="1.1.0"  # Change this
   ```

2. Commit your changes:
   ```bash
   git add .
   git commit -m "Release v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

### Step 2: Build Release

```bash
make release
```

This creates:
```
dist/
├── gitp-darwin-amd64          # macOS Intel
├── gitp-darwin-amd64.sha256
├── gitp-darwin-arm64          # macOS Apple Silicon
├── gitp-darwin-arm64.sha256
├── gitp-linux-amd64           # Linux Intel
├── gitp-linux-amd64.sha256
├── gitp-linux-arm64           # Linux ARM
├── gitp-linux-arm64.sha256
├── gitp-windows-amd64.exe     # Windows
├── gitp-windows-amd64.exe.sha256
└── install.sh                  # Generated install script
```

### Step 3: Host on GitHub Releases

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.1.0`
4. Title: `Release v1.1.0`
5. Upload all files from `dist/` directory
6. Publish release

### Step 4: Update Install Script URLs

Edit `web-install.sh` to point to your GitHub releases:

```bash
# For GitHub releases, use this format:
DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/latest/download/$BINARY_FILE"

# Or for a specific version:
DOWNLOAD_URL="https://github.com/yourusername/gitp/releases/download/v1.1.0/$BINARY_FILE"
```

### Step 5: Host Install Script

Upload `web-install.sh` to your domain:
- **URL**: `https://your-domain.com/install`
- **Content-Type**: `text/plain` or `application/x-sh`
- **Permissions**: Make sure it's publicly accessible

## Alternative Hosting Options

### Option A: GitHub Releases (Recommended)

**Pros:**
- Free hosting
- Automatic versioning
- Built-in checksums
- CDN distribution

**Setup:**
1. Use the release workflow above
2. Install script downloads from `https://github.com/username/repo/releases/latest/download/`

### Option B: Your Website

**Pros:**
- Full control over URLs
- Custom branding
- Analytics tracking

**Setup:**
1. Upload binaries to your server
2. Update `DOWNLOAD_URL` in install script
3. Host install script at `https://your-domain.com/install`

### Option C: CDN Service

**Pros:**
- Global distribution
- High performance
- Automatic caching

**Setup:**
1. Upload to CDN (Cloudflare, AWS CloudFront, etc.)
2. Update `DOWNLOAD_URL` in install script
3. Host install script separately

## Security Considerations

### Checksum Verification

The release builder creates SHA256 checksums. Users can verify downloads:

```bash
# Download binary and checksum
curl -fsSL -o gitp-darwin-amd64 https://github.com/username/gitp/releases/latest/download/gitp-darwin-amd64
curl -fsSL -o gitp-darwin-amd64.sha256 https://github.com/username/gitp/releases/latest/download/gitp-darwin-amd64.sha256

# Verify checksum
shasum -a 256 -c gitp-darwin-amd64.sha256
```

### HTTPS Only

Always use HTTPS for downloads and install scripts to prevent MITM attacks.

### Minimal Permissions

The install script only requires:
- Read access to download binary
- Write access to `/usr/local/bin` (with sudo)

## Testing Your Distribution

### Test Local Build

```bash
# Build and test locally
make release
./dist/install.sh
```

### Test Web Install

1. Host your install script temporarily
2. Test from a clean environment:
   ```bash
   # Test on macOS
   curl -fsSL https://your-domain.com/install | bash
   
   # Test on Linux
   wget -qO- https://your-domain.com/install | bash
   ```

### Test Cross-Platform

Use Docker or virtual machines to test different platforms:
```bash
# Test Linux build
docker run --rm -v $(pwd):/app -w /app ubuntu:20.04 ./dist/gitp-linux-amd64 --help

# Test Windows build (if you have Wine)
wine ./dist/gitp-windows-amd64.exe --help
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure install script is executable
2. **Binary Not Found**: Check download URLs in install script
3. **PATH Issues**: Verify `/usr/local/bin` is in user's PATH
4. **Architecture Mismatch**: Ensure correct binary for user's system

### Debug Mode

Add debugging to install script:
```bash
# Add this line to web-install.sh
set -x  # Print commands as they execute
```

### User Support

Provide users with:
- Installation command: `curl -fsSL https://your-domain.com/install | bash`
- Manual download: Direct links to binaries
- Troubleshooting: Common issues and solutions

## Example Website Integration

### Simple HTML Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Install GITP</title>
</head>
<body>
    <h1>Install GITP</h1>
    <p>Install with one command:</p>
    <pre><code>curl -fsSL https://your-domain.com/install | bash</code></pre>
    
    <h2>Manual Download</h2>
    <ul>
        <li><a href="https://github.com/username/gitp/releases/latest/download/gitp-darwin-amd64">macOS Intel</a></li>
        <li><a href="https://github.com/username/gitp/releases/latest/download/gitp-darwin-arm64">macOS Apple Silicon</a></li>
        <li><a href="https://github.com/username/gitp/releases/latest/download/gitp-linux-amd64">Linux Intel</a></li>
        <li><a href="https://github.com/username/gitp/releases/latest/download/gitp-linux-arm64">Linux ARM</a></li>
        <li><a href="https://github.com/username/gitp/releases/latest/download/gitp-windows-amd64.exe">Windows</a></li>
    </ul>
</body>
</html>
```

## Conclusion

With this distribution system, users can install GITP with a single command:

```bash
curl -fsSL https://your-domain.com/install | bash
```

The system automatically:
- Detects the user's operating system and architecture
- Downloads the appropriate binary
- Installs it system-wide
- Provides verification and cleanup

This creates a professional, user-friendly installation experience similar to popular tools like Homebrew, Rust, and others.
