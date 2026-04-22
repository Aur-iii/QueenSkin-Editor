#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/aurifell/Desktop/Coding/QueenSkin Editor WORKING DIRECTORY"
APP_DIR="$ROOT_DIR/src-tauri"

if ! command -v cargo >/dev/null 2>&1; then
  echo "Rust cargo is not installed or not in PATH."
  echo "Install Rust from https://rustup.rs and try again."
  read -r "?Press Enter to close..."
  exit 1
fi

cd "$APP_DIR"
echo "Starting QueenSkin Editor from: $APP_DIR"
cargo run
