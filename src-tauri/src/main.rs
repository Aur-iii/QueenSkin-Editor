#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    collections::{HashMap, HashSet},
    fs::{self, File},
    io::{Cursor, Read, Seek, Write},
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
    time::{SystemTime, UNIX_EPOCH},
};

use image::{DynamicImage, ImageFormat, RgbaImage};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, RunEvent, State};
use uuid::Uuid;
use zip::{write::SimpleFileOptions, CompressionMethod, ZipArchive, ZipWriter};

const QSE_FORMAT: &str = "qse";
const QSE_VERSION: u32 = 2;
const QSE_EXTENSION: &str = "qse";
const TEXTURE_SIZE: usize = 64;
const TEXTURE_PIXEL_COUNT: usize = TEXTURE_SIZE * TEXTURE_SIZE;
const TEXTURE_BYTE_LEN: usize = TEXTURE_PIXEL_COUNT * 4;
const DEFAULT_PAINT_LAYER_FILE: &str = "layers/paint.png";
const PREVIEW_PNG_FILE: &str = "preview.png";
const PART_NAMES: [&str; 6] = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
const OBJ_TEMPLATE_WIDE: &str = include_str!("../../src-ui/assets/skin-model-wide.obj");
const OBJ_TEMPLATE_SLIM: &str = include_str!("../../src-ui/assets/skin-model-slim.obj");
const APP_EXIT_REQUESTED_EVENT: &str = "qse://app-exit-requested";

#[derive(Default)]
struct ExitGuardState {
    allow_exit_once: AtomicBool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LayerMeta {
    id: String,
    name: String,
    #[serde(default = "default_true")]
    visible: bool,
    #[serde(default)]
    locked: bool,
    #[serde(default = "default_opacity")]
    opacity: f32,
    #[serde(default = "default_blend_mode")]
    blend_mode: String,
    #[serde(default)]
    file: String,
    #[serde(default = "default_layer_kind")]
    kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PartState {
    part: String,
    #[serde(default)]
    base_lock: bool,
    #[serde(default)]
    outer_lock: bool,
    #[serde(default = "default_true")]
    base_visibility: bool,
    #[serde(default = "default_true")]
    outer_visibility: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectDocument {
    format: String,
    #[serde(default = "default_project_version")]
    version: u32,
    name: String,
    arm_type: String,
    #[serde(default = "default_project_layers")]
    layers: Vec<LayerMeta>,
    #[serde(default = "default_parts")]
    parts: Vec<PartState>,
}

#[derive(Debug, Clone)]
struct ProjectBundle {
    project: ProjectDocument,
    layer_bitmaps: Vec<LayerBitmapPayload>,
    preview_png: Option<Vec<u8>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LayerBitmapPayload {
    layer_id: String,
    file: String,
    pixels: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectSummary {
    id: String,
    name: String,
    arm_type: String,
    updated_at: u64,
    layer_count: usize,
    path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoadedProject {
    summary: ProjectSummary,
    project: ProjectDocument,
    paint_pixels: Vec<u8>,
    #[serde(default)]
    layer_bitmaps: Vec<LayerBitmapPayload>,
    #[serde(default)]
    preview_png: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoadedAutosave {
    updated_at: u64,
    project: ProjectDocument,
    paint_pixels: Vec<u8>,
    #[serde(default)]
    layer_bitmaps: Vec<LayerBitmapPayload>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoragePaths {
    app_data_dir: String,
    projects_dir: String,
    autosave_dir: String,
    bin_dir: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct AutosaveSummary {
    id: String,
    updated_at: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateProjectInput {
    name: String,
    arm_type: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RenameProjectInput {
    id: String,
    name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveProjectInput {
    id: String,
    name: String,
    arm_type: String,
    layers: Vec<LayerMeta>,
    parts: Vec<PartState>,
    #[serde(default)]
    layer_bitmaps: Vec<LayerBitmapPayload>,
    paint_pixels: Vec<u8>,
    #[serde(default)]
    preview_png: Vec<u8>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveProjectAsInput {
    id: String,
    #[serde(default)]
    suggested_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportProjectAssetInput {
    #[serde(default)]
    suggested_name: String,
    arm_type: String,
    pixels: Vec<u8>,
    #[serde(default)]
    format: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportPreflightInput {
    arm_type: String,
    pixels: Vec<u8>,
    #[serde(default)]
    format: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportPreflightIssue {
    level: String,
    code: String,
    message: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportPreflightStats {
    arm_type: String,
    format: String,
    total_pixels: usize,
    opaque_pixels: usize,
    transparent_pixels: usize,
    semi_transparent_pixels: usize,
    visible_pixels: usize,
    unique_color_count: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportPreflightReport {
    ok: bool,
    warning_count: usize,
    error_count: usize,
    issues: Vec<ExportPreflightIssue>,
    stats: ExportPreflightStats,
}

impl ProjectDocument {
    fn new_blank(name: String, arm_type: String) -> Self {
        Self {
            format: QSE_FORMAT.to_string(),
            version: QSE_VERSION,
            name,
            arm_type,
            layers: default_project_layers(),
            parts: default_parts(),
        }
    }
}

#[tauri::command]
fn app_storage_paths(app: AppHandle) -> Result<StoragePaths, String> {
    let root = app_data_dir(&app)?;
    let projects = ensure_dir(root.join("projects"))?;
    let autosave = ensure_dir(root.join("autosave"))?;
    let bin = ensure_dir(root.join("bin"))?;

    Ok(StoragePaths {
        app_data_dir: root.to_string_lossy().to_string(),
        projects_dir: projects.to_string_lossy().to_string(),
        autosave_dir: autosave.to_string_lossy().to_string(),
        bin_dir: bin.to_string_lossy().to_string(),
    })
}

#[tauri::command]
fn list_internal_projects(app: AppHandle) -> Result<Vec<ProjectSummary>, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let mut summaries = Vec::new();

    let entries = fs::read_dir(&projects_dir).map_err(|err| err.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if !is_qse_file(&path) {
            continue;
        }

        match summary_from_path(&path) {
            Ok(summary) => summaries.push(summary),
            Err(err) => {
                eprintln!("Skipping unreadable project at {}: {}", path.display(), err);
            }
        }
    }

    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

#[tauri::command]
fn list_internal_bin_projects(app: AppHandle) -> Result<Vec<ProjectSummary>, String> {
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;
    let mut summaries = Vec::new();

    let entries = fs::read_dir(&bin_dir).map_err(|err| err.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if !is_qse_file(&path) {
            continue;
        }

        match summary_from_path(&path) {
            Ok(summary) => summaries.push(summary),
            Err(err) => {
                eprintln!(
                    "Skipping unreadable binned project at {}: {}",
                    path.display(),
                    err
                );
            }
        }
    }

    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

#[tauri::command]
fn create_internal_project(
    app: AppHandle,
    input: CreateProjectInput,
) -> Result<ProjectSummary, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;

    let name = input.name.trim();
    let safe_name = if name.is_empty() {
        "Untitled Project".to_string()
    } else {
        name.to_string()
    };

    let arm_type = normalize_arm_type(input.arm_type.as_deref());
    let id = Uuid::new_v4().to_string();
    let path = project_path(&projects_dir, &id);
    let project = ProjectDocument::new_blank(safe_name, arm_type);
    let paint_pixels = blank_texture_pixels();
    let bundle = ProjectBundle {
        layer_bitmaps: build_layer_bitmaps_from_paint_pixels(&project, paint_pixels.clone()),
        project,
        preview_png: None,
    };

    write_project_bundle(&path, &bundle)?;
    summary_from_path(&path)
}

#[tauri::command]
fn load_internal_project(app: AppHandle, id: String) -> Result<LoadedProject, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let path = project_path(&projects_dir, &id);
    if !path.exists() {
        return Err(format!("Project not found: {}", id));
    }

    let bundle = read_project_bundle(&path)?;
    let summary = summary_from_path(&path)?;
    let paint_pixels = primary_paint_pixels(&bundle.project, &bundle.layer_bitmaps);
    Ok(LoadedProject {
        summary,
        project: bundle.project,
        paint_pixels,
        layer_bitmaps: bundle.layer_bitmaps,
        preview_png: bundle.preview_png.unwrap_or_default(),
    })
}

#[tauri::command]
fn load_internal_bin_project(app: AppHandle, id: String) -> Result<LoadedProject, String> {
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;
    let path = project_path(&bin_dir, &id);
    if !path.exists() {
        return Err(format!("Binned project not found: {}", id));
    }

    let bundle = read_project_bundle(&path)?;
    let summary = summary_from_path(&path)?;
    let paint_pixels = primary_paint_pixels(&bundle.project, &bundle.layer_bitmaps);
    Ok(LoadedProject {
        summary,
        project: bundle.project,
        paint_pixels,
        layer_bitmaps: bundle.layer_bitmaps,
        preview_png: bundle.preview_png.unwrap_or_default(),
    })
}

#[tauri::command]
fn pick_project_file() -> Result<Option<String>, String> {
    let picked = rfd::FileDialog::new()
        .set_title("Open QueenSkin Project or Skin PNG")
        .add_filter("QueenSkin Project", &[QSE_EXTENSION])
        .add_filter("Skin PNG", &["png"])
        .pick_file();

    Ok(picked.map(|path| path.to_string_lossy().to_string()))
}

#[tauri::command]
fn import_external_project(app: AppHandle, path: String) -> Result<ProjectSummary, String> {
    let raw_path = path.trim();
    if raw_path.is_empty() {
        return Err("Missing file path".to_string());
    }

    let source_path = PathBuf::from(raw_path);
    if !source_path.exists() {
        return Err(format!("Project file not found: {}", raw_path));
    }

    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    if is_png_file(&source_path) {
        return import_png_as_project(&source_path, &projects_dir);
    }
    if !is_qse_file(&source_path) {
        return Err("Only .qse and .png files are supported".to_string());
    }

    let source_canonical = source_path
        .canonicalize()
        .map_err(|err| format!("Could not resolve selected file: {}", err))?;
    let projects_canonical = projects_dir
        .canonicalize()
        .unwrap_or_else(|_| projects_dir.clone());

    if source_canonical.starts_with(&projects_canonical) {
        return summary_from_path(&source_canonical);
    }

    let bundle = read_project_bundle(&source_canonical)?;
    let id = Uuid::new_v4().to_string();
    let destination = project_path(&projects_dir, &id);
    write_project_bundle(&destination, &bundle)?;
    summary_from_path(&destination)
}

#[tauri::command]
fn save_internal_project_as(app: AppHandle, input: SaveProjectAsInput) -> Result<Option<String>, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let source_id = input.id.trim();
    if source_id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let source_path = project_path(&projects_dir, source_id);
    if !source_path.exists() {
        return Err(format!("Project not found: {}", source_id));
    }

    let mut default_name = normalize_project_name(input.suggested_name.as_str());
    if !default_name.to_ascii_lowercase().ends_with(".qse") {
        default_name.push_str(".qse");
    }

    let picked = rfd::FileDialog::new()
        .set_title("Save QueenSkin Project As")
        .add_filter("QueenSkin Project", &[QSE_EXTENSION])
        .set_file_name(&default_name)
        .save_file();

    let Some(raw_destination) = picked else {
        return Ok(None);
    };
    let destination = ensure_extension(&raw_destination, QSE_EXTENSION);
    if destination.exists() {
        fs::remove_file(&destination).map_err(|err| err.to_string())?;
    }
    fs::copy(&source_path, &destination).map_err(|err| err.to_string())?;
    Ok(Some(destination.to_string_lossy().to_string()))
}

#[tauri::command]
fn export_project_asset(input: ExportProjectAssetInput) -> Result<Option<String>, String> {
    let requested_format = input
        .format
        .as_deref()
        .map(|value| value.trim().to_ascii_lowercase())
        .unwrap_or_default();

    let mut default_name = normalize_project_name(input.suggested_name.as_str());
    let mut dialog = rfd::FileDialog::new().set_title("Export QueenSkin Asset");

    if requested_format == "obj" {
        if !default_name.to_ascii_lowercase().ends_with(".obj") {
            default_name.push_str(".obj");
        }
        dialog = dialog.add_filter("Wavefront OBJ", &["obj"]);
    } else if requested_format == "png" {
        if !default_name.to_ascii_lowercase().ends_with(".png") {
            default_name.push_str(".png");
        }
        dialog = dialog.add_filter("PNG Image", &["png"]);
    } else {
        if !default_name.to_ascii_lowercase().ends_with(".png") {
            default_name.push_str(".png");
        }
        dialog = dialog
            .add_filter("PNG Image", &["png"])
            .add_filter("Wavefront OBJ", &["obj"]);
    }

    let picked = dialog.set_file_name(&default_name).save_file();

    let Some(raw_destination) = picked else {
        return Ok(None);
    };

    let pixels = normalize_texture_pixels(input.pixels)?;
    let destination_ext = if requested_format == "obj" {
        "obj".to_string()
    } else if requested_format == "png" {
        "png".to_string()
    } else {
        raw_destination
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_ascii_lowercase())
            .unwrap_or_else(|| "png".to_string())
    };

    if destination_ext == "obj" {
        let obj_path = ensure_extension(&raw_destination, "obj");
        export_obj_bundle(&obj_path, &normalize_arm_type(Some(input.arm_type.as_str())), &pixels)?;
        return Ok(Some(obj_path.to_string_lossy().to_string()));
    }

    let png_path = ensure_extension(&raw_destination, "png");
    let png_bytes = texture_pixels_to_png_bytes(&pixels)?;
    fs::write(&png_path, png_bytes).map_err(|err| err.to_string())?;
    Ok(Some(png_path.to_string_lossy().to_string()))
}

#[tauri::command]
fn export_project_preflight(input: ExportPreflightInput) -> Result<ExportPreflightReport, String> {
    let format = input
        .format
        .as_deref()
        .map(|value| value.trim().to_ascii_lowercase())
        .unwrap_or_else(|| "png".to_string());
    let arm_type = normalize_arm_type(Some(input.arm_type.as_str()));

    let pixels = input.pixels;
    let mut issues = Vec::new();
    if pixels.len() != TEXTURE_BYTE_LEN {
        issues.push(ExportPreflightIssue {
            level: "error".to_string(),
            code: "texture_size".to_string(),
            message: format!(
                "Invalid texture payload length {} (expected {}).",
                pixels.len(),
                TEXTURE_BYTE_LEN
            ),
        });
    }

    let mut opaque_pixels = 0usize;
    let mut transparent_pixels = 0usize;
    let mut semi_transparent_pixels = 0usize;
    let mut visible_pixels = 0usize;
    let mut unique_colors: HashSet<u32> = HashSet::new();

    for chunk in pixels.chunks_exact(4) {
        let r = chunk[0] as u32;
        let g = chunk[1] as u32;
        let b = chunk[2] as u32;
        let a = chunk[3];
        unique_colors.insert((r << 24) | (g << 16) | (b << 8) | a as u32);

        if a == 0 {
            transparent_pixels += 1;
        } else if a == 255 {
            opaque_pixels += 1;
            visible_pixels += 1;
        } else {
            semi_transparent_pixels += 1;
            visible_pixels += 1;
        }
    }

    if visible_pixels == 0 {
        issues.push(ExportPreflightIssue {
            level: "warning".to_string(),
            code: "blank_export".to_string(),
            message: "The texture is fully transparent.".to_string(),
        });
    }

    if semi_transparent_pixels > 0 {
        issues.push(ExportPreflightIssue {
            level: "warning".to_string(),
            code: "semi_alpha".to_string(),
            message: "Semi-transparent pixels found. Overlay alpha is valid, but verify expected in-game appearance.".to_string(),
        });
    }

    if transparent_pixels > 0 {
        issues.push(ExportPreflightIssue {
            level: "info".to_string(),
            code: "transparent_pixels".to_string(),
            message: "Transparent pixels found. This is valid for overlay/unused zones; verify intentional transparency.".to_string(),
        });
    }

    if format != "obj" && pixels.len() == TEXTURE_BYTE_LEN {
        let base_opacity_mask = build_java_base_opacity_mask(&arm_type);
        let mut base_transparent_pixels = 0usize;
        let mut base_semi_transparent_pixels = 0usize;

        for pixel_index in 0..TEXTURE_PIXEL_COUNT {
            if !base_opacity_mask[pixel_index] {
                continue;
            }
            let alpha = pixels[pixel_index * 4 + 3];
            if alpha == 0 {
                base_transparent_pixels += 1;
            } else if alpha < 255 {
                base_semi_transparent_pixels += 1;
            }
        }

        let base_non_opaque_pixels = base_transparent_pixels + base_semi_transparent_pixels;
        if base_non_opaque_pixels > 0 {
            issues.push(ExportPreflightIssue {
                level: "error".to_string(),
                code: "java_base_alpha".to_string(),
                message: format!(
                    "Java base skin zones must be fully opaque. Found {} non-opaque base pixel(s) ({} transparent, {} semi-transparent).",
                    base_non_opaque_pixels,
                    base_transparent_pixels,
                    base_semi_transparent_pixels
                ),
            });
        }
    }

    if format == "obj" {
        issues.push(ExportPreflightIssue {
            level: "info".to_string(),
            code: "obj_bake".to_string(),
            message: "OBJ export bakes the visible result to one texture and material.".to_string(),
        });
    }

    let warning_count = issues.iter().filter(|issue| issue.level == "warning").count();
    let error_count = issues.iter().filter(|issue| issue.level == "error").count();
    Ok(ExportPreflightReport {
        ok: error_count == 0,
        warning_count,
        error_count,
        issues,
        stats: ExportPreflightStats {
            arm_type,
            format,
            total_pixels: pixels.len() / 4,
            opaque_pixels,
            transparent_pixels,
            semi_transparent_pixels,
            visible_pixels,
            unique_color_count: unique_colors.len(),
        },
    })
}

#[tauri::command]
fn rename_internal_project(app: AppHandle, input: RenameProjectInput) -> Result<ProjectSummary, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;

    let id = input.id.trim();
    if id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let path = project_path(&projects_dir, id);
    if !path.exists() {
        return Err(format!("Project not found: {}", id));
    }

    let mut bundle = read_project_bundle(&path)?;
    bundle.project.name = normalize_project_name(input.name.as_str());
    write_project_bundle(&path, &bundle)?;

    let autosave_path = autosave_path(&autosave_dir, id);
    if autosave_path.exists() {
        let mut autosave_bundle = read_project_bundle(&autosave_path)?;
        autosave_bundle.project.name = bundle.project.name.clone();
        write_project_bundle(&autosave_path, &autosave_bundle)?;
    }

    summary_from_path(&path)
}

#[tauri::command]
fn delete_internal_project(app: AppHandle, id: String) -> Result<(), String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;

    let trimmed_id = id.trim();
    if trimmed_id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let project_file = project_path(&projects_dir, trimmed_id);
    if project_file.exists() {
        fs::remove_file(&project_file).map_err(|err| err.to_string())?;
    }

    let autosave_file = autosave_path(&autosave_dir, trimmed_id);
    if autosave_file.exists() {
        fs::remove_file(&autosave_file).map_err(|err| err.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn move_internal_project_to_bin(app: AppHandle, id: String) -> Result<ProjectSummary, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;

    let trimmed_id = id.trim();
    if trimmed_id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let project_file = project_path(&projects_dir, trimmed_id);
    if !project_file.exists() {
        return Err(format!("Project not found: {}", trimmed_id));
    }

    let destination = project_path(&bin_dir, trimmed_id);
    if destination.exists() {
        fs::remove_file(&destination).map_err(|err| err.to_string())?;
    }
    fs::rename(&project_file, &destination).map_err(|err| err.to_string())?;

    let autosave_file = autosave_path(&autosave_dir, trimmed_id);
    if autosave_file.exists() {
        fs::remove_file(&autosave_file).map_err(|err| err.to_string())?;
    }

    summary_from_path(&destination)
}

#[tauri::command]
fn restore_internal_project_from_bin(app: AppHandle, id: String) -> Result<ProjectSummary, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;

    let trimmed_id = id.trim();
    if trimmed_id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let source = project_path(&bin_dir, trimmed_id);
    if !source.exists() {
        return Err(format!("Binned project not found: {}", trimmed_id));
    }

    let destination = project_path(&projects_dir, trimmed_id);
    if destination.exists() {
        return Err("A project with that id already exists in the library".to_string());
    }

    fs::rename(&source, &destination).map_err(|err| err.to_string())?;
    summary_from_path(&destination)
}

#[tauri::command]
fn permanently_delete_internal_bin_project(app: AppHandle, id: String) -> Result<(), String> {
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;

    let trimmed_id = id.trim();
    if trimmed_id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let bin_dir_canonical = fs::canonicalize(&bin_dir).unwrap_or_else(|_| bin_dir.clone());
    let provided_path = PathBuf::from(trimmed_id);
    if provided_path.is_absolute() {
        if let Ok(canonical_candidate) = fs::canonicalize(&provided_path) {
            let in_bin = canonical_candidate
                .parent()
                .map(|parent| parent == bin_dir_canonical.as_path())
                .unwrap_or(false);
            if in_bin && is_qse_file(&canonical_candidate) {
                fs::remove_file(canonical_candidate).map_err(|err| err.to_string())?;
                return Ok(());
            }
        }
    }

    let normalized_id = normalize_project_lookup_id(trimmed_id);
    let mut bin_file = project_path(&bin_dir, normalized_id.as_str());

    if !bin_file.exists() {
        let entries = fs::read_dir(&bin_dir).map_err(|err| err.to_string())?;
        let mut found_match: Option<PathBuf> = None;
        for entry in entries {
            let entry = entry.map_err(|err| err.to_string())?;
            let path = entry.path();
            if !is_qse_file(&path) {
                continue;
            }
            let Some(stem) = path.file_stem().and_then(|stem| stem.to_str()) else {
                continue;
            };
            if stem.eq_ignore_ascii_case(normalized_id.as_str()) {
                found_match = Some(path);
                break;
            }
        }

        if let Some(found_path) = found_match {
            bin_file = found_path;
        }
    }

    if !bin_file.exists() {
        return Err(format!("Binned project not found: {}", normalized_id));
    }

    fs::remove_file(bin_file).map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_internal_project(app: AppHandle, input: SaveProjectInput) -> Result<ProjectSummary, String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;

    let id = input.id.trim();
    if id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let path = project_path(&projects_dir, id);
    let safe_name = normalize_project_name(input.name.as_str());

    let project = migrate_project_document(ProjectDocument {
        format: QSE_FORMAT.to_string(),
        version: QSE_VERSION,
        name: safe_name,
        arm_type: normalize_arm_type(Some(input.arm_type.as_str())),
        layers: input.layers,
        parts: input.parts,
    });

    let paint_pixels = normalize_texture_pixels(input.paint_pixels)?;
    let layer_bitmaps =
        resolve_layer_bitmaps_for_save(&project, input.layer_bitmaps, paint_pixels)?;
    write_project_bundle(
        &path,
        &ProjectBundle {
            project,
            layer_bitmaps,
            preview_png: normalize_preview_png_bytes(input.preview_png)?,
        },
    )?;

    let autosave_path = autosave_path(&autosave_dir, id);
    if autosave_path.exists() {
        fs::remove_file(&autosave_path).map_err(|err| err.to_string())?;
    }

    summary_from_path(&path)
}

#[tauri::command]
fn save_internal_autosave(app: AppHandle, input: SaveProjectInput) -> Result<AutosaveSummary, String> {
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;

    let id = input.id.trim();
    if id.is_empty() {
        return Err("Missing project id".to_string());
    }

    let safe_name = normalize_project_name(input.name.as_str());

    let project = migrate_project_document(ProjectDocument {
        format: QSE_FORMAT.to_string(),
        version: QSE_VERSION,
        name: safe_name,
        arm_type: normalize_arm_type(Some(input.arm_type.as_str())),
        layers: input.layers,
        parts: input.parts,
    });

    let paint_pixels = normalize_texture_pixels(input.paint_pixels)?;
    let layer_bitmaps =
        resolve_layer_bitmaps_for_save(&project, input.layer_bitmaps, paint_pixels)?;
    let path = autosave_path(&autosave_dir, id);
    write_project_bundle(
        &path,
        &ProjectBundle {
            project,
            layer_bitmaps,
            preview_png: None,
        },
    )?;

    Ok(AutosaveSummary {
        id: id.to_string(),
        updated_at: file_modified_ms(&path)?,
    })
}

#[tauri::command]
fn load_internal_autosave(app: AppHandle, id: String) -> Result<Option<LoadedAutosave>, String> {
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;
    let path = autosave_path(&autosave_dir, id.trim());
    if !path.exists() {
        return Ok(None);
    }

    let bundle = read_project_bundle(&path)?;
    let updated_at = file_modified_ms(&path)?;
    let paint_pixels = primary_paint_pixels(&bundle.project, &bundle.layer_bitmaps);

    Ok(Some(LoadedAutosave {
        updated_at,
        project: bundle.project,
        paint_pixels,
        layer_bitmaps: bundle.layer_bitmaps,
    }))
}

#[tauri::command]
fn clear_internal_autosave(app: AppHandle, id: String) -> Result<(), String> {
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;
    let path = autosave_path(&autosave_dir, id.trim());
    if path.exists() {
        fs::remove_file(path).map_err(|err| err.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn clear_internal_projects(app: AppHandle) -> Result<(), String> {
    let projects_dir = ensure_dir(app_data_dir(&app)?.join("projects"))?;
    let autosave_dir = ensure_dir(app_data_dir(&app)?.join("autosave"))?;
    let bin_dir = ensure_dir(app_data_dir(&app)?.join("bin"))?;

    let entries = fs::read_dir(&projects_dir).map_err(|err| err.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if is_qse_file(&path) {
            fs::remove_file(path).map_err(|err| err.to_string())?;
        }
    }

    let autosave_entries = fs::read_dir(&autosave_dir).map_err(|err| err.to_string())?;
    for entry in autosave_entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if is_qse_file(&path) {
            fs::remove_file(path).map_err(|err| err.to_string())?;
        }
    }

    let bin_entries = fs::read_dir(&bin_dir).map_err(|err| err.to_string())?;
    for entry in bin_entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if is_qse_file(&path) {
            fs::remove_file(path).map_err(|err| err.to_string())?;
        }
    }

    Ok(())
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    ensure_dir(dir)
}

fn ensure_dir(path: PathBuf) -> Result<PathBuf, String> {
    fs::create_dir_all(&path).map_err(|err| err.to_string())?;
    Ok(path)
}

fn normalize_arm_type(arm_type: Option<&str>) -> String {
    match arm_type {
        Some(value) if value.eq_ignore_ascii_case("slim") => "slim".to_string(),
        _ => "classic".to_string(),
    }
}

fn normalize_project_name(raw_name: &str) -> String {
    let trimmed = raw_name.trim();
    if trimmed.is_empty() {
        "Untitled Project".to_string()
    } else {
        trimmed.to_string()
    }
}

fn normalize_project_lookup_id(raw_id: &str) -> String {
    let trimmed = raw_id.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    let normalized = trimmed.replace('\\', "/");
    let file_like = Path::new(&normalized)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or(trimmed);

    Path::new(file_like)
        .file_stem()
        .and_then(|value| value.to_str())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| file_like.trim().to_string())
}

fn ensure_extension(path: &Path, extension: &str) -> PathBuf {
    let ext = extension.trim_start_matches('.').to_ascii_lowercase();
    let current = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();
    if current == ext {
        return path.to_path_buf();
    }
    path.with_extension(ext)
}

fn export_obj_bundle(obj_path: &Path, arm_type: &str, pixels: &[u8]) -> Result<(), String> {
    let obj_path = ensure_extension(obj_path, "obj");
    let mtl_path = obj_path.with_extension("mtl");
    let texture_path = obj_path.with_extension("png");

    let texture_file_name = texture_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Invalid export texture file name".to_string())?;
    let mtl_file_name = mtl_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Invalid export material file name".to_string())?;

    let template = if arm_type.eq_ignore_ascii_case("slim") {
        OBJ_TEMPLATE_SLIM
    } else {
        OBJ_TEMPLATE_WIDE
    };
    let obj_text = rewrite_obj_template(template, mtl_file_name);
    let mtl_text = format!(
        "# QueenSkin Editor export\nnewmtl skin\nKd 1.000 1.000 1.000\nKa 0.000 0.000 0.000\nKs 0.000 0.000 0.000\nmap_Kd {}\n",
        texture_file_name
    );

    if let Some(parent) = obj_path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }

    let png_bytes = texture_pixels_to_png_bytes(pixels)?;
    fs::write(&obj_path, obj_text).map_err(|err| err.to_string())?;
    fs::write(&mtl_path, mtl_text).map_err(|err| err.to_string())?;
    fs::write(&texture_path, png_bytes).map_err(|err| err.to_string())?;
    Ok(())
}

fn rewrite_obj_template(template: &str, mtl_file_name: &str) -> String {
    let mut output = String::with_capacity(template.len() + 128);
    for raw_line in template.lines() {
        let line = raw_line.trim_start();
        if line.starts_with("mtllib ") {
            output.push_str("mtllib ");
            output.push_str(mtl_file_name);
            output.push('\n');
            continue;
        }
        if line.starts_with("usemtl ") {
            output.push_str("usemtl skin\n");
            continue;
        }
        output.push_str(raw_line);
        output.push('\n');
    }
    output
}

fn normalize_layer_kind(kind: &str) -> String {
    if kind.eq_ignore_ascii_case("guide") {
        "guide".to_string()
    } else {
        "paint".to_string()
    }
}

fn normalize_blend_mode(mode: &str) -> String {
    if mode.eq_ignore_ascii_case("multiply") {
        "multiply".to_string()
    } else {
        "normal".to_string()
    }
}

fn default_true() -> bool {
    true
}

fn default_opacity() -> f32 {
    1.0
}

fn default_blend_mode() -> String {
    "normal".to_string()
}

fn default_layer_kind() -> String {
    "paint".to_string()
}

fn default_project_version() -> u32 {
    QSE_VERSION
}

fn default_guide_layer() -> LayerMeta {
    LayerMeta {
        id: "layer-guide".to_string(),
        name: "Layer 1 · Guide".to_string(),
        visible: true,
        locked: true,
        opacity: 1.0,
        blend_mode: "normal".to_string(),
        file: String::new(),
        kind: "guide".to_string(),
    }
}

fn default_paint_layer() -> LayerMeta {
    LayerMeta {
        id: "layer-paint".to_string(),
        name: "Layer 2 · Paint".to_string(),
        visible: true,
        locked: false,
        opacity: 1.0,
        blend_mode: "normal".to_string(),
        file: DEFAULT_PAINT_LAYER_FILE.to_string(),
        kind: "paint".to_string(),
    }
}

fn default_project_layers() -> Vec<LayerMeta> {
    vec![default_guide_layer(), default_paint_layer()]
}

fn default_part_state(part: &str) -> PartState {
    PartState {
        part: part.to_string(),
        base_lock: false,
        outer_lock: false,
        base_visibility: true,
        outer_visibility: true,
    }
}

fn default_parts() -> Vec<PartState> {
    PART_NAMES
        .iter()
        .map(|part| default_part_state(part))
        .collect()
}

fn is_qse_file(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|ext| ext.to_str()),
        Some(ext) if ext.eq_ignore_ascii_case(QSE_EXTENSION)
    )
}

fn is_png_file(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|ext| ext.to_str()),
        Some(ext) if ext.eq_ignore_ascii_case("png")
    )
}

fn import_png_as_project(source_path: &Path, projects_dir: &Path) -> Result<ProjectSummary, String> {
    let png_bytes = fs::read(source_path).map_err(|err| err.to_string())?;
    let image = image::load_from_memory(&png_bytes).map_err(|err| err.to_string())?;
    let width = image.width();
    let height = image.height();
    if width != TEXTURE_SIZE as u32 || height != TEXTURE_SIZE as u32 {
        return Err(format!(
            "Skin PNG must be 64x64. Received {}x{}",
            width, height
        ));
    }
    let arm_type = detect_arm_type_from_skin(&image);
    let paint_pixels = decode_png_to_texture_pixels(&png_bytes)?;

    let name = source_path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .map(normalize_project_name)
        .unwrap_or_else(|| "Imported Skin".to_string());

    let project = ProjectDocument::new_blank(name, arm_type);
    let layer_bitmaps = build_layer_bitmaps_from_paint_pixels(&project, paint_pixels);
    let bundle = ProjectBundle {
        project,
        layer_bitmaps,
        preview_png: None,
    };
    let id = Uuid::new_v4().to_string();
    let destination = project_path(projects_dir, &id);
    write_project_bundle(&destination, &bundle)?;
    summary_from_path(&destination)
}

fn detect_arm_type_from_skin(image: &DynamicImage) -> String {
    let rgba = image.to_rgba8();
    let (width, height) = rgba.dimensions();
    if width != 64 || height != 64 {
        return "classic".to_string();
    }

    // Slim model reserves specific arm columns that are expected to stay transparent.
    // We check multiple markers across base + outer arm regions for robustness.
    let slim_markers: &[(u32, u32)] = &[
        (46, 16),
        (50, 16),
        (54, 20),
        (54, 31),
        (38, 48),
        (42, 48),
        (46, 52),
        (46, 63),
        (46, 36),
        (54, 36),
    ];

    let transparent_markers = slim_markers
        .iter()
        .filter(|(x, y)| rgba.get_pixel(*x, *y).0[3] == 0)
        .count();

    if transparent_markers >= 4 {
        "slim".to_string()
    } else {
        "classic".to_string()
    }
}

fn build_java_base_opacity_mask(arm_type: &str) -> Vec<bool> {
    let template = if normalize_arm_type(Some(arm_type)) == "slim" {
        OBJ_TEMPLATE_SLIM
    } else {
        OBJ_TEMPLATE_WIDE
    };
    build_base_uv_mask_from_obj(template)
}

fn build_base_uv_mask_from_obj(obj_source: &str) -> Vec<bool> {
    let mut mask = vec![false; TEXTURE_PIXEL_COUNT];
    let mut uv_coords: Vec<(f32, f32)> = Vec::new();
    let mut current_object_name = String::new();

    for raw_line in obj_source.lines() {
        let line = raw_line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Some(rest) = line.strip_prefix("o ") {
            current_object_name = rest.trim().to_string();
            continue;
        }

        if let Some(rest) = line.strip_prefix("vt ") {
            let mut parts = rest.split_whitespace();
            let u = parts.next().and_then(|value| value.parse::<f32>().ok()).unwrap_or(0.0);
            let v = parts.next().and_then(|value| value.parse::<f32>().ok()).unwrap_or(0.0);
            uv_coords.push((u, v));
            continue;
        }

        if !is_base_mesh_object_name(&current_object_name) {
            continue;
        }

        let Some(rest) = line.strip_prefix("f ") else {
            continue;
        };

        let mut u_min = f32::INFINITY;
        let mut u_max = f32::NEG_INFINITY;
        let mut v_min = f32::INFINITY;
        let mut v_max = f32::NEG_INFINITY;
        let mut uv_vertex_count = 0usize;

        for token in rest.split_whitespace() {
            let mut fields = token.split('/');
            let _vertex = fields.next();
            let vt_field = fields.next().unwrap_or("");
            let Ok(vt_index_raw) = vt_field.parse::<isize>() else {
                continue;
            };
            if vt_index_raw <= 0 {
                continue;
            }
            let vt_index = (vt_index_raw - 1) as usize;
            let Some((u, v)) = uv_coords.get(vt_index).copied() else {
                continue;
            };

            u_min = u_min.min(u);
            u_max = u_max.max(u);
            v_min = v_min.min(v);
            v_max = v_max.max(v);
            uv_vertex_count += 1;
        }

        if uv_vertex_count < 3 || !u_min.is_finite() || !u_max.is_finite() || !v_min.is_finite() || !v_max.is_finite() {
            continue;
        }

        mark_uv_rect_as_base_zone(&mut mask, u_min, u_max, v_min, v_max);
    }

    mask
}

fn is_base_mesh_object_name(name: &str) -> bool {
    !name.to_ascii_lowercase().contains("layer")
}

fn mark_uv_rect_as_base_zone(mask: &mut [bool], u_min: f32, u_max: f32, v_min: f32, v_max: f32) {
    const EPSILON: f32 = 1e-6;
    let texture_size = TEXTURE_SIZE as f32;

    let mut x_start = ((u_min * texture_size) + EPSILON).floor() as isize;
    let mut x_end = ((u_max * texture_size) - EPSILON).ceil() as isize - 1;
    let mut y_start = (((1.0 - v_max) * texture_size) + EPSILON).floor() as isize;
    let mut y_end = (((1.0 - v_min) * texture_size) - EPSILON).ceil() as isize - 1;

    x_start = x_start.clamp(0, (TEXTURE_SIZE - 1) as isize);
    x_end = x_end.clamp(0, (TEXTURE_SIZE - 1) as isize);
    y_start = y_start.clamp(0, (TEXTURE_SIZE - 1) as isize);
    y_end = y_end.clamp(0, (TEXTURE_SIZE - 1) as isize);

    if x_start > x_end || y_start > y_end {
        return;
    }

    for y in y_start..=y_end {
        for x in x_start..=x_end {
            let index = y as usize * TEXTURE_SIZE + x as usize;
            if index < mask.len() {
                mask[index] = true;
            }
        }
    }
}

fn project_path(projects_dir: &Path, id: &str) -> PathBuf {
    projects_dir.join(format!("{id}.{QSE_EXTENSION}"))
}

fn autosave_path(autosave_dir: &Path, id: &str) -> PathBuf {
    autosave_dir.join(format!("{id}.{QSE_EXTENSION}"))
}

fn summary_from_path(path: &Path) -> Result<ProjectSummary, String> {
    let id = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .ok_or_else(|| "Invalid project filename".to_string())?
        .to_string();

    let bundle = read_project_bundle(path)?;
    let updated_at = file_modified_ms(path)?;

    Ok(ProjectSummary {
        id,
        name: bundle.project.name,
        arm_type: bundle.project.arm_type,
        updated_at,
        layer_count: bundle.project.layers.len(),
        path: path.to_string_lossy().to_string(),
    })
}

fn file_modified_ms(path: &Path) -> Result<u64, String> {
    let metadata = fs::metadata(path).map_err(|err| err.to_string())?;
    Ok(metadata
        .modified()
        .unwrap_or_else(|_| SystemTime::now())
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64)
}

fn read_project_bundle(path: &Path) -> Result<ProjectBundle, String> {
    let file = File::open(path).map_err(|err| err.to_string())?;
    let mut zip = ZipArchive::new(file).map_err(|err| err.to_string())?;

    let project = match read_zip_file_string(&mut zip, "project.json") {
        Ok(payload) => {
            let parsed: ProjectDocument = serde_json::from_str(&payload).map_err(|err| err.to_string())?;
            if parsed.format != QSE_FORMAT {
                return Err(format!("Unsupported project format '{}'", parsed.format));
            }
            migrate_project_document(parsed)
        }
        Err(_) => recover_project_without_json(path),
    };

    let layer_bitmaps = read_layer_bitmaps_from_zip(&project, &mut zip)?;
    let preview_png = read_zip_file_bytes(&mut zip, PREVIEW_PNG_FILE).ok();

    Ok(ProjectBundle {
        project,
        layer_bitmaps,
        preview_png,
    })
}

fn recover_project_without_json(path: &Path) -> ProjectDocument {
    let name = path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("Recovered Project")
        .to_string();

    ProjectDocument::new_blank(name, "classic".to_string())
}

fn read_zip_file_string<R: Read + Seek>(zip: &mut ZipArchive<R>, file_name: &str) -> Result<String, String> {
    let mut file = zip.by_name(file_name).map_err(|err| err.to_string())?;
    let mut payload = String::new();
    file.read_to_string(&mut payload)
        .map_err(|err| err.to_string())?;
    Ok(payload)
}

fn read_zip_file_bytes<R: Read + Seek>(zip: &mut ZipArchive<R>, file_name: &str) -> Result<Vec<u8>, String> {
    let mut file = zip.by_name(file_name).map_err(|err| err.to_string())?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).map_err(|err| err.to_string())?;
    Ok(bytes)
}

fn read_first_layer_png_bytes<R: Read + Seek>(zip: &mut ZipArchive<R>) -> Result<Option<Vec<u8>>, String> {
    for i in 0..zip.len() {
        let mut file = zip.by_index(i).map_err(|err| err.to_string())?;
        let name = file.name().to_lowercase();
        if !name.starts_with("layers/") || !name.ends_with(".png") {
            continue;
        }

        let mut bytes = Vec::new();
        file.read_to_end(&mut bytes).map_err(|err| err.to_string())?;
        return Ok(Some(bytes));
    }

    Ok(None)
}

fn migrate_project_document(mut project: ProjectDocument) -> ProjectDocument {
    project.format = QSE_FORMAT.to_string();
    project.version = QSE_VERSION;
    project.arm_type = normalize_arm_type(Some(project.arm_type.as_str()));

    if project.layers.is_empty() {
        project.layers = default_project_layers();
    }

    for layer in &mut project.layers {
        layer.opacity = layer.opacity.clamp(0.0, 1.0);
        if !layer.opacity.is_finite() {
            layer.opacity = 1.0;
        }

        if layer.id.trim().is_empty() {
            layer.id = format!("layer-{}", Uuid::new_v4());
        }

        if layer.name.trim().is_empty() {
            layer.name = if normalize_layer_kind(&layer.kind) == "guide" {
                "Guide".to_string()
            } else {
                "Paint".to_string()
            };
        }

        layer.kind = normalize_layer_kind(&layer.kind);
        if layer.kind == "guide" {
            layer.file.clear();
        }

        layer.blend_mode = normalize_blend_mode(&layer.blend_mode);
    }

    if !project.layers.iter().any(|layer| layer.kind == "guide") {
        project.layers.insert(0, default_guide_layer());
    }

    if !project.layers.iter().any(|layer| layer.kind == "paint") {
        project.layers.push(default_paint_layer());
    }
    normalize_paint_layer_files(&mut project.layers);

    let mut normalized_parts = Vec::with_capacity(PART_NAMES.len());
    for part_name in PART_NAMES {
        let maybe_part = project
            .parts
            .iter()
            .find(|part| part.part.eq_ignore_ascii_case(part_name));

        if let Some(part) = maybe_part {
            normalized_parts.push(PartState {
                part: part_name.to_string(),
                base_lock: part.base_lock,
                outer_lock: part.outer_lock,
                base_visibility: part.base_visibility,
                outer_visibility: part.outer_visibility,
            });
        } else {
            normalized_parts.push(default_part_state(part_name));
        }
    }
    project.parts = normalized_parts;

    project
}

fn normalize_texture_pixels(pixels: Vec<u8>) -> Result<Vec<u8>, String> {
    if pixels.len() != TEXTURE_BYTE_LEN {
        return Err(format!(
            "Invalid paint pixel payload length {} (expected {})",
            pixels.len(),
            TEXTURE_BYTE_LEN
        ));
    }
    Ok(pixels)
}

fn blank_texture_pixels() -> Vec<u8> {
    vec![0; TEXTURE_BYTE_LEN]
}

fn default_paint_layer_file_for_index(index: usize) -> String {
    if index == 0 {
        DEFAULT_PAINT_LAYER_FILE.to_string()
    } else {
        format!("layers/paint-{}.png", index + 1)
    }
}

fn sanitize_layer_file_path(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    let normalized = trimmed.replace('\\', "/");
    let file_name = Path::new(&normalized)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("")
        .trim();
    if file_name.is_empty() {
        return String::new();
    }

    let mut output = file_name.to_string();
    if !output.to_ascii_lowercase().ends_with(".png") {
        output.push_str(".png");
    }
    format!("layers/{output}")
}

fn normalize_paint_layer_files(layers: &mut [LayerMeta]) {
    let mut used = HashSet::new();
    let mut paint_index = 0usize;

    for layer in layers.iter_mut() {
        if layer.kind != "paint" {
            continue;
        }

        let mut candidate = sanitize_layer_file_path(&layer.file);
        if candidate.is_empty() || used.contains(&candidate) {
            let mut fallback_index = paint_index;
            loop {
                let fallback = default_paint_layer_file_for_index(fallback_index);
                if !used.contains(&fallback) {
                    candidate = fallback;
                    break;
                }
                fallback_index += 1;
            }
        }

        layer.file = candidate.clone();
        used.insert(candidate);
        paint_index += 1;
    }
}

fn build_layer_bitmaps_from_paint_pixels(
    project: &ProjectDocument,
    primary_pixels: Vec<u8>,
) -> Vec<LayerBitmapPayload> {
    let mut next_primary = Some(primary_pixels);
    let mut output = Vec::new();

    for (paint_index, layer) in project
        .layers
        .iter()
        .filter(|layer| layer.kind == "paint")
        .enumerate()
    {
        let file = if layer.file.trim().is_empty() {
            default_paint_layer_file_for_index(paint_index)
        } else {
            layer.file.clone()
        };

        output.push(LayerBitmapPayload {
            layer_id: layer.id.clone(),
            file,
            pixels: next_primary.take().unwrap_or_else(blank_texture_pixels),
        });
    }

    output
}

fn primary_paint_pixels(project: &ProjectDocument, bitmaps: &[LayerBitmapPayload]) -> Vec<u8> {
    let mut by_id = HashMap::new();
    for bitmap in bitmaps {
        by_id.insert(bitmap.layer_id.clone(), bitmap.pixels.clone());
    }

    if let Some(layer) = project.layers.iter().find(|layer| layer.kind == "paint") {
        return by_id
            .remove(&layer.id)
            .unwrap_or_else(blank_texture_pixels);
    }

    blank_texture_pixels()
}

fn resolve_layer_bitmaps_for_save(
    project: &ProjectDocument,
    input_bitmaps: Vec<LayerBitmapPayload>,
    fallback_pixels: Vec<u8>,
) -> Result<Vec<LayerBitmapPayload>, String> {
    let mut by_id: HashMap<String, Vec<u8>> = HashMap::new();
    let mut by_file: HashMap<String, Vec<u8>> = HashMap::new();

    for bitmap in input_bitmaps {
        let layer_id = bitmap.layer_id.trim().to_string();
        if layer_id.is_empty() {
            continue;
        }

        let file = sanitize_layer_file_path(&bitmap.file);
        let pixels = normalize_texture_pixels(bitmap.pixels)?;
        if !file.is_empty() {
            by_file.insert(file, pixels.clone());
        }
        by_id.insert(layer_id, pixels);
    }

    let mut fallback_once = Some(fallback_pixels);
    let mut output = Vec::new();
    for (paint_index, layer) in project
        .layers
        .iter()
        .filter(|layer| layer.kind == "paint")
        .enumerate()
    {
        let file = if layer.file.trim().is_empty() {
            default_paint_layer_file_for_index(paint_index)
        } else {
            layer.file.clone()
        };

        let pixels = by_id
            .remove(&layer.id)
            .or_else(|| by_file.remove(&file))
            .or_else(|| fallback_once.take())
            .unwrap_or_else(blank_texture_pixels);

        output.push(LayerBitmapPayload {
            layer_id: layer.id.clone(),
            file,
            pixels,
        });
    }

    Ok(output)
}

fn read_layer_bitmaps_from_zip<R: Read + Seek>(
    project: &ProjectDocument,
    zip: &mut ZipArchive<R>,
) -> Result<Vec<LayerBitmapPayload>, String> {
    let mut fallback_pixels = match read_first_layer_png_bytes(zip)? {
        Some(bytes) => Some(decode_png_to_texture_pixels(&bytes)?),
        None => None,
    };

    let mut output = Vec::new();
    for (paint_index, layer) in project
        .layers
        .iter()
        .filter(|layer| layer.kind == "paint")
        .enumerate()
    {
        let file = if layer.file.trim().is_empty() {
            default_paint_layer_file_for_index(paint_index)
        } else {
            layer.file.clone()
        };

        let pixels = match read_zip_file_bytes(zip, &file) {
            Ok(bytes) => decode_png_to_texture_pixels(&bytes)?,
            Err(_) => fallback_pixels.take().unwrap_or_else(blank_texture_pixels),
        };

        output.push(LayerBitmapPayload {
            layer_id: layer.id.clone(),
            file,
            pixels,
        });
    }

    if output.is_empty() {
        output.push(LayerBitmapPayload {
            layer_id: "layer-paint".to_string(),
            file: DEFAULT_PAINT_LAYER_FILE.to_string(),
            pixels: fallback_pixels.unwrap_or_else(blank_texture_pixels),
        });
    }

    Ok(output)
}

fn decode_png_to_texture_pixels(png_bytes: &[u8]) -> Result<Vec<u8>, String> {
    let decoded = image::load_from_memory(png_bytes).map_err(|err| err.to_string())?;
    let rgba = decoded.to_rgba8();
    let (width, height) = rgba.dimensions();

    if width as usize == TEXTURE_SIZE && height as usize == TEXTURE_SIZE {
        return Ok(rgba.into_raw());
    }

    let mut output = blank_texture_pixels();
    let source = rgba.into_raw();
    let copy_width = usize::min(width as usize, TEXTURE_SIZE);
    let copy_height = usize::min(height as usize, TEXTURE_SIZE);

    for y in 0..copy_height {
        let src_row_start = y * width as usize * 4;
        let dst_row_start = y * TEXTURE_SIZE * 4;
        let src_slice = &source[src_row_start..src_row_start + copy_width * 4];
        let dst_slice = &mut output[dst_row_start..dst_row_start + copy_width * 4];
        dst_slice.copy_from_slice(src_slice);
    }

    Ok(output)
}

fn texture_pixels_to_png_bytes(pixels: &[u8]) -> Result<Vec<u8>, String> {
    if pixels.len() != TEXTURE_BYTE_LEN {
        return Err(format!(
            "Invalid paint pixel payload length {} (expected {})",
            pixels.len(),
            TEXTURE_BYTE_LEN
        ));
    }

    let image = RgbaImage::from_raw(TEXTURE_SIZE as u32, TEXTURE_SIZE as u32, pixels.to_vec())
        .ok_or_else(|| "Could not encode paint layer".to_string())?;

    let mut cursor = Cursor::new(Vec::new());
    DynamicImage::ImageRgba8(image)
        .write_to(&mut cursor, ImageFormat::Png)
        .map_err(|err| err.to_string())?;
    Ok(cursor.into_inner())
}

fn normalize_preview_png_bytes(raw_preview_png: Vec<u8>) -> Result<Option<Vec<u8>>, String> {
    if raw_preview_png.is_empty() {
        return Ok(None);
    }

    let decoded = image::load_from_memory(&raw_preview_png)
        .map_err(|err| format!("Invalid preview PNG payload: {}", err))?;
    let mut cursor = Cursor::new(Vec::new());
    decoded
        .write_to(&mut cursor, ImageFormat::Png)
        .map_err(|err| format!("Could not encode preview PNG: {}", err))?;
    Ok(Some(cursor.into_inner()))
}

fn write_project_bundle(path: &Path, bundle: &ProjectBundle) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "Invalid project path".to_string())?;
    fs::create_dir_all(parent).map_err(|err| err.to_string())?;

    let temp_path = path.with_extension(format!("{QSE_EXTENSION}.tmp"));
    let file = File::create(&temp_path).map_err(|err| err.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);

    let project_json =
        serde_json::to_string_pretty(&bundle.project).map_err(|err| err.to_string())?;
    zip.start_file("project.json", options)
        .map_err(|err| err.to_string())?;
    zip.write_all(project_json.as_bytes())
        .map_err(|err| err.to_string())?;

    let mut by_id: HashMap<String, Vec<u8>> = HashMap::new();
    let mut by_file: HashMap<String, Vec<u8>> = HashMap::new();
    for bitmap in &bundle.layer_bitmaps {
        let layer_id = bitmap.layer_id.trim().to_string();
        if layer_id.is_empty() {
            continue;
        }

        let normalized_file = sanitize_layer_file_path(&bitmap.file);
        let pixels = normalize_texture_pixels(bitmap.pixels.clone())?;
        if !normalized_file.is_empty() {
            by_file.insert(normalized_file, pixels.clone());
        }
        by_id.insert(layer_id, pixels);
    }

    for (paint_index, layer) in bundle
        .project
        .layers
        .iter()
        .filter(|layer| layer.kind == "paint")
        .enumerate()
    {
        let file = if layer.file.trim().is_empty() {
            default_paint_layer_file_for_index(paint_index)
        } else {
            layer.file.clone()
        };

        let pixels = by_id
            .remove(&layer.id)
            .or_else(|| by_file.remove(&file))
            .unwrap_or_else(blank_texture_pixels);
        let paint_png = texture_pixels_to_png_bytes(&pixels)?;

        zip.start_file(&file, options)
            .map_err(|err| err.to_string())?;
        zip.write_all(&paint_png).map_err(|err| err.to_string())?;
    }

    if let Some(preview_png) = bundle.preview_png.as_ref() {
        if !preview_png.is_empty() {
            zip.start_file(PREVIEW_PNG_FILE, options)
                .map_err(|err| err.to_string())?;
            zip.write_all(preview_png).map_err(|err| err.to_string())?;
        }
    }

    zip.finish().map_err(|err| err.to_string())?;

    if path.exists() {
        fs::remove_file(path).map_err(|err| err.to_string())?;
    }
    fs::rename(&temp_path, path).map_err(|err| err.to_string())?;
    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_macos_dock_icon_png(app: AppHandle, png_bytes: Vec<u8>) -> Result<(), String> {
    use std::sync::mpsc;

    use objc2::{AllocAnyThread, MainThreadMarker};
    use objc2_app_kit::{NSApplication, NSImage};
    use objc2_foundation::NSData;

    if png_bytes.is_empty() {
        return Err("Icon bytes are empty".to_string());
    }

    let (tx, rx) = mpsc::channel::<Result<(), String>>();
    app.run_on_main_thread(move || {
        let result = (|| -> Result<(), String> {
            // SAFETY: This closure runs on the app main thread.
            let mtm = unsafe { MainThreadMarker::new_unchecked() };
            let ns_app = NSApplication::sharedApplication(mtm);
            let data = NSData::with_bytes(&png_bytes);
            let dock_icon = NSImage::initWithData(NSImage::alloc(), &data)
                .ok_or_else(|| "Invalid PNG for macOS dock icon".to_string())?;
            // SAFETY: Cocoa API expects main-thread access; guaranteed above.
            unsafe { ns_app.setApplicationIconImage(Some(&dock_icon)) };
            Ok(())
        })();
        let _ = tx.send(result);
    })
    .map_err(|err| err.to_string())?;

    rx.recv()
        .unwrap_or_else(|_| Err("Failed to apply macOS dock icon".to_string()))
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn set_macos_dock_icon_png(_app: AppHandle, _png_bytes: Vec<u8>) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
fn confirm_app_exit(app: AppHandle, exit_guard: State<'_, ExitGuardState>) -> Result<(), String> {
    exit_guard.allow_exit_once.store(true, Ordering::SeqCst);
    app.exit(0);
    Ok(())
}

#[cfg(target_os = "macos")]
fn configure_macos_process_name() {
    use objc2_foundation::{ns_string, NSProcessInfo};

    let process_info = NSProcessInfo::processInfo();
    process_info.setProcessName(ns_string!("QueenSkin Editor"));
}

#[cfg(not(target_os = "macos"))]
fn configure_macos_process_name() {}

fn main() {
    configure_macos_process_name();

    tauri::Builder::default()
        .manage(ExitGuardState::default())
        .invoke_handler(tauri::generate_handler![
            app_storage_paths,
            list_internal_projects,
            list_internal_bin_projects,
            create_internal_project,
            load_internal_project,
            load_internal_bin_project,
            pick_project_file,
            import_external_project,
            save_internal_project_as,
            export_project_preflight,
            export_project_asset,
            rename_internal_project,
            delete_internal_project,
            move_internal_project_to_bin,
            restore_internal_project_from_bin,
            permanently_delete_internal_bin_project,
            save_internal_project,
            save_internal_autosave,
            load_internal_autosave,
            clear_internal_autosave,
            clear_internal_projects,
            set_macos_dock_icon_png,
            confirm_app_exit
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                let exit_guard = app.state::<ExitGuardState>();
                if exit_guard.allow_exit_once.swap(false, Ordering::SeqCst) {
                    return;
                }

                let Some(main_window) = app.get_webview_window("main") else {
                    return;
                };

                api.prevent_exit();
                let _ = main_window.emit(APP_EXIT_REQUESTED_EVENT, ());
            }
        });
}
