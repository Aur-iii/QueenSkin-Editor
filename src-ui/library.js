import { applyThemedBrandIcon } from "./themed-icon.js";

const STORAGE_KEY = "queenskin.recentProjects";
const BIN_STORAGE_KEY = "queenskin.binProjects";
const THEME_STORAGE_KEY = "queenskin.theme.v1";
const CUSTOM_THEME_STORAGE_KEY = "queenskin.customThemes.v1";
const FALLBACK_PROJECT_KEY_PREFIX = "queenskin.project.";
const FALLBACK_AUTOSAVE_KEY_PREFIX = "queenskin.autosave.";
const KEYBIND_STORAGE_KEY = "queenskin.keybinds.v1";
const QSE_THEME_FORMAT = "qsetheme";
const QSE_THEME_VERSION = 1;

const toastEl = document.getElementById("toast");
const overlayEl = document.getElementById("overlay");
const overlayLabelEl = document.getElementById("overlayLabel");
const recentProjectsEl = document.getElementById("recentProjects");
const dropzoneEl = document.getElementById("libraryDropzone");
const projectModalEl = document.getElementById("projectModal");
const projectModalFormEl = document.getElementById("projectModalForm");
const projectModalTitleEl = document.getElementById("projectModalTitle");
const projectModalNameInputEl = document.getElementById("projectModalNameInput");
const projectModalArmTypeGroupEl = document.getElementById("projectModalArmTypeGroup");
const projectModalArmClassicEl = document.getElementById("projectModalArmClassic");
const projectModalArmSlimEl = document.getElementById("projectModalArmSlim");
const projectModalCancelBtnEl = document.getElementById("projectModalCancelBtn");
const projectModalConfirmBtnEl = document.getElementById("projectModalConfirmBtn");
const editorEntryModalEl = document.getElementById("editorEntryModal");
const editorEntryCancelBtnEl = document.getElementById("editorEntryCancelBtn");
const editorEntryOpenBtnEl = document.getElementById("editorEntryOpenBtn");
const editorEntryCreateBtnEl = document.getElementById("editorEntryCreateBtn");
const confirmModalEl = document.getElementById("confirmModal");
const confirmModalTitleEl = document.getElementById("confirmModalTitle");
const confirmModalMessageEl = document.getElementById("confirmModalMessage");
const confirmModalCancelBtnEl = document.getElementById("confirmModalCancelBtn");
const confirmModalConfirmBtnEl = document.getElementById("confirmModalConfirmBtn");
const clearRecentBtnEl = document.getElementById("clearRecentBtn");
const recentHeadingEl = document.getElementById("recentHeading");
const libraryTabBtnEl = document.getElementById("libraryTabBtn");
const binTabBtnEl = document.getElementById("binTabBtn");
const keybindModalEl = document.getElementById("keybindModal");
const keybindListEl = document.getElementById("keybindList");
const keybindSearchInputEl = document.getElementById("keybindSearchInput");
const keybindEmptyEl = document.getElementById("keybindEmpty");
const keybindModalWarningEl = document.getElementById("keybindModalWarning");
const keybindResetAllBtnEl = document.getElementById("keybindResetAllBtn");
const keybindCloseBtnEl = document.getElementById("keybindCloseBtn");
const openHelpBtnEl = document.getElementById("openHelpBtn");
const helpModalEl = document.getElementById("helpModal");
const helpCloseBtnEl = document.getElementById("helpCloseBtn");
const openThemeBrowserBtnEl = document.getElementById("openThemeBrowserBtn");
const themeBrowserModalEl = document.getElementById("themeBrowserModal");
const themeBrowserGridEl = document.getElementById("themeBrowserGrid");
const themeBrowserCloseBtnEl = document.getElementById("themeBrowserCloseBtn");
const themeUploadBtnEl = document.getElementById("themeUploadBtn");
const themeUploadInputEl = document.getElementById("themeUploadInput");

const tauriInvoke = window.__TAURI__?.core?.invoke;
const tauriWindowApi = window.__TAURI__?.window;
const tauriEventApi = window.__TAURI__?.event;
const hasTauriBackend = typeof tauriInvoke === "function";

const state = {
  recentProjects: [],
  binProjects: [],
  storagePaths: null,
  projectModalResolver: null,
  projectModalIncludeArmType: true,
  editorEntryModalResolver: null,
  confirmModalResolver: null,
  confirmModalDestructive: false,
  keybindCaptureActionId: "",
  keybindSearchQuery: "",
  keybinds: {},
  currentTheme: "midnight",
  customThemes: [],
  customThemeOverrides: {},
  activeShelf: "library",
  previewByProjectId: Object.create(null),
  previewLoadsInFlight: new Set(),
  nativeDropUnlisten: null,
  lastDropSignature: "",
  lastDropAt: 0
};

const KEYBIND_DEFINITIONS = [
  { id: "saveProject", label: "Save Project", defaultBinding: "CmdOrCtrl+KeyS" },
  { id: "saveProjectAs", label: "Save As (.qse)", defaultBinding: "" },
  { id: "exportPng", label: "Export PNG", defaultBinding: "" },
  { id: "exportObj", label: "Export OBJ", defaultBinding: "" },
  { id: "newProject", label: "New Project", defaultBinding: "" },
  { id: "openProject", label: "Open Project", defaultBinding: "" },
  { id: "closeProject", label: "Close Project", defaultBinding: "" },
  { id: "projectSettings", label: "Project Settings", defaultBinding: "" },
  { id: "openThemes", label: "Open Theme Browser", defaultBinding: "" },
  { id: "commandPalette", label: "Open Keybinds", defaultBinding: "CmdOrCtrl+KeyK" },
  { id: "undo", label: "Undo", defaultBinding: "CmdOrCtrl+KeyZ" },
  { id: "redo", label: "Redo", defaultBinding: "CmdOrCtrl+Shift+KeyZ" },
  { id: "mergeLayers", label: "Merge Selected Layers", defaultBinding: "CmdOrCtrl+KeyE" },
  { id: "newLayer", label: "New Layer", defaultBinding: "Shift+Equal" },
  { id: "deleteLayerOrSelection", label: "Delete Layer / Selection", defaultBinding: "Delete" },
  { id: "deselectSelection", label: "Deselect Selection", defaultBinding: "CmdOrCtrl+KeyD" },
  { id: "toggleCanvasGrid", label: "Toggle 2D Grid", defaultBinding: "" },
  { id: "toggleViewportGrid", label: "Toggle 3D Grid", defaultBinding: "" },
  { id: "toolPencil", label: "Tool: Pencil", defaultBinding: "KeyQ" },
  { id: "toolEraser", label: "Tool: Eraser", defaultBinding: "KeyE" },
  { id: "toolFill", label: "Tool: Fill", defaultBinding: "KeyF" },
  { id: "toolSelect", label: "Tool: Box Select", defaultBinding: "KeyM" },
  { id: "toolEyedropper", label: "Tool: Eyedropper", defaultBinding: "KeyI" },
  { id: "toolZoom", label: "Tool: Zoom", defaultBinding: "KeyW" },
  { id: "brushSizeDown", label: "Brush Size Down", defaultBinding: "KeyA" },
  { id: "brushSizeUp", label: "Brush Size Up", defaultBinding: "KeyD" },
  { id: "brushOpacityDown", label: "Brush Opacity Down", defaultBinding: "BracketLeft" },
  { id: "brushOpacityUp", label: "Brush Opacity Up", defaultBinding: "BracketRight" }
];
const KEYBIND_DEFAULTS = Object.fromEntries(
  KEYBIND_DEFINITIONS.map((definition) => [definition.id, definition.defaultBinding])
);
const VIEWPORT_CONTROL_HINTS = [
  { label: "3D Viewport Rotate", binding: "Space + Drag or Cmd/Ctrl + Drag" },
  { label: "3D Viewport Pan", binding: "Shift + Drag" },
  { label: "3D Viewport Zoom", binding: "Mouse Wheel" },
  { label: "2D Canvas Pan", binding: "Space + Drag" }
];
const THEME_PRESETS = [
  {
    id: "midnight",
    label: "Midnight",
    note: "Neutral dark workspace",
    preview: {
      bg: "#090816",
      surface: "#141326",
      panel: "#1f1b36",
      accent: "#2f2850",
      muted: "#d6ceff"
    }
  },
  {
    id: "day",
    label: "Day",
    note: "Light blue-green breeze",
    preview: {
      bg: "#eff8fc",
      surface: "#c9e3ec",
      panel: "#c1dee8",
      accent: "#8fc3da",
      muted: "#3d6e89"
    }
  },
  {
    id: "dawn",
    label: "Dawn",
    note: "Warm medium glow",
    preview: {
      bg: "#263048",
      surface: "#323d54",
      panel: "#36425e",
      accent: "#b9865d",
      muted: "#f4c987"
    }
  },
  {
    id: "pine-forest",
    label: "Pine Forest",
    note: "Earthy dark woodland",
    preview: {
      bg: "#12160f",
      surface: "#1a2319",
      panel: "#2b3726",
      accent: "#4e5f42",
      muted: "#c9bc8c"
    }
  },
  {
    id: "trans",
    label: "Trans Pride",
    note: "Pastel blue-pink glow",
    preview: {
      bg: "#ffffff",
      surface: "#edf6ff",
      panel: "#ffdff0",
      accent: "linear-gradient(90deg, #5bc5f5 0%, #9adfff 22%, #ffffff 50%, #f8b2d7 76%, #79d1f6 100%)",
      muted: "#305273"
    }
  }
];

void init();

async function init() {
  state.keybinds = loadStoredKeybinds();
  wireThemeBrowser();
  wireHelpModal();
  wireGlobalButtons();
  wireDropzone();
  wireProjectModal();
  wireEditorEntryModal();
  wireConfirmModal();
  wireAppExitGuard();
  wireKeybindModal();
  await refreshProjects();

  if (hasTauriBackend) {
    showToast("Connected to native project storage.");
  } else {
    showToast("Running UI-only mode (no native backend detected).", 2200);
  }
}

function wireHelpModal() {
  openHelpBtnEl?.addEventListener("click", () => {
    openHelpModal();
  });

  helpCloseBtnEl?.addEventListener("click", () => {
    closeHelpModal();
  });

  helpModalEl?.addEventListener("click", (event) => {
    if (event.target === helpModalEl) {
      closeHelpModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!helpModalEl || helpModalEl.hidden || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeHelpModal();
  });
}

function openHelpModal() {
  if (!helpModalEl) {
    return;
  }
  helpModalEl.hidden = false;
  window.setTimeout(() => {
    helpCloseBtnEl?.focus();
  }, 0);
}

function closeHelpModal() {
  if (!helpModalEl) {
    return;
  }
  helpModalEl.hidden = true;
}

function wireThemeBrowser() {
  state.customThemes = loadStoredCustomThemes();
  const initial = normalizeThemeChoice(localStorage.getItem(THEME_STORAGE_KEY));
  applyTheme(initial, { persist: false });
  renderThemeBrowserCards();

  openThemeBrowserBtnEl?.addEventListener("click", () => {
    openThemeBrowserModal();
  });

  themeBrowserCloseBtnEl?.addEventListener("click", () => {
    closeThemeBrowserModal();
  });

  themeUploadBtnEl?.addEventListener("click", () => {
    themeUploadInputEl?.click();
  });

  themeUploadInputEl?.addEventListener("change", () => {
    const selectedFile = themeUploadInputEl?.files?.[0];
    if (!selectedFile) {
      return;
    }
    if (!isThemeBundleUploadFile(selectedFile)) {
      showToast("Only .qsetheme or .json files can be uploaded.", 2200);
      if (themeUploadInputEl) {
        themeUploadInputEl.value = "";
      }
      return;
    }
    void importThemeBundleFile(selectedFile);
    if (themeUploadInputEl) {
      themeUploadInputEl.value = "";
    }
  });

  themeBrowserModalEl?.addEventListener("click", (event) => {
    if (event.target === themeBrowserModalEl) {
      closeThemeBrowserModal();
    }
  });

  themeBrowserGridEl?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const applyButton = target?.closest("[data-theme-apply]");
    if (!(applyButton instanceof HTMLButtonElement)) {
      return;
    }
    const choice = normalizeThemeChoice(applyButton.getAttribute("data-theme-apply"));
    applyTheme(choice, { persist: true });
  });

  window.addEventListener("keydown", (event) => {
    if (!themeBrowserModalEl || themeBrowserModalEl.hidden || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeThemeBrowserModal();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === CUSTOM_THEME_STORAGE_KEY) {
      state.customThemes = loadStoredCustomThemes();
      renderThemeBrowserCards();
      applyTheme(normalizeThemeChoice(localStorage.getItem(THEME_STORAGE_KEY)), { persist: false });
      return;
    }
    if (event.key === KEYBIND_STORAGE_KEY) {
      state.keybinds = loadStoredKeybinds();
      renderKeybindModal();
      return;
    }
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }
    applyTheme(normalizeThemeChoice(event.newValue), { persist: false });
  });
}

function wireAppExitGuard() {
  if (!hasTauriBackend || typeof tauriEventApi?.listen !== "function") {
    return;
  }

  try {
    const maybePromise = tauriEventApi.listen("qse://app-exit-requested", async () => {
      try {
        await invokeBackend("confirm_app_exit");
      } catch (error) {
        console.error(error);
      }
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      void maybePromise;
    }
  } catch (error) {
    console.error(error);
  }
}

function applyTheme(theme, options = {}) {
  const { persist = true } = options;
  const normalized = normalizeThemeChoice(theme);
  state.currentTheme = normalized;
  const customTheme = state.customThemes.find((entry) => entry.id === normalized) ?? null;
  if (customTheme) {
    applyCustomThemeOverrides(customTheme);
  } else {
    clearCustomThemeOverrides();
    document.documentElement.setAttribute("data-theme", normalized);
  }
  void applyThemedBrandIcon(normalized);
  updateThemeBrowserUi(normalized);
  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, normalized);
  }
}

function openThemeBrowserModal() {
  if (!themeBrowserModalEl) {
    return;
  }
  renderThemeBrowserCards();
  themeBrowserModalEl.hidden = false;
  window.setTimeout(() => {
    const firstButton = themeBrowserGridEl?.querySelector("[data-theme-apply]");
    if (firstButton instanceof HTMLElement) {
      firstButton.focus();
    }
  }, 0);
}

function closeThemeBrowserModal() {
  if (!themeBrowserModalEl) {
    return;
  }
  themeBrowserModalEl.hidden = true;
}

function renderThemeBrowserCards() {
  if (!themeBrowserGridEl) {
    return;
  }

  const cards = [...THEME_PRESETS, ...state.customThemes];
  themeBrowserGridEl.innerHTML = cards.map((preset) => {
    const id = normalizeThemeChoice(preset.id);
    const isActive = id === state.currentTheme;
    const preview = preset.preview ?? {};
    const note = `${preset.note ?? "Custom theme"}${preset.custom ? " • Custom" : ""}`;
    const previewStyle = [
      `--preview-bg:${preview.bg ?? "#141321"}`,
      `--preview-surface:${preview.surface ?? "#26233d"}`,
      `--preview-panel:${preview.panel ?? "#312d4f"}`,
      `--preview-accent:${preview.accent ?? "#7b72a5"}`,
      `--preview-muted:${preview.muted ?? "#b6b0d4"}`
    ].join(";");

    return `
      <article class="theme-card ${isActive ? "is-active" : ""}" data-theme-card="${escapeHtml(id)}">
        <header class="theme-card-header">
          <div>
            <div class="theme-card-name">${escapeHtml(preset.label)}</div>
            <div class="theme-card-note">${escapeHtml(note)}</div>
          </div>
          <span class="theme-card-status" ${isActive ? "" : "hidden"}>Applied</span>
        </header>
        <div class="theme-preview" style="${previewStyle}">
          <div class="theme-preview-topbar">
            <span class="theme-preview-pill is-wide"></span>
            <span class="theme-preview-pill is-short"></span>
          </div>
          <div class="theme-preview-main">
            <div class="theme-preview-rail"></div>
            <div class="theme-preview-stack">
              <span class="theme-preview-line"></span>
              <div class="theme-preview-tile"></div>
              <div class="theme-preview-chips" aria-hidden="true">
                <span class="theme-preview-chip is-bg"></span>
                <span class="theme-preview-chip is-panel"></span>
                <span class="theme-preview-chip is-accent"></span>
                <span class="theme-preview-chip is-muted"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="theme-card-actions">
          <button
            class="btn small theme-apply-btn ${isActive ? "success" : ""}"
            type="button"
            data-theme-apply="${escapeHtml(id)}"
          >
            ${isActive ? "Applied" : "Apply"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function updateThemeBrowserUi(activeTheme) {
  if (!themeBrowserGridEl) {
    return;
  }

  themeBrowserGridEl.querySelectorAll("[data-theme-card]").forEach((card) => {
    const themeId = normalizeThemeChoice(card.getAttribute("data-theme-card"));
    const isActive = themeId === activeTheme;
    card.classList.toggle("is-active", isActive);

    const status = card.querySelector(".theme-card-status");
    if (status instanceof HTMLElement) {
      status.hidden = !isActive;
    }

    const button = card.querySelector("[data-theme-apply]");
    if (button instanceof HTMLButtonElement) {
      button.classList.toggle("success", isActive);
      button.textContent = isActive ? "Applied" : "Apply";
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  });
}

function normalizeThemeChoice(value) {
  const normalizedId = normalizeThemeId(value);
  if (THEME_PRESETS.some((preset) => preset.id === normalizedId)) {
    return normalizedId;
  }
  if (state.customThemes.some((preset) => preset.id === normalizedId)) {
    return normalizedId;
  }
  return "midnight";
}

function normalizeThemeId(value) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
  if (raw === "pineforest") {
    return "pine-forest";
  }
  return raw;
}

function normalizeBuiltInTheme(value) {
  const normalized = normalizeThemeId(value);
  if (THEME_PRESETS.some((preset) => preset.id === normalized)) {
    return normalized;
  }
  return "midnight";
}

function clearCustomThemeOverrides() {
  const root = document.documentElement;
  for (const tokenName of Object.keys(state.customThemeOverrides)) {
    root.style.removeProperty(tokenName);
  }
  state.customThemeOverrides = {};
  root.removeAttribute("data-custom-theme");
}

function applyCustomThemeOverrides(theme) {
  const root = document.documentElement;
  clearCustomThemeOverrides();
  root.setAttribute("data-theme", normalizeBuiltInTheme(theme.baseTheme));
  root.setAttribute("data-custom-theme", theme.id);
  for (const [tokenName, tokenValue] of Object.entries(theme.tokens)) {
    root.style.setProperty(tokenName, tokenValue);
  }
  state.customThemeOverrides = { ...theme.tokens };
}

function loadStoredCustomThemes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => normalizeCustomThemeRecord(entry))
      .filter((entry) => Boolean(entry));
  } catch {
    return [];
  }
}

function persistCustomThemes() {
  localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(state.customThemes));
}

function sanitizeThemeTokens(rawTokens) {
  if (!rawTokens || typeof rawTokens !== "object") {
    return {};
  }
  const sanitized = {};
  for (const [rawName, rawValue] of Object.entries(rawTokens)) {
    const tokenName = String(rawName ?? "").trim();
    const tokenValue = String(rawValue ?? "").trim();
    if (!/^--[a-z0-9-]+$/i.test(tokenName)) {
      continue;
    }
    if (!tokenValue) {
      continue;
    }
    sanitized[tokenName] = tokenValue;
  }
  return sanitized;
}

function buildThemePreview(rawPreview, tokens, fallbackTheme) {
  const fallback = THEME_PRESETS.find((preset) => preset.id === fallbackTheme)?.preview ?? THEME_PRESETS[0].preview;
  const previewSource = rawPreview && typeof rawPreview === "object" ? rawPreview : {};
  const resolvePreviewValue = (key, tokenKey, fallbackValue) => {
    const explicit = String(previewSource[key] ?? "").trim();
    if (explicit) {
      return explicit;
    }
    const fromToken = String(tokens[tokenKey] ?? "").trim();
    if (fromToken) {
      return fromToken;
    }
    return fallbackValue;
  };
  return {
    bg: resolvePreviewValue("bg", "--bg", fallback.bg ?? "#141321"),
    surface: resolvePreviewValue("surface", "--surface", fallback.surface ?? "#26233d"),
    panel: resolvePreviewValue("panel", "--surface-panel", fallback.panel ?? "#312d4f"),
    accent: resolvePreviewValue("accent", "--active-border", fallback.accent ?? "#7b72a5"),
    muted: resolvePreviewValue("muted", "--muted", fallback.muted ?? "#b6b0d4")
  };
}

function normalizeCustomThemeRecord(rawRecord) {
  if (!rawRecord || typeof rawRecord !== "object") {
    return null;
  }

  const normalizedId = normalizeThemeId(rawRecord.id);
  if (!normalizedId || THEME_PRESETS.some((preset) => preset.id === normalizedId)) {
    return null;
  }

  const tokens = sanitizeThemeTokens(rawRecord.tokens);
  if (!Object.keys(tokens).length) {
    return null;
  }

  const baseTheme = normalizeBuiltInTheme(rawRecord.baseTheme);
  return {
    id: normalizedId,
    label: String(rawRecord.label ?? "Custom Theme").trim() || "Custom Theme",
    note: String(rawRecord.note ?? "Imported .qsetheme").trim() || "Imported .qsetheme",
    baseTheme,
    tokens,
    preview: buildThemePreview(rawRecord.preview, tokens, baseTheme),
    custom: true
  };
}

function parseThemeBundle(rawBundle) {
  if (!rawBundle || typeof rawBundle !== "object") {
    throw new Error("Theme file is not valid JSON.");
  }

  const format = String(rawBundle.format ?? QSE_THEME_FORMAT).trim().toLowerCase();
  if (format !== QSE_THEME_FORMAT) {
    throw new Error("Unsupported theme format.");
  }

  const version = Number(rawBundle.version ?? QSE_THEME_VERSION);
  if (!Number.isFinite(version) || version > QSE_THEME_VERSION) {
    throw new Error("Theme version is not supported yet.");
  }

  const rawLabel = String(rawBundle.label ?? rawBundle.name ?? "Custom Theme").trim();
  const label = rawLabel || "Custom Theme";
  const idCandidate = String(rawBundle.id ?? rawLabel).trim();
  const normalizedId = normalizeThemeId(idCandidate || `theme-${Date.now()}`);
  if (!normalizedId) {
    throw new Error("Theme id is missing.");
  }
  if (THEME_PRESETS.some((preset) => preset.id === normalizedId)) {
    throw new Error("Theme id conflicts with a built-in theme.");
  }

  const tokens = sanitizeThemeTokens(rawBundle.tokens);
  if (!Object.keys(tokens).length) {
    throw new Error("Theme bundle has no usable CSS tokens.");
  }

  const baseTheme = normalizeBuiltInTheme(rawBundle.baseTheme ?? rawBundle.extends ?? "midnight");
  return {
    id: normalizedId,
    label,
    note: String(rawBundle.note ?? "Imported .qsetheme").trim() || "Imported .qsetheme",
    baseTheme,
    tokens,
    preview: buildThemePreview(rawBundle.preview, tokens, baseTheme),
    custom: true
  };
}

function isThemeBundleUploadFile(file) {
  const name = String(file?.name ?? "").trim().toLowerCase();
  if (name.endsWith(".qsetheme") || name.endsWith(".json")) {
    return true;
  }
  const mimeType = String(file?.type ?? "").trim().toLowerCase();
  return mimeType === "application/json" || mimeType === "text/json";
}

async function importThemeBundleFile(file) {
  try {
    if (!isThemeBundleUploadFile(file)) {
      throw new Error("Only .qsetheme or .json files can be uploaded.");
    }
    const rawText = await file.text();
    const parsed = JSON.parse(rawText);
    const importedTheme = parseThemeBundle(parsed);
    const existingIndex = state.customThemes.findIndex((theme) => theme.id === importedTheme.id);
    if (existingIndex >= 0) {
      state.customThemes.splice(existingIndex, 1, importedTheme);
    } else {
      state.customThemes.push(importedTheme);
      state.customThemes.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    }
    persistCustomThemes();
    renderThemeBrowserCards();
    applyTheme(importedTheme.id, { persist: true });
    showToast(`Applied "${importedTheme.label}".`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import theme.";
    showToast(message, 2200);
  }
}

async function refreshProjects() {
  if (hasTauriBackend) {
    try {
      state.storagePaths = await invokeBackend("app_storage_paths");
      const [library, bin] = await Promise.all([
        invokeBackend("list_internal_projects"),
        invokeBackend("list_internal_bin_projects")
      ]);
      state.recentProjects = (Array.isArray(library) ? library : []).map((entry) => normalizeProjectSummary(entry));
      state.binProjects = (Array.isArray(bin) ? bin : []).map((entry) => normalizeProjectSummary(entry));
      renderRecentProjects();
      return;
    } catch (error) {
      console.error(error);
      showToast("Could not read native projects; using local fallback.", 2200);
    }
  }

  seedRecentProjectsFallback();
  renderRecentProjects();
}

function seedRecentProjectsFallback() {
  let restoredLibrary = false;
  let restoredBin = false;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      state.recentProjects = parsed.map((entry) => normalizeProjectSummary(entry));
      restoredLibrary = true;
    }
  } catch {
    // fallback to defaults
  }

  try {
    const parsedBin = JSON.parse(localStorage.getItem(BIN_STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsedBin)) {
      state.binProjects = parsedBin.map((entry) => normalizeProjectSummary(entry));
      restoredBin = true;
    }
  } catch {
    // fallback to empty
  }

  if (!restoredLibrary) {
    state.recentProjects = [
      { id: crypto.randomUUID(), name: "Aurora Guard", updatedAt: Date.now(), armType: "classic", layerCount: 2 },
      {
        id: crypto.randomUUID(),
        name: "Nebula Knight",
        updatedAt: Date.now() - 3600000,
        armType: "slim",
        layerCount: 2
      }
    ];
  }
  if (!restoredBin) {
    state.binProjects = [];
  }

  persistFallbackProjects();
}

function persistFallbackProjects() {
  if (hasTauriBackend) {
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state.recentProjects.map((entry) => normalizeProjectSummary(entry)))
  );
  localStorage.setItem(
    BIN_STORAGE_KEY,
    JSON.stringify(state.binProjects.map((entry) => normalizeProjectSummary(entry)))
  );
}

function renderRecentProjects() {
  if (!recentProjectsEl) {
    return;
  }

  const showingBin = state.activeShelf === "bin";
  const visibleProjects = showingBin ? state.binProjects : state.recentProjects;
  updateShelfUi(showingBin);

  if (!visibleProjects.length) {
    const storageHint = showingBin
      ? "BIN is empty."
      : state.storagePaths?.projectsDir
        ? `Projects folder: ${escapeHtml(state.storagePaths.projectsDir)}`
        : "No projects yet.";
    recentProjectsEl.innerHTML = `<li class="recent-empty">${storageHint}</li>`;
    return;
  }

  recentProjectsEl.innerHTML = visibleProjects
    .map((project) => {
      const updated = Number(project.updatedAt ?? Date.now());
      const date = new Date(updated).toLocaleString();
      const armType = normalizeArmType(project.armType) === "slim" ? "slim" : "wide";
      const layerCount = Number(project.layerCount ?? 2);
      const previewSrc = state.previewByProjectId[project.id] ?? "";
      return `
        <li class="recent-card" data-project-id="${project.id}">
          <div class="recent-card-preview" data-preview-for="${project.id}">
            ${
              previewSrc
                ? `<img class="recent-card-preview-image" alt="Skin preview" src="${escapeHtml(previewSrc)}" />`
                : '<div class="recent-card-preview-placeholder"></div>'
            }
          </div>
          <div class="recent-card-body">
            <div class="recent-card-top">
              <div class="recent-card-name">${escapeHtml(project.name)}</div>
              <div class="recent-card-meta">${escapeHtml(date)}</div>
            </div>
            <div class="recent-chip-row">
              <span class="recent-chip">${escapeHtml(armType === "slim" ? "Slim" : "Wide")}</span>
              <span class="recent-chip">${layerCount} layer(s)</span>
              <span class="recent-chip">${showingBin ? "BIN" : "Library"}</span>
            </div>
            <div class="recent-card-actions ${showingBin ? "is-bin" : "is-library"}">
              ${
                showingBin
                  ? `
                    <button class="btn small" type="button" data-recent-action="restore" data-project-id="${project.id}">Restore</button>
                    <button class="btn small danger" type="button" data-recent-action="delete-forever" data-project-id="${project.id}">Delete Forever</button>
                  `
                  : `
                    <button class="btn small" type="button" data-recent-action="open" data-project-id="${project.id}">Open</button>
                    <button class="btn small" type="button" data-recent-action="rename" data-project-id="${project.id}">Rename</button>
                    <button class="btn small danger" type="button" data-recent-action="delete" data-project-id="${project.id}">Delete</button>
                  `
              }
            </div>
          </div>
        </li>
      `;
    })
    .join("");

  queueProjectPreviews(visibleProjects, { fromBin: showingBin });
}

function updateShelfUi(showingBin) {
  if (libraryTabBtnEl) {
    libraryTabBtnEl.classList.toggle("is-active", !showingBin);
    libraryTabBtnEl.setAttribute("aria-selected", String(!showingBin));
  }
  if (binTabBtnEl) {
    binTabBtnEl.classList.toggle("is-active", showingBin);
    binTabBtnEl.setAttribute("aria-selected", String(showingBin));
  }
  if (recentHeadingEl) {
    recentHeadingEl.textContent = showingBin ? "BIN" : "Recent Projects";
  }
  if (clearRecentBtnEl) {
    clearRecentBtnEl.textContent = showingBin ? "Empty BIN" : "Move All to BIN";
  }
}

function queueProjectPreviews(projects, options = {}) {
  const { fromBin = false } = options;
  const list = Array.isArray(projects) ? projects : [];
  for (const project of list) {
    const projectId = String(project?.id ?? "").trim();
    if (!projectId) {
      continue;
    }
    if (state.previewByProjectId[projectId]) {
      continue;
    }
    if (state.previewLoadsInFlight.has(projectId)) {
      continue;
    }
    state.previewLoadsInFlight.add(projectId);
    void loadProjectPreviewDataUrl(projectId, { fromBin })
      .then((previewDataUrl) => {
        if (!previewDataUrl) {
          return;
        }
        state.previewByProjectId[projectId] = previewDataUrl;
        applyPreviewToCard(projectId, previewDataUrl);
      })
      .finally(() => {
        state.previewLoadsInFlight.delete(projectId);
      });
  }
}

function applyPreviewToCard(projectId, dataUrl) {
  if (!recentProjectsEl) {
    return;
  }
  const previewEl = recentProjectsEl.querySelector(`.recent-card-preview[data-preview-for="${projectId}"]`);
  if (!previewEl) {
    return;
  }
  previewEl.innerHTML = `<img class="recent-card-preview-image" alt="Skin preview" src="${escapeHtml(dataUrl)}" />`;
}

async function loadProjectPreviewDataUrl(projectId, options = {}) {
  const { fromBin = false } = options;

  let project = null;
  let paintPixels = [];
  let layerBitmaps = [];

  if (hasTauriBackend) {
    try {
      const loaded = fromBin
        ? await invokeBackend("load_internal_bin_project", { id: projectId })
        : await invokeBackend("load_internal_project", { id: projectId });
      const storedPreview = previewBytesToDataUrl(loaded?.previewPng);
      if (storedPreview) {
        return storedPreview;
      }
      project = loaded?.project ?? null;
      paintPixels = loaded?.paintPixels ?? [];
      layerBitmaps = loaded?.layerBitmaps ?? [];
    } catch (error) {
      console.error(error);
      return "";
    }
  } else {
    const parsed = readFallbackProjectState(projectId);
    if (!parsed) {
      return "";
    }
    project = {
      layers: parsed.layers
    };
    paintPixels = parsed.paintPixels;
    layerBitmaps = parsed.layerBitmaps;
  }

  return composePreviewDataUrl(project, paintPixels, layerBitmaps);
}

function previewBytesToDataUrl(rawPreviewBytes) {
  if (!rawPreviewBytes) {
    return "";
  }

  let bytes = null;
  if (Array.isArray(rawPreviewBytes)) {
    bytes = Uint8Array.from(rawPreviewBytes.map((value) => clampByte(value)));
  } else if (rawPreviewBytes instanceof Uint8Array || rawPreviewBytes instanceof Uint8ClampedArray) {
    bytes = new Uint8Array(rawPreviewBytes);
  } else {
    return "";
  }

  if (!bytes.length) {
    return "";
  }

  try {
    let binary = "";
    const CHUNK_SIZE = 0x8000;
    for (let index = 0; index < bytes.length; index += CHUNK_SIZE) {
      const chunk = bytes.subarray(index, index + CHUNK_SIZE);
      binary += String.fromCharCode(...chunk);
    }
    return `data:image/png;base64,${btoa(binary)}`;
  } catch (error) {
    console.error(error);
    return "";
  }
}

function composePreviewDataUrl(project, paintPixels, layerBitmaps) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return "";
  }

  const layerCanvas = document.createElement("canvas");
  layerCanvas.width = 64;
  layerCanvas.height = 64;
  const layerCtx = layerCanvas.getContext("2d", { willReadFrequently: true });
  if (!layerCtx) {
    return "";
  }

  const layerImageData = layerCtx.createImageData(64, 64);
  const byLayerId = new Map();
  const byFile = new Map();
  const normalizedBitmaps = Array.isArray(layerBitmaps) ? layerBitmaps : [];
  for (const entry of normalizedBitmaps) {
    const layerId = String(entry?.layerId ?? "").trim();
    const file = String(entry?.file ?? "").trim();
    const pixels = normalizePixels(entry?.pixels);
    if (layerId) {
      byLayerId.set(layerId, pixels);
    }
    if (file) {
      byFile.set(file, pixels);
    }
  }

  const fallbackPixels = normalizePixels(paintPixels);
  let usedFallback = false;
  const layers = Array.isArray(project?.layers) ? project.layers : [];

  ctx.clearRect(0, 0, 64, 64);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  for (const layer of layers) {
    if (normalizeLayerKind(layer?.kind) !== "paint" || layer?.visible === false) {
      continue;
    }

    const layerId = String(layer?.id ?? "");
    const layerFile = String(layer?.file ?? "");
    let pixels = byLayerId.get(layerId) ?? byFile.get(layerFile) ?? null;
    if (!pixels && !usedFallback) {
      pixels = fallbackPixels;
      usedFallback = true;
    }
    if (!pixels) {
      continue;
    }

    layerImageData.data.set(pixels);
    layerCtx.putImageData(layerImageData, 0, 0);
    ctx.globalCompositeOperation = normalizeBlendMode(layer?.blendMode) === "multiply" ? "multiply" : "source-over";
    ctx.globalAlpha = clamp(Number(layer?.opacity ?? 1), 0, 1);
    ctx.drawImage(layerCanvas, 0, 0);
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
}

function wireGlobalButtons() {
  libraryTabBtnEl?.addEventListener("click", () => {
    if (state.activeShelf === "library") {
      return;
    }
    state.activeShelf = "library";
    renderRecentProjects();
  });

  binTabBtnEl?.addEventListener("click", () => {
    if (state.activeShelf === "bin") {
      return;
    }
    state.activeShelf = "bin";
    renderRecentProjects();
  });

  document.getElementById("goEditorBtn")?.addEventListener("click", async () => {
    const action = await openEditorEntryModal();
    if (!action) {
      return;
    }
    if (action === "create") {
      await createProjectAndOpenEditor();
      return;
    }
    await openExistingProjectFromLibrary();
  });

  document.getElementById("openKeybindsBtn")?.addEventListener("click", () => {
    openKeybindModal();
  });

  window.addEventListener("keydown", (event) => {
    if (!eventMatchesActionBinding(event, "commandPalette")) {
      if (state.keybindCaptureActionId) {
        return;
      }
      if (isAnyModalOpen()) {
        return;
      }
      if (eventMatchesActionBinding(event, "openThemes")) {
        event.preventDefault();
        openThemeBrowserModal();
        return;
      }
      if (eventMatchesActionBinding(event, "newProject")) {
        event.preventDefault();
        void createProjectAndOpenEditor();
        return;
      }
      if (eventMatchesActionBinding(event, "openProject")) {
        event.preventDefault();
        void openExistingProjectFromLibrary();
      }
      return;
    }
    if (state.keybindCaptureActionId) {
      return;
    }
    if (isAnyModalOpen() && (!keybindModalEl || keybindModalEl.hidden)) {
      return;
    }
    event.preventDefault();
    if (keybindModalEl && !keybindModalEl.hidden) {
      closeKeybindModal();
    } else {
      openKeybindModal();
    }
  });

  document.getElementById("newProjectBtn")?.addEventListener("click", async () => {
    await createProjectAndOpenEditor();
  });

  document.getElementById("openProjectBtn")?.addEventListener("click", async () => {
    await openExistingProjectFromLibrary();
  });

  document.getElementById("importSkinBtn")?.addEventListener("click", async () => {
    if (hasTauriBackend) {
      const imported = await pickAndImportExternalProject({ pngOnly: true });
      if (imported?.id) {
        openEditor(imported.id);
      }
      return;
    }

    showToast("PNG import requires native backend mode.");
  });

  document.getElementById("clearRecentBtn")?.addEventListener("click", async () => {
    if (state.activeShelf === "bin") {
      const binItems = [...state.binProjects];
      if (!binItems.length) {
        showToast("BIN is already empty.");
        return;
      }
      const confirmed = await openConfirmModal({
        title: "Delete Forever",
        message: `This action is irreversible. Permanently delete ${binItems.length} project(s) from internal storage?`,
        confirmLabel: "Delete Forever",
        destructive: true
      });
      if (!confirmed) {
        return;
      }

      let deletedCount = 0;
      for (const project of binItems) {
        // eslint-disable-next-line no-await-in-loop
        const deleted = await permanentlyDeleteProjectFromBin(project.id, { quiet: true });
        if (deleted) {
          deletedCount += 1;
        }
      }
      if (deletedCount === binItems.length) {
        showToast("BIN emptied.");
      } else {
        showToast(`Deleted ${deletedCount}/${binItems.length} from BIN.`);
      }
      return;
    }

    const libraryItems = [...state.recentProjects];
    if (!libraryItems.length) {
      showToast("No projects in Library.");
      return;
    }
    const confirmed = await openConfirmModal({
      title: "Move Projects to BIN",
      message: `Move ${libraryItems.length} project(s) to BIN? You can restore them from BIN later.`,
      confirmLabel: "Move to BIN",
      destructive: false
    });
    if (!confirmed) {
      return;
    }

    for (const project of libraryItems) {
      // eslint-disable-next-line no-await-in-loop
      await moveProjectToBin(project.id, { quiet: true });
    }
    showToast("Moved projects to BIN.");
  });

  recentProjectsEl?.addEventListener("click", (event) => {
    const rawTarget = getEventTargetElement(event);
    if (!rawTarget) {
      return;
    }

    const actionButton = rawTarget.closest("button");
    if (!actionButton) {
      return;
    }

    let action = String(actionButton.getAttribute("data-recent-action") ?? "").trim();
    let projectId = String(actionButton.getAttribute("data-project-id") ?? "").trim();

    if (!action) {
      if (actionButton.hasAttribute("data-open-recent")) {
        action = "open";
        projectId = String(actionButton.getAttribute("data-open-recent") ?? "").trim();
      } else if (actionButton.hasAttribute("data-rename-recent")) {
        action = "rename";
        projectId = String(actionButton.getAttribute("data-rename-recent") ?? "").trim();
      } else if (actionButton.hasAttribute("data-delete-recent")) {
        action = "delete";
        projectId = String(actionButton.getAttribute("data-delete-recent") ?? "").trim();
      } else if (actionButton.hasAttribute("data-restore-recent")) {
        action = "restore";
        projectId = String(actionButton.getAttribute("data-restore-recent") ?? "").trim();
      } else if (actionButton.hasAttribute("data-delete-forever-recent")) {
        action = "delete-forever";
        projectId = String(actionButton.getAttribute("data-delete-forever-recent") ?? "").trim();
      }
    }

    if (!projectId) {
      projectId = String(
        actionButton.closest(".recent-card[data-project-id]")?.getAttribute("data-project-id") ?? ""
      ).trim();
    }
    if (!projectId) {
      return;
    }

    if (action === "restore") {
      void restoreProjectFromBin(projectId);
      return;
    }

    if (action === "delete-forever") {
      void permanentlyDeleteProjectFromBin(projectId);
      return;
    }

    if (action === "delete") {
      void moveProjectToBin(projectId);
      return;
    }

    if (action === "rename") {
      void renameProject(projectId);
      return;
    }

    if (action !== "open") {
      return;
    }

    const exists = state.recentProjects.some((item) => item.id === projectId);
    if (!exists) {
      showToast("Project no longer exists.");
      return;
    }

    openEditor(projectId);
  });
}

async function createProjectAndOpenEditor() {
  const details = await openProjectModal({
    mode: "create",
    title: "Create Project",
    confirmLabel: "Create",
    initialName: "Untitled Project",
    initialArmType: "classic",
    includeArmType: true
  });
  if (!details) {
    return null;
  }

  const created = await createNewProject(details.name, details.armType);
  if (created?.id) {
    openEditor(created.id);
  }
  return created;
}

async function openExistingProjectFromLibrary() {
  if (hasTauriBackend) {
    const imported = await pickAndImportExternalProject();
    if (imported?.id) {
      openEditor(imported.id);
      return imported;
    }
    return null;
  }

  if (!state.recentProjects.length) {
    showToast("No projects to open yet.");
    return null;
  }

  openEditor(state.recentProjects[0].id);
  return state.recentProjects[0];
}

async function createNewProject(rawName, armType, options = {}) {
  const { quiet = false } = options;
  const name = rawName || "Untitled Project";
  const normalizedArmType = normalizeArmType(armType);

  if (hasTauriBackend) {
    try {
      const created = await invokeBackend("create_internal_project", {
        input: {
          name,
          armType: normalizedArmType
        }
      });

      upsertProject(created);
      if (!quiet) {
        showToast(`Created ${created.name}.`);
      }
      return created;
    } catch (error) {
      console.error(error);
      showToast("Could not create project.");
      return null;
    }
  }

  const fallbackProject = {
    id: crypto.randomUUID(),
    name,
    updatedAt: Date.now(),
    armType: normalizedArmType,
    layerCount: 2
  };

  ensureFallbackProjectStateExists(fallbackProject.id, fallbackProject.name, fallbackProject.armType);
  upsertProject(fallbackProject);
  if (!quiet) {
    showToast(`Created ${name}.`);
  }
  return fallbackProject;
}

function upsertProject(project, options = {}) {
  const { shelf = "library" } = options;
  const normalizedProject = normalizeProjectSummary(project);
  const isBin = shelf === "bin";
  const targetKey = isBin ? "binProjects" : "recentProjects";
  const otherKey = isBin ? "recentProjects" : "binProjects";

  const next = state[targetKey].filter((item) => item.id !== normalizedProject.id);
  next.unshift(normalizedProject);
  state[targetKey] = next.slice(0, 24);
  state[otherKey] = state[otherKey].filter((item) => item.id !== normalizedProject.id);

  persistFallbackProjects();
  renderRecentProjects();
}

async function renameProject(projectId) {
  const existing = state.recentProjects.find((project) => project.id === projectId);
  if (!existing) {
    showToast("Project not found.");
    return;
  }

  const details = await openProjectModal({
    mode: "rename",
    title: "Rename Project",
    confirmLabel: "Rename",
    initialName: existing.name,
    includeArmType: false
  });
  if (!details) {
    return;
  }

  const nextName = details.name;
  if (!nextName) {
    showToast("Project name cannot be empty.");
    return;
  }

  if (hasTauriBackend) {
    try {
      const renamed = await invokeBackend("rename_internal_project", {
        input: {
          id: projectId,
          name: nextName
        }
      });
      upsertProject(renamed);
      showToast(`Renamed to ${renamed.name}.`);
      return;
    } catch (error) {
      console.error(error);
      showToast("Could not rename project.");
      return;
    }
  }

  const renamed = {
    ...existing,
    name: nextName,
    updatedAt: Date.now()
  };
  updateFallbackProjectStateName(projectId, nextName);
  updateFallbackAutosaveStateName(projectId, nextName);
  upsertProject(renamed);
  showToast(`Renamed to ${nextName}.`);
}

async function moveProjectToBin(projectId, options = {}) {
  const { quiet = false } = options;
  const existing = state.recentProjects.find((project) => project.id === projectId);
  if (!existing) {
    if (!quiet) {
      showToast("Project not found.");
    }
    return;
  }

  if (!quiet) {
    const confirmed = await openConfirmModal({
      title: "Move to BIN",
      message: `Delete "${existing.name}"? This sends the project to BIN and you can restore it later.`,
      confirmLabel: "Delete",
      destructive: true
    });
    if (!confirmed) {
      return;
    }
  }

  let movedSummary = null;
  let nativeMoveSucceeded = !hasTauriBackend;
  if (hasTauriBackend) {
    try {
      movedSummary = await invokeBackend("move_internal_project_to_bin", { id: projectId });
      nativeMoveSucceeded = true;
    } catch (error) {
      console.error(error);
      nativeMoveSucceeded = false;
    }
  }

  state.recentProjects = state.recentProjects.filter((project) => project.id !== projectId);
  state.binProjects = [
    normalizeProjectSummary(movedSummary ?? { ...existing, updatedAt: Date.now() }),
    ...state.binProjects.filter((project) => project.id !== projectId)
  ];
  persistFallbackProjects();
  renderRecentProjects();
  if (!quiet) {
    showToast(
      nativeMoveSucceeded
        ? `Moved ${existing.name} to BIN.`
        : `Moved ${existing.name} to BIN (local fallback; restart app to retry native save).`,
      nativeMoveSucceeded ? 1400 : 2800
    );
  }
}

async function restoreProjectFromBin(projectId, options = {}) {
  const { quiet = false } = options;
  const existing = state.binProjects.find((project) => project.id === projectId);
  if (!existing) {
    if (!quiet) {
      showToast("Binned project not found.");
    }
    return;
  }

  let nativeRestoreSucceeded = !hasTauriBackend;
  if (hasTauriBackend) {
    try {
      const restored = await invokeBackend("restore_internal_project_from_bin", { id: projectId });
      state.binProjects = state.binProjects.filter((project) => project.id !== projectId);
      upsertProject(restored, { shelf: "library" });
      if (!quiet) {
        showToast(`Restored ${restored.name}.`);
      }
      return;
    } catch (error) {
      console.error(error);
      nativeRestoreSucceeded = false;
    }
  }

  state.binProjects = state.binProjects.filter((project) => project.id !== projectId);
  upsertProject({ ...existing, updatedAt: Date.now() }, { shelf: "library" });
  if (!quiet) {
    showToast(
      nativeRestoreSucceeded
        ? `Restored ${existing.name}.`
        : `Restored ${existing.name} (local fallback; restart app to retry native save).`,
      nativeRestoreSucceeded ? 1400 : 2800
    );
  }
}

async function permanentlyDeleteProjectFromBin(projectId, options = {}) {
  const { quiet = false } = options;
  const normalizedId = String(projectId ?? "").trim();
  if (!normalizedId) {
    if (!quiet) {
      showToast("Invalid BIN project id.");
    }
    return false;
  }

  const existing = state.binProjects.find(
    (project) => project.id === normalizedId || String(project.path ?? "").trim() === normalizedId
  );
  if (!existing) {
    if (!quiet) {
      showToast("Binned project not found.");
    }
    return false;
  }

  if (!quiet) {
    const confirmed = await openConfirmModal({
      title: "Delete Forever",
      message:
        "This action is irreversible, doing so will delete this project from internal storage forever.",
      confirmLabel: "Delete Forever",
      destructive: true
    });
    if (!confirmed) {
      return false;
    }
  }

  if (hasTauriBackend) {
    try {
      const lookupId = String(existing.path ?? "").trim() || normalizedId;
      await invokeBackend("permanently_delete_internal_bin_project", { id: lookupId });
    } catch (error) {
      console.error(error);
      if (!quiet) {
        const reason = extractErrorMessage(error);
        showToast(`Could not permanently delete ${existing.name}: ${reason}`, 3200);
      }
      return false;
    }
  }

  localStorage.removeItem(fallbackProjectStateKey(normalizedId));
  localStorage.removeItem(fallbackAutosaveStateKey(normalizedId));

  state.binProjects = state.binProjects.filter((project) => project.id !== normalizedId);
  delete state.previewByProjectId[normalizedId];
  persistFallbackProjects();
  renderRecentProjects();

  if (!quiet) {
    showToast(`Permanently deleted ${existing.name}.`, 1400);
  }
  return true;
}

async function pickAndImportExternalProject(options = {}) {
  if (!hasTauriBackend) {
    return null;
  }

  const { pngOnly = false } = options;

  try {
    const pickedPath = await invokeBackend("pick_project_file");
    if (!pickedPath) {
      return null;
    }

    const lowerPath = pickedPath.toLowerCase();
    const isPng = lowerPath.endsWith(".png");
    const isQse = lowerPath.endsWith(".qse");
    if (!isPng && !isQse) {
      showToast("Only .qse or .png files are supported.");
      return null;
    }
    if (pngOnly && !isPng) {
      showToast("Please choose a .png skin file.");
      return null;
    }

    const imported = await invokeBackend("import_external_project", { path: pickedPath });
    upsertProject(imported);
    showToast(`Opened ${imported.name}.`);
    return imported;
  } catch (error) {
    console.error(error);
    showToast(pngOnly ? "Could not import selected PNG." : "Could not open selected file.");
    return null;
  }
}

function wireDropzone() {
  if (!dropzoneEl) {
    return;
  }

  wireNativeDropzone();

  dropzoneEl.addEventListener("dragenter", () => setDropzoneState("focus"));
  dropzoneEl.addEventListener("dragover", (event) => {
    event.preventDefault();
    setDropzoneState("focus");
  });
  dropzoneEl.addEventListener("dragleave", () => setDropzoneState("neutral"));

  dropzoneEl.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    const fallbackPath = getDroppedFilePathFromDropEvent(event);
    if (!file && !fallbackPath) {
      setDropzoneState("invalid");
      showToast("No file dropped.");
      return;
    }

    const fileName = String(file?.name ?? fallbackPath.split(/[\\/]/).pop() ?? "").toLowerCase();
    const valid = fileName.endsWith(".qse") || fileName.endsWith(".png");
    setDropzoneState(valid ? "valid" : "invalid");

    if (!valid) {
      showToast("Only .qse or .png supported here.");
      return;
    }

    if (hasTauriBackend) {
      const path = fallbackPath || getDroppedFilePath(file);
      if (!path) {
        // Native drop events may still provide the path on this same user action.
        return;
      }
      void importDroppedPath(path);
      return;
    }

    showToast(`${file.name} accepted.`);
  });

  dropzoneEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (hasTauriBackend) {
        void pickAndImportExternalProject().then((imported) => {
          if (imported?.id) {
            openEditor(imported.id);
          }
        });
        return;
      }
      showToast("Open requires native backend mode.");
    }
  });

  dropzoneEl.addEventListener("click", () => {
    if (!hasTauriBackend) {
      showToast("Open requires native backend mode.");
      return;
    }
    void pickAndImportExternalProject().then((imported) => {
      if (imported?.id) {
        openEditor(imported.id);
      }
    });
  });
}

function wireNativeDropzone() {
  if (!hasTauriBackend) {
    return;
  }

  const currentWindow = tauriWindowApi?.getCurrentWindow?.();
  if (!currentWindow || typeof currentWindow.onDragDropEvent !== "function") {
    return;
  }

  try {
    const maybePromise = currentWindow.onDragDropEvent((event) => {
      const payload = event?.payload ?? {};
      const type = String(payload.type ?? "");

      if (type === "enter" || type === "over") {
        setDropzoneState(isDropEventInsideDropzone(payload.position) ? "focus" : "neutral");
        return;
      }

      if (type === "leave") {
        setDropzoneState("neutral");
        return;
      }

      if (type !== "drop") {
        return;
      }

      setDropzoneState("neutral");
      if (!isDropEventInsideDropzone(payload.position)) {
        return;
      }

      const paths = Array.isArray(payload.paths) ? payload.paths : [];
      const droppedPath = paths.find((candidate) => isSupportedDropPath(candidate)) ?? "";
      if (!droppedPath) {
        setDropzoneState("invalid");
        showToast("Only .qse or .png supported here.");
        return;
      }

      void importDroppedPath(droppedPath);
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      void maybePromise
        .then((unlisten) => {
          state.nativeDropUnlisten = typeof unlisten === "function" ? unlisten : null;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  } catch (error) {
    console.error(error);
  }
}

function setDropzoneState(kind) {
  if (!dropzoneEl) {
    return;
  }

  dropzoneEl.classList.remove("is-focus", "is-valid", "is-invalid");
  if (kind === "focus") {
    dropzoneEl.classList.add("is-focus");
    return;
  }
  if (kind === "valid") {
    dropzoneEl.classList.add("is-valid");
    window.setTimeout(() => dropzoneEl.classList.remove("is-valid"), 650);
    return;
  }
  if (kind === "invalid") {
    dropzoneEl.classList.add("is-invalid");
    window.setTimeout(() => dropzoneEl.classList.remove("is-invalid"), 650);
  }
}

async function importDroppedPath(path) {
  if (!path || shouldIgnoreDrop(path)) {
    return;
  }

  try {
    const imported = await invokeBackend("import_external_project", { path });
    upsertProject(imported);
    setDropzoneState("valid");
    showToast(`Opened ${imported.name}.`);
    openEditor(imported.id);
  } catch (error) {
    console.error(error);
    setDropzoneState("invalid");
    showToast("Could not open dropped file.");
  }
}

function shouldIgnoreDrop(path) {
  const normalized = String(path ?? "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const now = Date.now();
  if (state.lastDropSignature === normalized && now - state.lastDropAt < 900) {
    return true;
  }

  state.lastDropSignature = normalized;
  state.lastDropAt = now;
  return false;
}

function isSupportedDropPath(path) {
  const lower = String(path ?? "").trim().toLowerCase();
  return lower.endsWith(".qse") || lower.endsWith(".png");
}

function isDropEventInsideDropzone(position) {
  if (!dropzoneEl || !position || typeof position !== "object") {
    return true;
  }

  const x = Number(position.x);
  const y = Number(position.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return true;
  }

  const rect = dropzoneEl.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function decodeFileUriToPath(raw) {
  if (typeof raw !== "string") {
    return "";
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (!lines.length) {
    return "";
  }

  const candidate = lines[0];
  if (candidate.startsWith("file://")) {
    try {
      const url = new URL(candidate);
      if (url.protocol !== "file:") {
        return "";
      }
      let pathname = decodeURIComponent(url.pathname ?? "");
      if (url.host) {
        pathname = `//${url.host}${pathname}`;
      } else if (/^\/[A-Za-z]:/.test(pathname)) {
        pathname = pathname.slice(1);
      }
      return pathname.trim();
    } catch (_error) {
      return "";
    }
  }

  if (candidate.startsWith("/") || /^[A-Za-z]:[\\/]/.test(candidate)) {
    return candidate;
  }
  return "";
}

function getDroppedFilePathFromDropEvent(event) {
  const transfer = event?.dataTransfer;
  if (!transfer) {
    return "";
  }

  const uriList = decodeFileUriToPath(transfer.getData?.("text/uri-list") ?? "");
  if (uriList) {
    return uriList;
  }

  const plainText = decodeFileUriToPath(transfer.getData?.("text/plain") ?? "");
  if (plainText) {
    return plainText;
  }

  const items = Array.from(transfer.items ?? []);
  for (const item of items) {
    const itemPath = getDroppedFilePath(item?.getAsFile?.());
    if (itemPath) {
      return itemPath;
    }
  }
  return "";
}

function getDroppedFilePath(file) {
  if (!file || typeof file !== "object") {
    return "";
  }

  const maybePath = file.path;
  if (typeof maybePath !== "string") {
    return "";
  }

  return maybePath.trim();
}

function wireProjectModal() {
  if (!projectModalEl || !projectModalFormEl) {
    return;
  }

  projectModalCancelBtnEl?.addEventListener("click", () => {
    closeProjectModal(null);
  });

  projectModalEl.addEventListener("click", (event) => {
    if (event.target === projectModalEl) {
      closeProjectModal(null);
    }
  });

  projectModalFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(projectModalNameInputEl?.value ?? "").trim();
    if (!name) {
      showToast("Project name cannot be empty.");
      projectModalNameInputEl?.focus();
      return;
    }

    const armType = projectModalArmSlimEl?.checked ? "slim" : "classic";
    closeProjectModal({
      name,
      armType
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!projectModalEl || projectModalEl.hidden) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeProjectModal(null);
    }
  });
}

function openProjectModal(options = {}) {
  if (!projectModalEl || !projectModalFormEl) {
    return Promise.resolve(null);
  }

  const {
    title = "Project",
    confirmLabel = "Confirm",
    initialName = "Untitled Project",
    initialArmType = "classic",
    includeArmType = true
  } = options;

  if (state.projectModalResolver) {
    closeProjectModal(null);
  }

  state.projectModalIncludeArmType = includeArmType;

  if (projectModalTitleEl) {
    projectModalTitleEl.textContent = title;
  }
  if (projectModalConfirmBtnEl) {
    projectModalConfirmBtnEl.textContent = confirmLabel;
  }
  if (projectModalNameInputEl) {
    projectModalNameInputEl.value = initialName;
  }
  if (projectModalArmTypeGroupEl) {
    projectModalArmTypeGroupEl.hidden = !includeArmType;
    const radios = projectModalArmTypeGroupEl.querySelectorAll("input[type='radio']");
    radios.forEach((radio) => {
      radio.disabled = !includeArmType;
    });
  }

  const normalizedArm = normalizeArmType(initialArmType);
  if (projectModalArmSlimEl) {
    projectModalArmSlimEl.checked = normalizedArm === "slim";
  }
  if (projectModalArmClassicEl) {
    projectModalArmClassicEl.checked = normalizedArm !== "slim";
  }

  projectModalEl.hidden = false;
  window.setTimeout(() => {
    projectModalNameInputEl?.focus();
    projectModalNameInputEl?.select();
  }, 0);

  return new Promise((resolve) => {
    state.projectModalResolver = resolve;
  });
}

function closeProjectModal(result) {
  if (!projectModalEl) {
    return;
  }

  const resolver = state.projectModalResolver;
  state.projectModalResolver = null;
  projectModalEl.hidden = true;

  if (!resolver) {
    return;
  }

  if (!result) {
    resolver(null);
    return;
  }

  resolver({
    name: String(result.name ?? "").trim(),
    armType: state.projectModalIncludeArmType ? normalizeArmType(result.armType) : "classic"
  });
}

function wireEditorEntryModal() {
  if (!editorEntryModalEl) {
    return;
  }

  editorEntryCancelBtnEl?.addEventListener("click", () => {
    closeEditorEntryModal(null);
  });

  editorEntryOpenBtnEl?.addEventListener("click", () => {
    closeEditorEntryModal("open");
  });

  editorEntryCreateBtnEl?.addEventListener("click", () => {
    closeEditorEntryModal("create");
  });

  editorEntryModalEl.addEventListener("click", (event) => {
    if (event.target === editorEntryModalEl) {
      closeEditorEntryModal(null);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!editorEntryModalEl || editorEntryModalEl.hidden) {
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeEditorEntryModal(null);
  });
}

function openEditorEntryModal() {
  if (!editorEntryModalEl) {
    return Promise.resolve(null);
  }

  if (state.editorEntryModalResolver) {
    closeEditorEntryModal(null);
  }

  editorEntryModalEl.hidden = false;
  window.setTimeout(() => {
    editorEntryOpenBtnEl?.focus();
  }, 0);

  return new Promise((resolve) => {
    state.editorEntryModalResolver = resolve;
  });
}

function closeEditorEntryModal(result) {
  if (!editorEntryModalEl) {
    return;
  }

  const resolver = state.editorEntryModalResolver;
  state.editorEntryModalResolver = null;
  editorEntryModalEl.hidden = true;
  if (!resolver) {
    return;
  }

  resolver(result === "create" || result === "open" ? result : null);
}

function wireConfirmModal() {
  if (!confirmModalEl) {
    return;
  }

  confirmModalCancelBtnEl?.addEventListener("click", () => {
    closeConfirmModal(false);
  });

  confirmModalConfirmBtnEl?.addEventListener("click", () => {
    closeConfirmModal(true);
  });

  confirmModalEl.addEventListener("click", (event) => {
    if (event.target === confirmModalEl) {
      closeConfirmModal(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!confirmModalEl || confirmModalEl.hidden) {
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeConfirmModal(false);
  });
}

function openConfirmModal(options = {}) {
  if (!confirmModalEl) {
    return Promise.resolve(false);
  }

  if (state.confirmModalResolver) {
    closeConfirmModal(false);
  }

  const {
    title = "Confirm Action",
    message = "Are you sure?",
    confirmLabel = "Confirm",
    destructive = false
  } = options;

  state.confirmModalDestructive = !!destructive;

  if (confirmModalTitleEl) {
    confirmModalTitleEl.textContent = String(title);
  }
  if (confirmModalMessageEl) {
    confirmModalMessageEl.textContent = String(message);
  }
  if (confirmModalConfirmBtnEl) {
    confirmModalConfirmBtnEl.textContent = String(confirmLabel);
    confirmModalConfirmBtnEl.classList.toggle("danger", state.confirmModalDestructive);
    confirmModalConfirmBtnEl.classList.toggle("success", !state.confirmModalDestructive);
  }

  confirmModalEl.hidden = false;
  window.setTimeout(() => {
    confirmModalConfirmBtnEl?.focus();
  }, 0);

  return new Promise((resolve) => {
    state.confirmModalResolver = resolve;
  });
}

function closeConfirmModal(confirmed) {
  if (!confirmModalEl) {
    return;
  }

  const resolver = state.confirmModalResolver;
  state.confirmModalResolver = null;
  confirmModalEl.hidden = true;

  if (confirmModalConfirmBtnEl) {
    confirmModalConfirmBtnEl.classList.remove("success", "danger");
    confirmModalConfirmBtnEl.classList.add("danger");
  }

  if (!resolver) {
    return;
  }

  resolver(confirmed === true);
}

function wireKeybindModal() {
  if (!keybindModalEl || !keybindListEl) {
    return;
  }

  keybindSearchInputEl?.addEventListener("input", () => {
    state.keybindSearchQuery = String(keybindSearchInputEl.value ?? "");
    renderKeybindModal();
  });

  keybindListEl.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }

    const captureBtn = target.closest("[data-keybind-capture]");
    if (captureBtn) {
      const actionId = String(captureBtn.getAttribute("data-keybind-capture") ?? "").trim();
      if (!actionId) {
        return;
      }
      if (state.keybindCaptureActionId === actionId) {
        state.keybindCaptureActionId = "";
      } else {
        state.keybindCaptureActionId = actionId;
      }
      renderKeybindModal();
      return;
    }

    const resetBtn = target.closest("[data-keybind-reset]");
    if (!resetBtn) {
      return;
    }
    const actionId = String(resetBtn.getAttribute("data-keybind-reset") ?? "").trim();
    if (!actionId || !Object.prototype.hasOwnProperty.call(KEYBIND_DEFAULTS, actionId)) {
      return;
    }
    setActionBinding(actionId, KEYBIND_DEFAULTS[actionId], { announce: true });
    if (state.keybindCaptureActionId === actionId) {
      state.keybindCaptureActionId = "";
    }
    renderKeybindModal();
  });

  keybindResetAllBtnEl?.addEventListener("click", () => {
    state.keybindCaptureActionId = "";
    state.keybinds = { ...KEYBIND_DEFAULTS };
    persistKeybinds();
    renderKeybindModal();
    showToast("Keybinds reset to defaults.", 1200);
  });

  keybindCloseBtnEl?.addEventListener("click", () => {
    closeKeybindModal();
  });

  keybindModalEl.addEventListener("click", (event) => {
    if (event.target === keybindModalEl) {
      closeKeybindModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!keybindModalEl || keybindModalEl.hidden) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (state.keybindCaptureActionId) {
        state.keybindCaptureActionId = "";
        renderKeybindModal();
        return;
      }
      closeKeybindModal();
      return;
    }
    if (!state.keybindCaptureActionId) {
      return;
    }
    if (isEditingText(event.target)) {
      return;
    }
    handleKeybindCaptureKeydown(event);
  });
}

function openKeybindModal() {
  if (!keybindModalEl) {
    return;
  }
  state.keybindCaptureActionId = "";
  state.keybindSearchQuery = "";
  if (keybindSearchInputEl) {
    keybindSearchInputEl.value = "";
  }
  keybindModalEl.hidden = false;
  renderKeybindModal();
  window.setTimeout(() => {
    keybindSearchInputEl?.focus();
    keybindSearchInputEl?.select();
  }, 0);
}

function closeKeybindModal() {
  if (!keybindModalEl) {
    return;
  }
  state.keybindCaptureActionId = "";
  state.keybindSearchQuery = "";
  keybindModalEl.hidden = true;
}

function renderKeybindModal() {
  if (!keybindListEl) {
    return;
  }

  const searchQuery = String(state.keybindSearchQuery ?? "").trim().toLowerCase();
  const hasSearch = searchQuery.length > 0;
  const matchesSearch = (...values) => {
    if (!hasSearch) {
      return true;
    }
    return values.some((value) => String(value ?? "").toLowerCase().includes(searchQuery));
  };
  const duplicates = getKeybindingDuplicates();
  const viewportRowsHtml = VIEWPORT_CONTROL_HINTS.filter((hint) =>
    matchesSearch(hint.label, hint.binding, "fixed gesture")
  )
    .map(
      (hint) => `
      <div class="keybind-row is-fixed">
        <span class="keybind-name">${escapeHtml(hint.label)}</span>
        <button class="btn small keybind-value-btn is-disabled" type="button" disabled>
          ${escapeHtml(hint.binding)}
        </button>
        <button class="btn small is-disabled" type="button" disabled>Fixed</button>
      </div>
    `
    )
    .join("");
  const customRowsHtml = KEYBIND_DEFINITIONS.map((definition) => {
    const binding = getActionBinding(definition.id);
    const bindingLabel = bindingToDisplayLabel(binding);
    const isCapturing = state.keybindCaptureActionId === definition.id;
    const isDuplicate = duplicates.has(definition.id);
    if (!matchesSearch(definition.label, definition.id, bindingLabel)) {
      return "";
    }
    return `
      <div class="keybind-row ${isDuplicate ? "is-duplicate" : ""}" data-keybind-row="${escapeHtml(definition.id)}">
        <span class="keybind-name">${escapeHtml(definition.label)}</span>
        <button
          class="btn small keybind-value-btn ${isCapturing ? "is-capturing" : ""}"
          type="button"
          data-keybind-capture="${escapeHtml(definition.id)}"
        >
          ${escapeHtml(isCapturing ? "Press Keys..." : bindingLabel)}
        </button>
        <button class="btn small" type="button" data-keybind-reset="${escapeHtml(definition.id)}">Reset</button>
      </div>
    `;
  }).join("");

  const rowsHtml = `${viewportRowsHtml}${customRowsHtml}`;
  keybindListEl.innerHTML = rowsHtml;
  if (keybindEmptyEl) {
    keybindEmptyEl.hidden = rowsHtml.trim().length > 0;
  }

  if (keybindModalWarningEl) {
    const shouldShowDuplicates =
      duplicates.size > 0 &&
      (!hasSearch || KEYBIND_DEFINITIONS.some((definition) => matchesSearch(definition.label, definition.id)));
    if (!shouldShowDuplicates) {
      keybindModalWarningEl.hidden = true;
      keybindModalWarningEl.textContent = "";
    } else {
      keybindModalWarningEl.hidden = false;
      keybindModalWarningEl.textContent =
        "Duplicate shortcuts detected. The first matching action takes priority.";
    }
  }
}

function getKeybindingDuplicates() {
  const byBinding = new Map();
  for (const definition of KEYBIND_DEFINITIONS) {
    const binding = getActionBinding(definition.id);
    if (!binding) {
      continue;
    }
    const existing = byBinding.get(binding);
    if (existing) {
      existing.push(definition.id);
    } else {
      byBinding.set(binding, [definition.id]);
    }
  }

  const duplicates = new Set();
  for (const actionIds of byBinding.values()) {
    if (actionIds.length < 2) {
      continue;
    }
    for (const actionId of actionIds) {
      duplicates.add(actionId);
    }
  }
  return duplicates;
}

function handleKeybindCaptureKeydown(event) {
  if (!keybindModalEl || keybindModalEl.hidden || !state.keybindCaptureActionId) {
    return false;
  }

  const binding = eventToBindingString(event);
  if (!binding) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  setActionBinding(state.keybindCaptureActionId, binding, { announce: true });
  state.keybindCaptureActionId = "";
  renderKeybindModal();
  return true;
}

function loadStoredKeybinds() {
  const keybinds = { ...KEYBIND_DEFAULTS };
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYBIND_STORAGE_KEY) ?? "{}");
    if (parsed && typeof parsed === "object") {
      for (const definition of KEYBIND_DEFINITIONS) {
        if (!Object.prototype.hasOwnProperty.call(parsed, definition.id)) {
          continue;
        }
        const normalized = normalizeBindingString(parsed[definition.id]);
        if (!normalized) {
          continue;
        }
        keybinds[definition.id] = normalized;
      }
    }
  } catch {
    // Ignore malformed keybind storage and keep defaults.
  }
  return keybinds;
}

function persistKeybinds() {
  localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(state.keybinds));
}

function getActionBinding(actionId) {
  return normalizeBindingString(state.keybinds[actionId] || KEYBIND_DEFAULTS[actionId] || "");
}

function eventMatchesActionBinding(event, actionId) {
  const actionBinding = getActionBinding(actionId);
  if (!actionBinding) {
    return false;
  }
  const eventBinding = eventToBindingString(event);
  return !!eventBinding && eventBinding === actionBinding;
}

function isAnyModalOpen() {
  return (
    (projectModalEl && !projectModalEl.hidden) ||
    (editorEntryModalEl && !editorEntryModalEl.hidden) ||
    (confirmModalEl && !confirmModalEl.hidden) ||
    (keybindModalEl && !keybindModalEl.hidden) ||
    (themeBrowserModalEl && !themeBrowserModalEl.hidden) ||
    (helpModalEl && !helpModalEl.hidden)
  );
}

function setActionBinding(actionId, binding, options = {}) {
  if (!Object.prototype.hasOwnProperty.call(KEYBIND_DEFAULTS, actionId)) {
    return;
  }
  const { announce = false } = options;
  const rawBinding = typeof binding === "string" ? binding.trim() : "";
  const normalized = normalizeBindingString(binding);
  const clearBinding = rawBinding.length === 0;
  if (!normalized && !clearBinding) {
    return;
  }
  if (clearBinding) {
    delete state.keybinds[actionId];
  } else {
    state.keybinds[actionId] = normalized;
  }
  persistKeybinds();
  if (announce) {
    if (clearBinding) {
      showToast("Shortcut cleared.", 1200);
      return;
    }
    const duplicates = getKeybindingDuplicates();
    if (duplicates.has(actionId)) {
      showToast(`Duplicate shortcut set: ${bindingToDisplayLabel(normalized)}.`, 1800);
      return;
    }
    showToast(`Shortcut updated: ${bindingToDisplayLabel(normalized)}.`, 1200);
  }
}

function eventToBindingString(event) {
  if (!event) {
    return "";
  }

  const parts = [];
  if (event.metaKey || event.ctrlKey) {
    parts.push("CmdOrCtrl");
  }
  if (event.shiftKey) {
    parts.push("Shift");
  }
  if (event.altKey) {
    parts.push("Alt");
  }

  const code = String(event.code ?? "").trim();
  const key = String(event.key ?? "").trim();

  let keyToken = "";
  if (isCodeBindingToken(code)) {
    keyToken = code;
  } else if (key === "Delete" || key === "Backspace") {
    keyToken = "Delete";
  } else if (key === "Escape") {
    keyToken = "Escape";
  } else if (key === "Tab") {
    keyToken = "Tab";
  }

  if (!keyToken) {
    return "";
  }
  parts.push(keyToken);
  return normalizeBindingString(parts.join("+"));
}

function isEditingText(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    return true;
  }
  return false;
}

function isCodeBindingToken(token) {
  return /^(Key[A-Z]|Digit[0-9]|BracketLeft|BracketRight|Equal|Minus)$/.test(String(token ?? ""));
}

function normalizeBindingString(rawBinding) {
  const raw = String(rawBinding ?? "").trim();
  if (!raw) {
    return "";
  }
  const parts = raw.split("+").map((part) => part.trim()).filter(Boolean);
  let requiresCmdOrCtrl = false;
  let requiresShift = false;
  let requiresAlt = false;
  let key = "";

  for (const part of parts) {
    if (part === "CmdOrCtrl") {
      requiresCmdOrCtrl = true;
      continue;
    }
    if (part === "Shift") {
      requiresShift = true;
      continue;
    }
    if (part === "Alt") {
      requiresAlt = true;
      continue;
    }
    if (!key && (isCodeBindingToken(part) || part === "Delete" || part === "Escape" || part === "Tab")) {
      key = part;
    }
  }

  if (!key) {
    return "";
  }

  const normalizedParts = [];
  if (requiresCmdOrCtrl) {
    normalizedParts.push("CmdOrCtrl");
  }
  if (requiresShift) {
    normalizedParts.push("Shift");
  }
  if (requiresAlt) {
    normalizedParts.push("Alt");
  }
  normalizedParts.push(key);
  return normalizedParts.join("+");
}

function bindingToDisplayLabel(binding) {
  const normalized = normalizeBindingString(binding);
  if (!normalized) {
    return "Unassigned";
  }
  return normalized
    .split("+")
    .map((part) => {
      if (part === "CmdOrCtrl") {
        return "Cmd/Ctrl";
      }
      if (part === "BracketLeft") {
        return "[";
      }
      if (part === "BracketRight") {
        return "]";
      }
      if (part === "Equal") {
        return "=";
      }
      if (part === "Minus") {
        return "-";
      }
      if (part.startsWith("Key")) {
        return part.slice(3);
      }
      if (part.startsWith("Digit")) {
        return part.slice(5);
      }
      return part;
    })
    .join(" + ");
}

function openEditor(projectId) {
  const nextUrl = new URL("./editor.html", window.location.href);
  nextUrl.searchParams.set("projectId", projectId);
  window.location.href = nextUrl.toString();
}

function normalizeProjectSummary(summary) {
  return {
    id: String(summary?.id ?? ""),
    name: String(summary?.name ?? "Untitled Project"),
    updatedAt: Number(summary?.updatedAt ?? Date.now()),
    armType: normalizeArmType(summary?.armType),
    layerCount: Number(summary?.layerCount ?? 2),
    path: String(summary?.path ?? "")
  };
}

function fallbackProjectStateKey(projectId) {
  return `${FALLBACK_PROJECT_KEY_PREFIX}${projectId}`;
}

function fallbackAutosaveStateKey(projectId) {
  return `${FALLBACK_AUTOSAVE_KEY_PREFIX}${projectId}`;
}

function ensureFallbackProjectStateExists(projectId, name, armType) {
  if (!projectId) {
    return;
  }

  const key = fallbackProjectStateKey(projectId);
  if (localStorage.getItem(key)) {
    return;
  }

  const blankPixels = new Array(64 * 64 * 4).fill(0);
  localStorage.setItem(
    key,
    JSON.stringify({
      name,
      armType: normalizeArmType(armType),
      layers: [
        {
          id: "layer-guide",
          name: "Layer 1 · Guide",
          kind: "guide",
          visible: true,
          locked: true,
          opacity: 1,
          blendMode: "normal",
          file: ""
        },
        {
          id: "layer-paint",
          name: "Layer 2 · Paint",
          kind: "paint",
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: "normal",
          file: "layers/paint.png"
        }
      ],
      parts: [
        { part: "Head", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true },
        { part: "Torso", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true },
        { part: "Left Arm", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true },
        { part: "Right Arm", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true },
        { part: "Left Leg", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true },
        { part: "Right Leg", baseLock: false, outerLock: false, baseVisibility: true, outerVisibility: true }
      ],
      paintPixels: blankPixels,
      layerBitmaps: [
        {
          layerId: "layer-paint",
          file: "layers/paint.png",
          pixels: blankPixels
        }
      ],
      updatedAt: Date.now()
    })
  );
}

function readFallbackProjectState(projectId) {
  if (!projectId) {
    return null;
  }
  try {
    const raw = localStorage.getItem(fallbackProjectStateKey(projectId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return {
      layers: Array.isArray(parsed?.layers) ? parsed.layers : [],
      paintPixels: Array.isArray(parsed?.paintPixels) ? parsed.paintPixels : [],
      layerBitmaps: Array.isArray(parsed?.layerBitmaps) ? parsed.layerBitmaps : []
    };
  } catch {
    return null;
  }
}

function updateFallbackProjectStateName(projectId, name) {
  if (!projectId) {
    return;
  }
  const key = fallbackProjectStateKey(projectId);
  const raw = localStorage.getItem(key);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    parsed.name = name;
    parsed.updatedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    // ignore malformed fallback state
  }
}

function updateFallbackAutosaveStateName(projectId, name) {
  if (!projectId) {
    return;
  }
  const key = fallbackAutosaveStateKey(projectId);
  const raw = localStorage.getItem(key);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    parsed.name = name;
    parsed.updatedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    // ignore malformed fallback state
  }
}

async function invokeBackend(command, args = {}) {
  if (!hasTauriBackend) {
    throw new Error("Tauri backend is not available in this runtime");
  }
  return tauriInvoke(command, args);
}

function normalizeLayerKind(kind) {
  return String(kind ?? "").toLowerCase() === "guide" ? "guide" : "paint";
}

function normalizeBlendMode(blendMode) {
  return String(blendMode ?? "").toLowerCase() === "multiply" ? "multiply" : "normal";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value) {
  return clamp(Number(value ?? 0), 0, 255);
}

function normalizePixels(rawPixels) {
  const output = new Uint8ClampedArray(64 * 64 * 4);
  if (!Array.isArray(rawPixels) && !(rawPixels instanceof Uint8Array) && !(rawPixels instanceof Uint8ClampedArray)) {
    return output;
  }

  const length = Math.min(output.length, rawPixels.length);
  for (let i = 0; i < length; i += 1) {
    output[i] = clampByte(rawPixels[i]);
  }
  return output;
}

function getEventTargetElement(event) {
  const target = event?.target;
  if (target instanceof HTMLElement) {
    return target;
  }
  if (target instanceof Node) {
    return target.parentElement;
  }
  return null;
}

function normalizeArmType(value) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  if (raw === "slim" || raw === "3px") {
    return "slim";
  }

  if (raw === "wide" || raw === "classic" || raw === "4px") {
    return "classic";
  }

  return "classic";
}

function extractErrorMessage(error) {
  if (!error) {
    return "Unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}") {
      return serialized;
    }
  } catch {
    // ignore serialization issues
  }

  return "Unknown error";
}

function showToast(message, duration = 1400) {
  if (!toastEl) {
    return;
  }

  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast.timerId);
  showToast.timerId = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, duration);
}

async function fakeBusy(message) {
  const cleanLabel = message
    .replace(/\(stub\)\.\.\./gi, "...")
    .replace(/\s+/g, " ")
    .trim();

  showToast(message);
  if (overlayLabelEl) {
    overlayLabelEl.textContent = cleanLabel || "Working...";
  }

  if (overlayEl) {
    overlayEl.hidden = false;
  }
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
  } finally {
    if (overlayEl) {
      overlayEl.hidden = true;
    }
    if (overlayLabelEl) {
      overlayLabelEl.textContent = "Working...";
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
