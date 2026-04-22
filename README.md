# QueenSkin Editor

QueenSkin Editor was designed out of a lack of good skin editors.  
It is built to be precise, user-friendly, and fun to work in.

This app is currently in its community phase. The goal is to keep improving it quickly, so feedback, bug reports, and feature requests are all welcome.

## What It Is

QueenSkin Editor is an offline desktop editor for Minecraft skins with:

- 2D + 3D synced editing
- Pixel-perfect brush behavior
- Layer-based workflow
- Classic and Slim skin support
- Native project files (`.qse`) plus PNG/OBJ export

## Quick Start

1. Open QueenSkin Editor.
2. In the Library, create a new project or open/import an existing `.qse` or `.png`.
3. Paint in 2D or directly on the 3D model.
4. Save your project (`.qse`) and export your final skin (`.png`).

## Core Controls

- `Q`: Pencil
- `E`: Eraser
- `F`: Fill
- `M`: Box Select
- `I`: Eyedropper
- `W`: Zoom tool
- `Space + Drag`: Pan 2D canvas / rotate 3D viewport
- `Shift + Drag` (3D viewport): Pan 3D viewport
- Mouse wheel (3D viewport): Zoom
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo
- `Cmd/Ctrl + K`: Keybinds panel

Note: Keybinds are editable in `File -> Keybinds`.

## Files and Formats

- Project file: `.qse`
- Open/import: `.qse`, `.png`
- Export: `.png`, `.obj`

## First-Run Notes

If you are running an unsigned community build:

- macOS may show a security warning. Use `Right click -> Open` on first launch.
- Windows may show SmartScreen warnings for unsigned builds.

## Release Builds

- Local signed/notarized macOS pipeline:
  - `./scripts/macos/build-signed-notarized.sh`
  - Or double click `Build QueenSkin Signed + Notarized.command`
- Local Windows EXE build (on Windows machine):
  - `.\scripts\windows\build-exe.ps1`
- GitHub Actions installer pipeline:
  - `.github/workflows/build-installers.yml`
  - Produces macOS `.dmg` and Windows `.exe` artifacts on tag pushes (`v*`) or manual run.

## Community Phase

This is an actively evolving build. If something feels off, or if you want a feature, please report it where you got the build (issue tracker, release comments, or project page).
