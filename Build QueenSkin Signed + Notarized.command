#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="$ROOT_DIR/scripts/macos/build-signed-notarized.sh"

if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Could not find script: $SCRIPT_PATH"
  read -r "?Press Enter to close..."
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "Rust cargo is not installed or not in PATH."
  echo "Install Rust from https://rustup.rs and try again."
  read -r "?Press Enter to close..."
  exit 1
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "xcrun is not available. Install Xcode Command Line Tools first."
  read -r "?Press Enter to close..."
  exit 1
fi

echo "Running signed + notarized build pipeline from: $ROOT_DIR"
"$SCRIPT_PATH"

echo ""
echo "Done."
read -r "?Press Enter to close..."
