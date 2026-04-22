#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TAURI_DIR="${ROOT_DIR}/src-tauri"
PRODUCT_NAME="${PRODUCT_NAME:-QueenSkin Editor}"
BUNDLES="${BUNDLES:-app,dmg}"
SKIP_NOTARIZE="${SKIP_NOTARIZE:-0}"

function step() {
  printf "\n[%s] %s\n" "$(date +"%H:%M:%S")" "$1"
}

function die() {
  printf "\nERROR: %s\n" "$1" >&2
  exit 1
}

function require_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || die "Missing required command: ${cmd}"
}

function require_env() {
  local name="$1"
  [[ -n "${!name:-}" ]] || die "Missing required environment variable: ${name}"
}

function find_latest_dmg() {
  local dmg_dir="$1"
  find "$dmg_dir" -maxdepth 1 -type f -name "${PRODUCT_NAME}_*.dmg" -print 2>/dev/null | sort | tail -n 1
}

step "Preflight checks"
require_command cargo
require_command codesign
require_command ditto
require_command xcrun

if ! cargo tauri --help >/dev/null 2>&1; then
  die "Tauri CLI is not installed. Run: cargo install tauri-cli --version \"^2\" --locked"
fi

if [[ ! -d "$TAURI_DIR" ]]; then
  die "Could not find src-tauri at: $TAURI_DIR"
fi

step "Building Tauri bundles (${BUNDLES})"
(
  cd "$TAURI_DIR"
  cargo tauri build --bundles "$BUNDLES"
)

APP_PATH="${TAURI_DIR}/target/release/bundle/macos/${PRODUCT_NAME}.app"
DMG_DIR="${TAURI_DIR}/target/release/bundle/dmg"
DMG_PATH="$(find_latest_dmg "$DMG_DIR" || true)"

[[ -d "$APP_PATH" ]] || die "Expected app bundle not found: $APP_PATH"
if [[ "$BUNDLES" == *"dmg"* ]] && [[ -z "${DMG_PATH:-}" ]]; then
  die "Expected DMG bundle not found in: $DMG_DIR"
fi

step "Verifying code signature on app bundle"
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
spctl --assess --type execute --verbose=4 "$APP_PATH" || true

if [[ "$SKIP_NOTARIZE" == "1" ]]; then
  step "SKIP_NOTARIZE=1 set. Build/sign verification complete."
  printf "App: %s\n" "$APP_PATH"
  if [[ -n "${DMG_PATH:-}" ]]; then
    printf "DMG: %s\n" "$DMG_PATH"
  fi
  exit 0
fi

step "Preparing notarization auth"
NOTARY_AUTH=()
if [[ -n "${APPLE_NOTARYTOOL_PROFILE:-}" ]]; then
  NOTARY_AUTH+=(--keychain-profile "$APPLE_NOTARYTOOL_PROFILE")
else
  require_env APPLE_ID
  require_env APPLE_APP_SPECIFIC_PASSWORD
  require_env APPLE_TEAM_ID
  NOTARY_AUTH+=(--apple-id "$APPLE_ID")
  NOTARY_AUTH+=(--password "$APPLE_APP_SPECIFIC_PASSWORD")
  NOTARY_AUTH+=(--team-id "$APPLE_TEAM_ID")
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/qse-notary.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

APP_ZIP="${TMP_DIR}/${PRODUCT_NAME}.app.zip"

step "Compressing app bundle for notarization"
ditto -c -k --keepParent "$APP_PATH" "$APP_ZIP"

step "Submitting app zip for notarization"
xcrun notarytool submit "$APP_ZIP" "${NOTARY_AUTH[@]}" --wait

step "Stapling notarization ticket to app bundle"
xcrun stapler staple "$APP_PATH"
xcrun stapler validate "$APP_PATH"

if [[ -n "${DMG_PATH:-}" ]]; then
  step "Submitting DMG for notarization"
  xcrun notarytool submit "$DMG_PATH" "${NOTARY_AUTH[@]}" --wait

  step "Stapling notarization ticket to DMG"
  xcrun stapler staple "$DMG_PATH"
  xcrun stapler validate "$DMG_PATH"
fi

step "Done"
printf "Notarized app: %s\n" "$APP_PATH"
if [[ -n "${DMG_PATH:-}" ]]; then
  printf "Notarized DMG: %s\n" "$DMG_PATH"
fi
