# QueenSkin macOS Release Pipeline (Signed + Notarized)

This pipeline builds a release bundle, verifies signing, notarizes with Apple, and staples tickets to the final artifacts.

## 1) One-time setup

1. Ensure you have these in Apple Developer:
   - `Developer ID Application` certificate installed in Keychain.
   - Team ID.
   - Apple ID + app-specific password.
2. Install Rust and Tauri CLI:
   - `cargo install tauri-cli --version "^2" --locked`

## 2) Required environment variables

Set one of the notarization auth modes:

- Mode A (preferred local): keychain profile
  - `APPLE_NOTARYTOOL_PROFILE`

- Mode B (explicit credentials)
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
  - `APPLE_TEAM_ID`

Optional:

- `PRODUCT_NAME` (defaults to `QueenSkin Editor`)
- `BUNDLES` (defaults to `app,dmg`)
- `SKIP_NOTARIZE=1` (build/sign verify only)

## 3) Run the pipeline

From the project root:

```bash
./scripts/macos/build-signed-notarized.sh
```

Or use the clickable launcher:

`Build QueenSkin Signed + Notarized.command`

## 4) Output artifacts

Expected output locations:

- App: `src-tauri/target/release/bundle/macos/QueenSkin Editor.app`
- DMG: `src-tauri/target/release/bundle/dmg/QueenSkin Editor_*.dmg`

The script verifies signatures, notarizes, then staples and validates tickets.

## 5) Notes

- `src-tauri/tauri.conf.json` now has `"bundle.active": true` for release bundling.
- If notarization fails, inspect terminal output from `xcrun notarytool submit ... --wait`.
- Cross-platform unsigned installer builds are automated in:
  - `.github/workflows/build-installers.yml` (macOS DMG + Windows EXE artifact upload).
