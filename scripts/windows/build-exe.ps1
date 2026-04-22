Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$TauriDir = Join-Path $RootDir "src-tauri"

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
  throw "Rust cargo is not installed or not in PATH."
}

Push-Location $TauriDir
try {
  cargo tauri -V | Out-Null
  Write-Host "Building QueenSkin Windows EXE (NSIS) from: $TauriDir"
  cargo tauri build --bundles nsis
  Write-Host "Done. Output: $TauriDir\target\release\bundle\nsis"
}
finally {
  Pop-Location
}
