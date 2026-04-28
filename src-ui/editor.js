import { applyThemedBrandIcon } from "./themed-icon.js";

const STORAGE_KEY = "queenskin.recentProjects";
const THEME_STORAGE_KEY = "queenskin.theme.v1";
const CUSTOM_THEME_STORAGE_KEY = "queenskin.customThemes.v1";
const DEFAULT_HEX = "#C44BFFFF";
const TEXTURE_SIZE = 64;
const HISTORY_LIMIT = 200;
const MIN_CANVAS_ZOOM = 1;
const MAX_CANVAS_ZOOM = 24;
const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;
const FALLBACK_PROJECT_KEY_PREFIX = "queenskin.project.";
const FALLBACK_AUTOSAVE_KEY_PREFIX = "queenskin.autosave.";
const KEYBIND_STORAGE_KEY = "queenskin.keybinds.v1";
const QSE_THEME_FORMAT = "qsetheme";
const QSE_THEME_VERSION = 1;
const GUIDE_TEMPLATE_SOURCES = {
  classic: ["./assets/skin-template-wide-uv.png", "./assets/skin-template-wide.png"],
  slim: ["./assets/skin-template-slim-uv.png", "./assets/skin-template-slim.png"]
};
const VIEWPORT_MODEL_SOURCES = {
  classic: ["./assets/skin-model-wide.obj"],
  slim: ["./assets/skin-model-slim.obj"]
};
const VIEWPORT_OBJECT_TO_PART_SURFACE = {
  Head: { part: "Head", surface: "base" },
  "Hat Layer": { part: "Head", surface: "outer" },
  Body: { part: "Torso", surface: "base" },
  "Body Layer": { part: "Torso", surface: "outer" },
  "Left Arm": { part: "Left Arm", surface: "base" },
  "Left Arm Layer": { part: "Left Arm", surface: "outer" },
  "Right Arm": { part: "Right Arm", surface: "base" },
  "Right Arm Layer": { part: "Right Arm", surface: "outer" },
  "Left Leg": { part: "Left Leg", surface: "base" },
  "Left Leg Layer": { part: "Left Leg", surface: "outer" },
  "Right Leg": { part: "Right Leg", surface: "base" },
  "Right Leg Layer": { part: "Right Leg", surface: "outer" }
};
const ICON_PATHS = {
  visible:
    "M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z",
  invisible:
    "M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM120 221.9C110.6 212.5 95.4 212.5 86.1 221.9C76.8 231.3 76.7 246.5 86.1 255.8L360.2 530C369.6 539.4 384.8 539.4 394.1 530C403.4 520.6 403.5 505.4 394.1 496.1L120 221.9zM77.7 315.3C68.3 305.9 53.1 305.9 43.8 315.3C34.5 324.7 34.4 339.9 43.8 349.2L213.9 519.5C223.3 528.9 238.5 528.9 247.8 519.5C257.1 510.1 257.2 494.9 247.8 485.6L77.7 315.3z",
  locked:
    "M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z",
  unlocked:
    "M416 160C416 124.7 444.7 96 480 96C515.3 96 544 124.7 544 160L544 192C544 209.7 558.3 224 576 224C593.7 224 608 209.7 608 192L608 160C608 89.3 550.7 32 480 32C409.3 32 352 89.3 352 160L352 224L192 224C156.7 224 128 252.7 128 288L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 288C512 252.7 483.3 224 448 224L416 224L416 160z"
};

function iconMarkup(kind, className = "") {
  const path = ICON_PATHS[kind];
  if (!path) {
    return "";
  }
  const classAttr = className ? ` class="${className}"` : "";
  return `<svg${classAttr} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path d="${path}"/></svg>`;
}

function getCursorForTool(tool, options = {}) {
  const { zoomOut = false, grabbing = false } = options;
  if (tool === "pencil") {
    return "crosshair";
  }
  if (tool === "eraser") {
    return "crosshair";
  }
  if (tool === "fill") {
    return "crosshair";
  }
  if (tool === "select") {
    return "crosshair";
  }
  if (tool === "eyedropper") {
    return "copy";
  }
  if (tool === "zoom") {
    return zoomOut ? "zoom-out" : "zoom-in";
  }
  if (tool === "grab") {
    return grabbing ? "grabbing" : "grab";
  }
  return "crosshair";
}

function getPartControlButtonMeta(control, isPressed) {
  if (control === "base") {
    return { icon: isPressed ? "locked" : "unlocked", label: "Base Lock" };
  }
  if (control === "outer") {
    return { icon: isPressed ? "locked" : "unlocked", label: "Outer Lock" };
  }
  if (control === "baseVisibility") {
    return { icon: isPressed ? "visible" : "invisible", label: "Base Visible" };
  }
  if (control === "outerVisibility") {
    return { icon: isPressed ? "visible" : "invisible", label: "Outer Visible" };
  }
  return null;
}

function updatePartControlButtonIcon(button, control, isPressed) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  const meta = getPartControlButtonMeta(control, isPressed);
  if (!meta) {
    return;
  }
  button.innerHTML = `${iconMarkup(meta.icon, "lock-control-icon")}<span class="lock-control-label">${meta.label}</span>`;
}

const toastEl = document.getElementById("toast");
const dirtyDotEl = document.getElementById("dirtyDot");
const fileMenuEl = document.getElementById("fileMenu");
const fileMenuBtnEl = document.getElementById("fileMenuBtn");
const fileMenuPopoverEl = document.getElementById("fileMenuPopover");
const fileMenuSubpanelEl = document.getElementById("fileMenuSubpanel");
const fileMenuSubpanelTitleEl = document.getElementById("fileMenuSubpanelTitle");
const fileMenuSubpanelListEl = document.getElementById("fileMenuSubpanelList");
const openThemeBrowserBtnEl = document.getElementById("openThemeBrowserBtn");
const themeBrowserModalEl = document.getElementById("themeBrowserModal");
const themeBrowserGridEl = document.getElementById("themeBrowserGrid");
const themeBrowserCloseBtnEl = document.getElementById("themeBrowserCloseBtn");
const themeUploadBtnEl = document.getElementById("themeUploadBtn");
const themeUploadInputEl = document.getElementById("themeUploadInput");
const projectNameChipEl = document.getElementById("projectNameChip");
const brushSizeRangeEl = document.getElementById("brushSizeRange");
const brushSizeLabelEl = document.getElementById("brushSizeLabel");
const gridToggleBtnEl = document.getElementById("gridToggleBtn");
const centerStageEl = document.getElementById("centerStage");
const viewportPanelEl = document.getElementById("viewportPanel");
const viewportCanvasWrapEl = document.getElementById("viewportCanvasWrap");
const viewportCanvasEl = document.getElementById("viewportCanvas");
const targetBadgeEl = document.getElementById("targetBadge");
const lightingModeEl = document.getElementById("lightingMode");
const viewportGridToggleBtnEl = document.getElementById("viewportGridToggleBtn");
const centerSplitEl = document.getElementById("centerSplit");
const rightStackEl = document.getElementById("rightStack");
const colorPanelEl = document.getElementById("colorPanel");
const partsPanelEl = document.getElementById("partsPanel");
const layersPanelEl = document.getElementById("layersPanel");
const addLayerBtnEl = document.getElementById("addLayerBtn");
const mergeLayersBtnEl = document.getElementById("mergeLayersBtn");
const deleteLayerBtnEl = document.getElementById("deleteLayerBtn");
const historyUndoBtnEl = document.getElementById("historyUndoBtn");
const historyRedoBtnEl = document.getElementById("historyRedoBtn");
const historyListEl = document.getElementById("historyList");
const rightSplitTopEl = document.getElementById("rightSplitTop");
const rightSplitBottomEl = document.getElementById("rightSplitBottom");
const partsListEl = document.getElementById("partsList");
const canvasStageEl = document.getElementById("canvasStage");
const pixelCanvasEl = document.getElementById("pixelCanvas");
const canvasHudEl = document.getElementById("canvasHud");
const svCanvasEl = document.getElementById("svCanvas");
const hueCanvasEl = document.getElementById("hueCanvas");
const redRangeEl = document.getElementById("redRange");
const greenRangeEl = document.getElementById("greenRange");
const blueRangeEl = document.getElementById("blueRange");
const alphaRangeEl = document.getElementById("alphaRange");
const redValueEl = document.getElementById("redValue");
const greenValueEl = document.getElementById("greenValue");
const blueValueEl = document.getElementById("blueValue");
const alphaValueEl = document.getElementById("alphaValue");
const hexInputEl = document.getElementById("hexInput");
const hexPreviewEl = document.getElementById("hexPreview");
const layersListEl = document.getElementById("layersList");
const layerBlendSelectEl = document.getElementById("layerBlendSelect");
const layerOpacityRangeEl = document.getElementById("layerOpacityRange");
const layerOpacityValueEl = document.getElementById("layerOpacityValue");
const renameModalEl = document.getElementById("renameModal");
const renameModalFormEl = document.getElementById("renameModalForm");
const renameModalInputEl = document.getElementById("renameModalInput");
const renameModalCancelBtnEl = document.getElementById("renameModalCancelBtn");
const projectConfigModalEl = document.getElementById("projectConfigModal");
const projectConfigModalFormEl = document.getElementById("projectConfigModalForm");
const projectConfigModalTitleEl = document.getElementById("projectConfigModalTitle");
const projectConfigNameInputEl = document.getElementById("projectConfigNameInput");
const projectConfigArmTypeGroupEl = document.getElementById("projectConfigArmTypeGroup");
const projectConfigArmClassicEl = document.getElementById("projectConfigArmClassic");
const projectConfigArmSlimEl = document.getElementById("projectConfigArmSlim");
const projectConfigCancelBtnEl = document.getElementById("projectConfigCancelBtn");
const projectConfigConfirmBtnEl = document.getElementById("projectConfigConfirmBtn");
const confirmModalEl = document.getElementById("confirmModal");
const confirmModalFormEl = document.getElementById("confirmModalForm");
const confirmModalTitleEl = document.getElementById("confirmModalTitle");
const confirmModalMessageEl = document.getElementById("confirmModalMessage");
const confirmModalCancelBtnEl = document.getElementById("confirmModalCancelBtn");
const confirmModalConfirmBtnEl = document.getElementById("confirmModalConfirmBtn");
const unsavedCloseModalEl = document.getElementById("unsavedCloseModal");
const unsavedCloseModalTitleEl = document.getElementById("unsavedCloseModalTitle");
const unsavedCloseModalMessageEl = document.getElementById("unsavedCloseModalMessage");
const unsavedCloseCancelBtnEl = document.getElementById("unsavedCloseCancelBtn");
const unsavedCloseDiscardBtnEl = document.getElementById("unsavedCloseDiscardBtn");
const unsavedCloseSaveBtnEl = document.getElementById("unsavedCloseSaveBtn");
const recoveryModalEl = document.getElementById("recoveryModal");
const recoveryModalTitleEl = document.getElementById("recoveryModalTitle");
const recoveryModalMessageEl = document.getElementById("recoveryModalMessage");
const recoveryDiscardBtnEl = document.getElementById("recoveryDiscardBtn");
const recoveryRestoreBtnEl = document.getElementById("recoveryRestoreBtn");
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
const preflightModalEl = document.getElementById("preflightModal");
const preflightSummaryEl = document.getElementById("preflightSummary");
const preflightIssuesEl = document.getElementById("preflightIssues");
const preflightCancelBtnEl = document.getElementById("preflightCancelBtn");
const preflightProceedBtnEl = document.getElementById("preflightProceedBtn");
const statusProjectEl = document.getElementById("statusProject");
const statusToolEl = document.getElementById("statusTool");
const statusZoomEl = document.getElementById("statusZoom");
const statusLayerEl = document.getElementById("statusLayer");
const statusHistoryEl = document.getElementById("statusHistory");
const statusAutosaveEl = document.getElementById("statusAutosave");
const statusPreflightEl = document.getElementById("statusPreflight");
const statusDirtyEl = document.getElementById("statusDirty");

const tauriInvoke = window.__TAURI__?.core?.invoke;
const tauriWindowApi = window.__TAURI__?.window;
const tauriEventApi = window.__TAURI__?.event;
const hasTauriBackend = typeof tauriInvoke === "function";

const state = {
  view: "editor",
  dirty: false,
  activeProject: null,
  savedSnapshot: null,
  autosaveTimerId: null,
  autosaveInFlight: false,
  renameModalResolver: null,
  projectConfigModalResolver: null,
  projectConfigModalIncludeArmType: true,
  confirmModalResolver: null,
  confirmModalOptions: null,
  unsavedCloseModalResolver: null,
  recoveryModalResolver: null,
  bypassWindowCloseOnce: false,
  closeGuardWired: false,
  appExitGuardBusy: false,
  keybindCaptureActionId: "",
  keybindSearchQuery: "",
  keybinds: {},
  recentProjectCache: [],
  fileMenuSubpanelKind: "",
  preflightModalResolver: null,
  lastAutosaveAt: 0,
  lastSaveAt: 0,
  lastPreflight: null,
  preflightStatus: "n/a",
  currentTheme: "midnight",
  customThemes: [],
  customThemeOverrides: {},
  activeResize: null
};

const editor = {
  textureSize: TEXTURE_SIZE,
  textureCanvas: null,
  textureCtx: null,
  textureImageData: null,
  composeCanvas: null,
  composeCtx: null,
  composeLayerCanvas: null,
  composeLayerCtx: null,
  composeLayerImageData: null,
  pixels: null,
  viewCtx: null,
  history: [],
  historyIndex: -1,
  historySequence: 0,
  isPointerDown: false,
  pointerId: null,
  lastPoint: null,
  pendingStrokeLayerId: null,
  pendingStrokeBefore: null,
  strokeChanged: false,
  strokeVisited: null,
  strokeBasePixels: null,
  brushSize: 1,
  showCanvasGrid: true,
  zoom: 10,
  renderedPixelSize: 10,
  panX: 0,
  panY: 0,
  isPanning: false,
  panPointerId: null,
  panStartClientX: 0,
  panStartClientY: 0,
  panStartX: 0,
  panStartY: 0,
  spacePanActive: false,
  currentTool: "pencil",
  altEyedropperActive: false,
  hoverPoint: null,
  brushColor: [196, 75, 255, 255],
  guideArmType: "classic",
  guideImage: null,
  guideLoadToken: 0,
  layers: [],
  paintLayerPixelsById: {},
  activeLayerId: "",
  selectedLayerIds: new Set(),
  layerPanelSelectionId: "",
  partsState: [],
  draggingLayerId: null,
  dropTargetLayerId: null,
  dropTargetBelow: false,
  layerReorderPointerId: null,
  inlineRenameLayerId: "",
  pendingLayerTitleClickTimer: null,
  lastLayerTitleClickLayerId: "",
  lastLayerTitleClickAtMs: 0,
  boxSelection: null,
  boxSelectionLayerId: "",
  selectionClipboard: null,
  selectionDrag: null,
  colorHue: 0,
  colorSat: 0,
  colorVal: 1,
  colorPickerDragMode: null,
  colorPickerPointerId: null,
  resizeObserver: null,
  lastUnsupportedToastAt: 0,
  centerSplitRatio: 0.42,
  rightTopRatio: 0.43,
  rightMiddleRatio: 0.32,
  startupColorPaneFitted: false,
  viewportCtx: null,
  viewportModel: null,
  viewportModelCache: {},
  viewportArmType: "classic",
  viewportHovering: false,
  viewportRotatePointerId: null,
  viewportPanPointerId: null,
  viewportRotateStartX: 0,
  viewportRotateStartY: 0,
  viewportPanStartX: 0,
  viewportPanStartY: 0,
  viewportRotateBaseYaw: 0,
  viewportRotateBasePitch: 0,
  viewportPanBaseOffsetX: 0,
  viewportPanBaseOffsetY: 0,
  viewportYaw: 0,
  viewportPitch: 0,
  viewportOffsetX: 0,
  viewportOffsetY: 0,
  viewportZoom: 1,
  viewportShowGrid: true,
  viewportLightingMode: "true-color",
  viewportRenderQueued: false,
  viewportRenderInFlight: false,
  viewportPickWidth: 0,
  viewportPickHeight: 0,
  viewportPickTriangles: new Int32Array(0),
  viewportPickU: new Float32Array(0),
  viewportPickV: new Float32Array(0),
  viewportPickBaseTriangles: new Int32Array(0),
  viewportPickBaseU: new Float32Array(0),
  viewportPickBaseV: new Float32Array(0),
  viewportPickOuterTriangles: new Int32Array(0),
  viewportPickOuterU: new Float32Array(0),
  viewportPickOuterV: new Float32Array(0),
  viewportLastCompositePixels: new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4),
  viewportHoverSample: null,
  viewportLastPaintPoint: null,
  viewportLastClientX: 0,
  viewportLastClientY: 0,
  viewportPointerId: null,
  viewportPaintTool: null,
  viewportResizeObserver: null,
  viewportLastBlockToastAt: 0
};

const PART_NAMES = ["Head", "Torso", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOOL_LABELS = {
  pencil: "Pencil",
  eraser: "Eraser",
  fill: "Fill",
  select: "Box Select",
  eyedropper: "Eyedropper",
  zoom: "Zoom",
  grab: "Grab"
};
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
const VIEWPORT_ROTATE_NUDGE = 0.16;
const VIEWPORT_PAN_NUDGE = 24;
const VIEWPORT_CONTROL_HINTS = [
  { label: "3D Viewport Rotate", binding: "Space + Drag or Cmd/Ctrl + Drag" },
  { label: "3D Viewport Pan", binding: "Shift + Drag" },
  { label: "3D Viewport Zoom", binding: "Mouse Wheel" },
  { label: "2D Canvas Pan", binding: "Space + Drag" }
];

void init();

async function init() {
  state.keybinds = loadStoredKeybinds();
  initPixelEditor();
  initViewport();
  initializeLayerStack();
  initializePartsState();
  renderPartsPanel();
  renderLayersPanel();
  wireGlobalButtons();
  wireEditorInteractions();
  wireFileMenu();
  wireKeyboard();
  wireAutosaveLifecycle();
  wireRenameModal();
  wireProjectConfigModal();
  wireConfirmModal();
  wireUnsavedCloseModal();
  wireRecoveryModal();
  wireWindowCloseGuard();
  wireAppExitGuard();
  wireKeybindModal();
  wirePreflightModal();
  wireLayoutSplitters();
  wireThemeBrowser();
  wireHelpModal();
  updateKeybindUiHints();
  setDirty(false);
  updateProjectChip();
  renderUndoHistoryPanel();
  updateStatusBar();

  await loadInitialProject();

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
      updateKeybindUiHints();
      return;
    }
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }
    applyTheme(normalizeThemeChoice(event.newValue), { persist: false });
  });
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

function initPixelEditor() {
  if (!pixelCanvasEl || !canvasStageEl) {
    return;
  }

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = TEXTURE_SIZE;
  textureCanvas.height = TEXTURE_SIZE;
  const composeCanvas = document.createElement("canvas");
  composeCanvas.width = TEXTURE_SIZE;
  composeCanvas.height = TEXTURE_SIZE;
  const composeLayerCanvas = document.createElement("canvas");
  composeLayerCanvas.width = TEXTURE_SIZE;
  composeLayerCanvas.height = TEXTURE_SIZE;

  const textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true });
  const viewCtx = pixelCanvasEl.getContext("2d", { alpha: false });
  const composeCtx = composeCanvas.getContext("2d", { willReadFrequently: true });
  const composeLayerCtx = composeLayerCanvas.getContext("2d", { willReadFrequently: true });
  if (!textureCtx || !viewCtx || !composeCtx || !composeLayerCtx) {
    return;
  }

  editor.textureCanvas = textureCanvas;
  editor.textureCtx = textureCtx;
  editor.textureImageData = textureCtx.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  editor.composeCanvas = composeCanvas;
  editor.composeCtx = composeCtx;
  editor.composeLayerCanvas = composeLayerCanvas;
  editor.composeLayerCtx = composeLayerCtx;
  editor.composeLayerImageData = composeLayerCtx.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  editor.pixels = new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  editor.viewCtx = viewCtx;

  clearEditorTexture(false);

  pixelCanvasEl.addEventListener("pointerdown", onCanvasPointerDown);
  pixelCanvasEl.addEventListener("pointermove", onCanvasPointerMove);
  pixelCanvasEl.addEventListener("pointerup", onCanvasPointerUp);
  pixelCanvasEl.addEventListener("pointercancel", onCanvasPointerUp);
  pixelCanvasEl.addEventListener("pointerleave", () => {
    if (editor.isPointerDown) {
      return;
    }
    if (editor.hoverPoint) {
      editor.hoverPoint = null;
      renderPixelCanvas();
    }
  });
  pixelCanvasEl.addEventListener(
    "wheel",
    (event) => {
      if (state.view !== "editor") {
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      adjustEditorZoom(event.deltaY < 0 ? 1 : -1, false, { x: event.clientX, y: event.clientY });
    },
    { passive: false }
  );

  pixelCanvasEl.addEventListener("contextmenu", (event) => event.preventDefault());

  if (window.ResizeObserver) {
    editor.resizeObserver = new ResizeObserver(() => {
      applySplitLayout();
      renderPixelCanvas();
    });
    editor.resizeObserver.observe(canvasStageEl);
  }

  window.addEventListener("resize", () => {
    applySplitLayout();
    renderPixelCanvas();
  });

  syncColorFromHexInput();
  updateToolUI();
  updateBrushSizeUi();
  updateGridToggleUi();
  applySplitLayout();
  renderPixelCanvas();
}

function initViewport() {
  if (!viewportCanvasEl || !viewportCanvasWrapEl) {
    return;
  }

  const ctx = viewportCanvasEl.getContext("2d", { alpha: false, willReadFrequently: true });
  if (!ctx) {
    return;
  }
  editor.viewportCtx = ctx;
  editor.viewportLightingMode = normalizeViewportLightingMode(lightingModeEl?.value);

  viewportCanvasWrapEl.addEventListener("pointerenter", () => {
    if (state.view !== "editor") {
      return;
    }
    setViewportHoverState(true);
  });

  viewportCanvasWrapEl.addEventListener("pointerleave", () => {
    if (
      editor.viewportRotatePointerId !== null ||
      editor.viewportPanPointerId !== null ||
      editor.viewportPointerId !== null
    ) {
      return;
    }
    setViewportHoverState(false);
  });

  viewportCanvasEl.addEventListener("pointerdown", onViewportPointerDown);
  viewportCanvasEl.addEventListener("pointermove", onViewportPointerMove);
  viewportCanvasEl.addEventListener("pointerup", onViewportPointerUp);
  viewportCanvasEl.addEventListener("pointercancel", onViewportPointerUp);
  viewportCanvasEl.addEventListener(
    "wheel",
    (event) => {
      if (state.view !== "editor") {
        return;
      }
      event.preventDefault();
      adjustViewportZoomByWheel(event.deltaY, false);
    },
    { passive: false }
  );
  viewportCanvasEl.addEventListener("contextmenu", (event) => event.preventDefault());

  lightingModeEl?.addEventListener("change", () => {
    editor.viewportLightingMode = normalizeViewportLightingMode(lightingModeEl.value);
    queueViewportRender();
    window.setTimeout(() => {
      lightingModeEl?.blur();
    }, 0);
  });
  lightingModeEl?.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      lightingModeEl?.blur();
    }, 0);
  });
  viewportGridToggleBtnEl?.addEventListener("click", () => {
    editor.viewportShowGrid = !editor.viewportShowGrid;
    updateViewportGridToggleUi();
    queueViewportRender();
  });
  document.querySelectorAll(".axis-btn[data-axis]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = getEventTargetElement(event);
      if (!target) {
        return;
      }
      const axis = String(target.getAttribute("data-axis") ?? "").toLowerCase();
      if (!axis) {
        return;
      }
      const negative = event.altKey === true;
      snapViewportToAxis(axis, negative);
      event.preventDefault();
      event.stopPropagation();
    });
  });

  if (window.ResizeObserver) {
    editor.viewportResizeObserver = new ResizeObserver(() => {
      queueViewportRender();
    });
    editor.viewportResizeObserver.observe(viewportCanvasWrapEl);
  }

  window.addEventListener("resize", () => {
    queueViewportRender();
  });

  updateViewportCursor();
  updateTargetBadge("outer");
  updateViewportGridToggleUi();
  queueViewportRender();
}

function clearEditorTexture(resetHistory = true) {
  if (!editor.pixels) {
    return;
  }

  editor.pixels.fill(0);
  if (resetHistory) {
    editor.history = [];
    editor.historyIndex = -1;
    editor.historySequence = 0;
    renderUndoHistoryPanel();
  }
  editor.pendingStrokeBefore = null;
  editor.strokeChanged = false;
  editor.strokeVisited = null;
  editor.strokeBasePixels = null;
  syncTextureCanvas();
  renderPixelCanvas();
  updateStatusBar();
}

function syncTextureCanvas() {
  syncTextureCanvasFromPixels(editor.pixels);
  queueViewportRender();
}

function syncTextureCanvasFromPixels(pixels) {
  if (!editor.textureCtx || !editor.textureImageData) {
    return;
  }
  const source =
    pixels instanceof Uint8Array || pixels instanceof Uint8ClampedArray
      ? pixels
      : new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  editor.textureImageData.data.set(source);
  editor.textureCtx.putImageData(editor.textureImageData, 0, 0);
}

function renderPartsPanel() {
  if (!partsListEl) {
    return;
  }

  partsListEl.innerHTML = editor.partsState
    .map((part) => {
      const baseLockPressed = part.baseLock ? "true" : "false";
      const baseVisibilityPressed = part.baseVisibility ? "true" : "false";
      const outerLockPressed = part.outerLock ? "true" : "false";
      const outerVisibilityPressed = part.outerVisibility ? "true" : "false";

      return `
        <div class="part-row" data-part="${part.part}">
          <div class="part-head">
            <span class="part-name">${part.part}</span>
          </div>
          <div class="part-matrix">
            <div class="part-column">
              <button class="lock-control" aria-pressed="${baseLockPressed}" data-lock-control="${part.part}:base" type="button">
                ${iconMarkup(part.baseLock ? "locked" : "unlocked", "lock-control-icon")}
                <span class="lock-control-label">Base Lock</span>
              </button>
              <button class="lock-control" aria-pressed="${baseVisibilityPressed}" data-lock-control="${part.part}:baseVisibility" type="button">
                ${iconMarkup(part.baseVisibility ? "visible" : "invisible", "lock-control-icon")}
                <span class="lock-control-label">Base Visible</span>
              </button>
            </div>
            <div class="part-column">
              <button class="lock-control" aria-pressed="${outerLockPressed}" data-lock-control="${part.part}:outer" type="button">
                ${iconMarkup(part.outerLock ? "locked" : "unlocked", "lock-control-icon")}
                <span class="lock-control-label">Outer Lock</span>
              </button>
              <button class="lock-control" aria-pressed="${outerVisibilityPressed}" data-lock-control="${part.part}:outerVisibility" type="button">
                ${iconMarkup(part.outerVisibility ? "visible" : "invisible", "lock-control-icon")}
                <span class="lock-control-label">Outer Visible</span>
              </button>
            </div>
          </div>
          <div class="lock-hint" aria-live="polite"></div>
        </div>
      `;
    })
    .join("");

  if (partsListEl.dataset.wired === "true") {
    return;
  }
  partsListEl.dataset.wired = "true";

  partsListEl.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }

    const controlTarget = target.closest("button[data-lock-control]");
    if (!controlTarget) {
      return;
    }

    const lockControl = controlTarget.getAttribute("data-lock-control") ?? "";
    const [partName, control] = lockControl.split(":");
    if (!partName || !control) {
      return;
    }

    const partState = editor.partsState.find((item) => item.part === partName);
    if (!partState) {
      return;
    }

    const isPressed = controlTarget.getAttribute("aria-pressed") === "true";
    const next = !isPressed;
    controlTarget.setAttribute("aria-pressed", String(next));
    updatePartControlButtonIcon(controlTarget, control, next);
    applyPartControlValue(partState, control, next);
    setDirty(true);
    queueViewportRender();
  });
}

function renderLayersPanel() {
  if (!layersListEl) {
    return;
  }

  const selectedLayer = ensureLayerPanelSelection();
  updateLayerSharedControls(selectedLayer);

  const armType = normalizeArmType(state.activeProject?.armType);
  const armLabel = armType === "slim" ? "Slim Template" : "Wide Template";
  const displayLayers = getDisplayLayers();
  if (!displayLayers.length) {
    layersListEl.innerHTML = '<div class="layers-empty">No layers available.</div>';
    renderUndoHistoryPanel();
    return;
  }

  layersListEl.innerHTML = displayLayers
    .map((layer) => {
      const isDragging = editor.draggingLayerId === layer.id;
      const isDropTarget = editor.dropTargetLayerId === layer.id;
      const isGuide = layer.kind === "guide";
      const isPaint = layer.kind === "paint";
      const isSelected = isPaint && editor.selectedLayerIds.has(layer.id);
      const isFocused = selectedLayer?.id === layer.id;
      const isInlineEditing = isPaint && editor.inlineRenameLayerId === layer.id;
      const previewSrc = getLayerPreviewDataUrl(layer);

      return `
        <div
          class="layer-row ${isSelected ? "is-selected" : ""} ${isFocused ? "is-focused" : ""} ${isDragging ? "is-dragging" : ""} ${isDropTarget ? "is-drop-target" : ""}"
          data-layer-id="${layer.id}"
          data-layer-kind="${layer.kind}"
        >
          <button
            class="layer-visibility-btn"
            data-layer-action="toggle-layer-visible"
            data-layer-id="${layer.id}"
            aria-pressed="${layer.visible ? "true" : "false"}"
            aria-label="${layer.visible ? "Hide layer" : "Show layer"}"
            title="${layer.visible ? "Hide layer" : "Show layer"}"
            type="button"
          >
            ${iconMarkup(layer.visible ? "visible" : "invisible", "layer-visibility-icon")}
          </button>
          <div class="layer-preview-cell" aria-hidden="true">
            ${
              previewSrc
                ? `<img class="layer-preview-image" alt="" src="${escapeHtml(previewSrc)}" />`
                : '<div class="layer-preview-placeholder"></div>'
            }
          </div>
          <div class="layer-main">
            ${
              isInlineEditing
                ? `
                  <input
                    class="layer-name-inline-input"
                    type="text"
                    value="${escapeHtml(layer.name)}"
                    maxlength="80"
                    data-layer-action="inline-rename-input"
                    data-layer-id="${layer.id}"
                  />
                `
                : `<span class="layer-title" data-layer-id="${layer.id}" title="${escapeHtml(layer.name)}">${escapeHtml(layer.name)}</span>`
            }
            <span class="layer-subtle">${isGuide ? `${armLabel}${editor.guideImage ? "" : " • Missing PNG"}` : "Paint Layer"}</span>
          </div>
          ${isPaint ? `<button class="layer-drag-handle" data-layer-id="${layer.id}" aria-label="Reorder layer" title="Drag to reorder" type="button">⋮⋮</button>` : '<span class="layer-base-anchor" title="Guide layer stays at bottom">Base</span>'}
        </div>
      `;
    })
    .join("");

  if (editor.inlineRenameLayerId) {
    const inlineInput = layersListEl.querySelector("input.layer-name-inline-input");
    if (
      inlineInput &&
      inlineInput.getAttribute("data-layer-id") === editor.inlineRenameLayerId &&
      document.activeElement !== inlineInput
    ) {
      inlineInput.focus();
      inlineInput.select();
    }
  }

  renderUndoHistoryPanel();
}

function ensureLayerPanelSelection() {
  const selected = getLayerById(editor.layerPanelSelectionId);
  if (selected) {
    return selected;
  }

  const activePaint = getActivePaintLayer();
  if (activePaint) {
    editor.layerPanelSelectionId = activePaint.id;
    return activePaint;
  }

  const guide = getGuideLayer();
  if (guide) {
    editor.layerPanelSelectionId = guide.id;
    return guide;
  }

  editor.layerPanelSelectionId = "";
  return null;
}

function updateLayerSharedControls(layer = ensureLayerPanelSelection()) {
  if (!layerBlendSelectEl || !layerOpacityRangeEl || !layerOpacityValueEl) {
    return;
  }

  if (!layer) {
    layerBlendSelectEl.value = "normal";
    layerBlendSelectEl.disabled = true;
    layerOpacityRangeEl.value = "100";
    layerOpacityRangeEl.disabled = true;
    layerOpacityValueEl.textContent = "100%";
    return;
  }

  const opacityPercent = Math.round(clamp(Number(layer.opacity ?? 1), 0, 1) * 100);
  const blendMode = normalizeBlendMode(layer.blendMode);
  layerBlendSelectEl.value = blendMode;
  layerBlendSelectEl.disabled = false;
  layerOpacityRangeEl.value = String(opacityPercent);
  layerOpacityRangeEl.disabled = false;
  layerOpacityValueEl.textContent = `${opacityPercent}%`;
}

function getLayerPreviewDataUrl(layer) {
  if (!layer) {
    return "";
  }

  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = TEXTURE_SIZE;
  previewCanvas.height = TEXTURE_SIZE;
  const previewCtx = previewCanvas.getContext("2d", { willReadFrequently: true });
  if (!previewCtx) {
    return "";
  }

  if (layer.kind === "guide") {
    if (!editor.guideImage) {
      return "";
    }
    previewCtx.globalAlpha = clamp(Number(layer.opacity ?? 1), 0, 1);
    previewCtx.drawImage(editor.guideImage, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    previewCtx.globalAlpha = 1;
    return previewCanvas.toDataURL("image/png");
  }

  const layerPixels = getLayerPixels(layer.id);
  if (!layerPixels) {
    return "";
  }

  const normalizedPixels = normalizePaintPixels(layerPixels);
  const imageData = previewCtx.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  imageData.data.set(normalizedPixels);
  previewCtx.putImageData(imageData, 0, 0);
  return previewCanvas.toDataURL("image/png");
}

function initializeLayerStack() {
  editor.layers = [
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
  ];
  editor.paintLayerPixelsById = {
    "layer-paint": new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4)
  };
  editor.activeLayerId = "layer-paint";
  editor.selectedLayerIds = new Set(["layer-paint"]);
  editor.layerPanelSelectionId = "layer-paint";
  editor.pixels = editor.paintLayerPixelsById["layer-paint"];
  syncTextureCanvas();
  editor.draggingLayerId = null;
  editor.dropTargetLayerId = null;
  editor.dropTargetBelow = false;
  editor.layerReorderPointerId = null;
  editor.inlineRenameLayerId = "";
}

function initializePartsState() {
  editor.partsState = PART_NAMES.map((part) => ({
    part,
    baseLock: false,
    outerLock: false,
    baseVisibility: true,
    outerVisibility: true
  }));
}

function getDisplayLayers() {
  return [...editor.layers].reverse();
}

function getPaintLayers() {
  return editor.layers.filter((layer) => layer.kind === "paint");
}

function getLayerById(layerId) {
  if (!layerId) {
    return null;
  }
  return editor.layers.find((layer) => layer.id === layerId) ?? null;
}

function getLayerPixels(layerId) {
  if (!layerId) {
    return null;
  }
  return editor.paintLayerPixelsById[layerId] ?? null;
}

function ensureLayerPixels(layerId) {
  if (!layerId) {
    return null;
  }
  if (!editor.paintLayerPixelsById[layerId]) {
    editor.paintLayerPixelsById[layerId] = new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  }
  return editor.paintLayerPixelsById[layerId];
}

function selectLayerFromUi(layerId, options = {}) {
  const { append = false } = options;
  const layer = getLayerById(layerId);
  if (!layer) {
    return false;
  }

  clearPendingLayerTitleClick();
  editor.inlineRenameLayerId = "";
  editor.layerPanelSelectionId = layer.id;

  if (layer.kind === "paint") {
    if (!append) {
      editor.selectedLayerIds = new Set([layer.id]);
    } else {
      editor.selectedLayerIds.add(layer.id);
    }
    setActivePaintLayer(layer.id, { announce: false, render: false });
  } else if (!append) {
    editor.selectedLayerIds = new Set();
  }

  renderLayersPanel();
  renderPixelCanvas();
  return true;
}

function startInlineLayerRename(layerId) {
  const layer = getLayerById(layerId);
  if (!layer || layer.kind !== "paint") {
    return false;
  }

  clearPendingLayerTitleClick();
  editor.lastLayerTitleClickLayerId = "";
  editor.lastLayerTitleClickAtMs = 0;
  editor.inlineRenameLayerId = layer.id;
  renderLayersPanel();
  return true;
}

function commitInlineLayerRename(layerId, nextNameRaw, options = {}) {
  const { announce = true } = options;
  if (!layerId || editor.inlineRenameLayerId !== layerId) {
    return false;
  }

  const layer = getLayerById(layerId);
  editor.inlineRenameLayerId = "";
  if (!layer || layer.kind !== "paint") {
    renderLayersPanel();
    return false;
  }

  const nextName = String(nextNameRaw ?? "").trim();
  if (!nextName) {
    renderLayersPanel();
    showToast("Layer name cannot be empty.");
    return false;
  }

  if (nextName !== layer.name) {
    layer.name = nextName;
    setDirty(true);
    if (announce) {
      showToast(`Renamed layer to ${nextName}.`, 900);
    }
  }

  renderLayersPanel();
  return true;
}

function cancelInlineLayerRename() {
  if (!editor.inlineRenameLayerId) {
    return;
  }
  clearPendingLayerTitleClick();
  editor.lastLayerTitleClickLayerId = "";
  editor.lastLayerTitleClickAtMs = 0;
  editor.inlineRenameLayerId = "";
  renderLayersPanel();
}

function clearPendingLayerTitleClick() {
  if (editor.pendingLayerTitleClickTimer !== null) {
    window.clearTimeout(editor.pendingLayerTitleClickTimer);
    editor.pendingLayerTitleClickTimer = null;
  }
}

function getActivePaintLayer() {
  const active = getLayerById(editor.activeLayerId);
  if (active && active.kind === "paint") {
    return active;
  }

  const fallback = getPaintLayers().at(-1) ?? getPaintLayers()[0] ?? null;
  if (!fallback) {
    return null;
  }
  editor.activeLayerId = fallback.id;
  editor.pixels = ensureLayerPixels(fallback.id);
  return fallback;
}

function setActivePaintLayer(layerId, options = {}) {
  const { announce = false, render = true } = options;
  const nextLayer = getLayerById(layerId);
  if (!nextLayer || nextLayer.kind !== "paint") {
    return false;
  }

  const previousLayerId = editor.activeLayerId;
  editor.activeLayerId = nextLayer.id;
  editor.pixels = ensureLayerPixels(nextLayer.id);
  const panelSelected = getLayerById(editor.layerPanelSelectionId);
  if (!panelSelected || panelSelected.kind === "paint") {
    editor.layerPanelSelectionId = nextLayer.id;
  }
  if (previousLayerId && previousLayerId !== nextLayer.id) {
    clearBoxSelection({ render: false });
  }
  syncTextureCanvas();
  if (render) {
    renderLayersPanel();
    renderPixelCanvas();
  }
  if (announce) {
    showToast(`Active layer: ${nextLayer.name}`, 900);
  }
  updateStatusBar();
  return true;
}

function getGuideLayer() {
  return editor.layers.find((layer) => layer.kind === "guide") ?? null;
}

function moveLayerInDisplayOrder(draggingLayerId, targetLayerId, dropBelow = false) {
  if (!draggingLayerId || !targetLayerId || draggingLayerId === targetLayerId) {
    return false;
  }

  const displayLayers = getDisplayLayers();
  const draggingLayer = displayLayers.find((layer) => layer.id === draggingLayerId);
  if (!draggingLayer) {
    return false;
  }

  const remaining = displayLayers.filter((layer) => layer.id !== draggingLayerId);
  const targetIndex = remaining.findIndex((layer) => layer.id === targetLayerId);
  if (targetIndex < 0) {
    return false;
  }

  const insertIndex = dropBelow ? targetIndex + 1 : targetIndex;
  remaining.splice(insertIndex, 0, draggingLayer);
  editor.layers = remaining.reverse();
  return true;
}

function updateLayerDropTargetFromPoint(clientX, clientY) {
  const pointTarget = document.elementFromPoint(clientX, clientY);
  if (!(pointTarget instanceof HTMLElement)) {
    if (editor.dropTargetLayerId !== null || editor.dropTargetBelow !== false) {
      editor.dropTargetLayerId = null;
      editor.dropTargetBelow = false;
      renderLayersPanel();
    }
    return;
  }

  const row = pointTarget.closest(".layer-row[data-layer-id]");
  if (!row) {
    if (editor.dropTargetLayerId !== null || editor.dropTargetBelow !== false) {
      editor.dropTargetLayerId = null;
      editor.dropTargetBelow = false;
      renderLayersPanel();
    }
    return;
  }

  const targetLayerId = row.getAttribute("data-layer-id");
  const targetLayer = getLayerById(targetLayerId);
  if (!targetLayerId || targetLayerId === editor.draggingLayerId || !targetLayer || targetLayer.kind !== "paint") {
    if (editor.dropTargetLayerId !== null || editor.dropTargetBelow !== false) {
      editor.dropTargetLayerId = null;
      editor.dropTargetBelow = false;
      renderLayersPanel();
    }
    return;
  }

  const rect = row.getBoundingClientRect();
  const dropBelow = clientY > rect.top + rect.height / 2;
  if (editor.dropTargetLayerId !== targetLayerId || editor.dropTargetBelow !== dropBelow) {
    editor.dropTargetLayerId = targetLayerId;
    editor.dropTargetBelow = dropBelow;
    renderLayersPanel();
  }
}

function resetLayerReorderState(options = {}) {
  const { render = true } = options;
  if (!editor.draggingLayerId && !editor.dropTargetLayerId && editor.layerReorderPointerId === null) {
    return;
  }

  editor.draggingLayerId = null;
  editor.dropTargetLayerId = null;
  editor.dropTargetBelow = false;
  editor.layerReorderPointerId = null;
  if (render) {
    renderLayersPanel();
  }
}

function createLayerId() {
  if (typeof crypto?.randomUUID === "function") {
    return `layer-${crypto.randomUUID()}`;
  }
  return `layer-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function nextPaintLayerName() {
  const count = getPaintLayers().length + 1;
  return `Layer ${count}`;
}

function nextPaintLayerFilePath() {
  const used = new Set(
    getPaintLayers()
      .map((layer) => String(layer.file ?? "").trim())
      .filter(Boolean)
  );

  let index = 1;
  while (true) {
    const file = index === 1 ? "layers/paint.png" : `layers/paint-${index}.png`;
    if (!used.has(file)) {
      return file;
    }
    index += 1;
  }
}

function addPaintLayer(options = {}) {
  const { name = nextPaintLayerName(), pixels = null, insertAfterLayerId = editor.activeLayerId } = options;
  const layerId = createLayerId();
  const layer = {
    id: layerId,
    name: String(name || nextPaintLayerName()),
    kind: "paint",
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    file: nextPaintLayerFilePath()
  };

  const insertAfterIndex = editor.layers.findIndex((entry) => entry.id === insertAfterLayerId);
  const insertIndex = insertAfterIndex >= 0 ? insertAfterIndex + 1 : editor.layers.length;
  editor.layers.splice(insertIndex, 0, layer);
  editor.paintLayerPixelsById[layerId] = normalizePaintPixels(pixels);
  editor.inlineRenameLayerId = "";
  editor.selectedLayerIds = new Set([layerId]);
  editor.layerPanelSelectionId = layerId;
  setActivePaintLayer(layerId, { announce: false, render: false });
  renderLayersPanel();
  renderPixelCanvas();
  setDirty(true);
  showToast(`${layer.name} added.`, 900);
  return layer;
}

function toggleLayerSelection(layerId) {
  if (!layerId || !getLayerById(layerId) || getLayerById(layerId)?.kind !== "paint") {
    return;
  }

  if (editor.selectedLayerIds.has(layerId)) {
    if (editor.selectedLayerIds.size === 1) {
      return;
    }
    editor.selectedLayerIds.delete(layerId);
  } else {
    editor.selectedLayerIds.add(layerId);
  }
  renderLayersPanel();
}

function renameLayer(layerId) {
  startInlineLayerRename(layerId);
}

function deleteLayerById(layerId, options = {}) {
  const { render = true, announce = true, markDirty = true } = options;
  const layer = getLayerById(layerId);
  if (!layer || layer.kind !== "paint") {
    return false;
  }

  const paintLayers = getPaintLayers();
  if (paintLayers.length <= 1) {
    showToast("At least one paint layer is required.");
    return false;
  }

  editor.layers = editor.layers.filter((entry) => entry.id !== layerId);
  delete editor.paintLayerPixelsById[layerId];
  editor.selectedLayerIds.delete(layerId);
  if (editor.boxSelectionLayerId === layerId) {
    clearBoxSelection({ render: false });
  }
  if (editor.inlineRenameLayerId === layerId) {
    editor.inlineRenameLayerId = "";
  }

  if (editor.activeLayerId === layerId) {
    const fallback = getPaintLayers().at(-1) ?? getPaintLayers()[0] ?? null;
    if (fallback) {
      setActivePaintLayer(fallback.id, { announce: false, render: false });
    }
  }

  if (editor.layerPanelSelectionId === layerId) {
    const fallbackPanelLayer = getLayerById(editor.activeLayerId) ?? getGuideLayer();
    editor.layerPanelSelectionId = fallbackPanelLayer?.id ?? "";
  }

  if (!editor.selectedLayerIds.size) {
    const active = getActivePaintLayer();
    if (active) {
      editor.selectedLayerIds.add(active.id);
    }
  }

  if (render) {
    renderLayersPanel();
    renderPixelCanvas();
  }
  if (markDirty) {
    setDirty(true);
  }
  if (announce) {
    showToast(`${layer.name} deleted.`, 900);
  }
  return true;
}

function deleteSelectedLayers() {
  const selectedPaint = getPaintLayers()
    .filter((layer) => editor.selectedLayerIds.has(layer.id))
    .map((layer) => layer.id);

  if (!selectedPaint.length) {
    const panelSelected = getLayerById(editor.layerPanelSelectionId);
    if (panelSelected?.kind === "guide") {
      showToast("Guide layer cannot be deleted.");
      return;
    }

    const fallbackTarget = panelSelected?.kind === "paint" ? panelSelected : getActivePaintLayer();
    if (fallbackTarget) {
      deleteLayerById(fallbackTarget.id);
    }
    return;
  }

  let deleted = 0;
  for (const layerId of selectedPaint) {
    if (getPaintLayers().length <= 1) {
      break;
    }
    if (deleteLayerById(layerId, { render: false, announce: false, markDirty: false })) {
      deleted += 1;
    }
  }

  if (!deleted) {
    showToast("No layers deleted.");
    return;
  }

  renderLayersPanel();
  renderPixelCanvas();
  setDirty(true);
  showToast(
    deleted === 1 ? "Deleted 1 layer." : `Deleted ${deleted} layers.`,
    1000
  );
}

function composePaintLayersToPixels(layers) {
  const sourceLayers = Array.isArray(layers) ? layers.filter((layer) => layer?.kind === "paint") : [];
  if (!editor.composeCanvas || !editor.composeCtx || !editor.composeLayerCanvas || !editor.composeLayerCtx || !editor.composeLayerImageData) {
    return new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  }

  const composeCtx = editor.composeCtx;
  const layerCtx = editor.composeLayerCtx;
  composeCtx.save();
  composeCtx.setTransform(1, 0, 0, 1, 0, 0);
  composeCtx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  composeCtx.globalCompositeOperation = "source-over";
  composeCtx.globalAlpha = 1;

  for (const layer of sourceLayers) {
    if (!layer.visible) {
      continue;
    }
    const pixels = getLayerPixels(layer.id);
    if (!pixels) {
      continue;
    }

    editor.composeLayerImageData.data.set(pixels);
    layerCtx.putImageData(editor.composeLayerImageData, 0, 0);
    composeCtx.globalCompositeOperation = normalizeBlendMode(layer.blendMode) === "multiply" ? "multiply" : "source-over";
    composeCtx.globalAlpha = clamp(Number(layer.opacity ?? 1), 0, 1);
    composeCtx.drawImage(editor.composeLayerCanvas, 0, 0);
  }

  composeCtx.restore();
  const result = composeCtx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE).data;
  return new Uint8ClampedArray(result);
}

function composeVisibleLayersToPixelsForViewport() {
  if (
    !editor.composeCanvas ||
    !editor.composeCtx ||
    !editor.composeLayerCanvas ||
    !editor.composeLayerCtx ||
    !editor.composeLayerImageData
  ) {
    return new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  }

  const composeCtx = editor.composeCtx;
  const layerCtx = editor.composeLayerCtx;
  composeCtx.save();
  composeCtx.setTransform(1, 0, 0, 1, 0, 0);
  composeCtx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  composeCtx.globalCompositeOperation = "source-over";
  composeCtx.globalAlpha = 1;

  for (const layer of editor.layers) {
    if (!layer?.visible) {
      continue;
    }

    const opacity = clamp(Number(layer.opacity ?? 1), 0, 1);
    if (opacity <= 0) {
      continue;
    }

    if (layer.kind === "guide") {
      if (!editor.guideImage) {
        continue;
      }
      composeCtx.globalCompositeOperation = "source-over";
      composeCtx.globalAlpha = opacity;
      composeCtx.drawImage(editor.guideImage, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
      continue;
    }

    const pixels = getLayerPixels(layer.id);
    if (!pixels) {
      continue;
    }
    editor.composeLayerImageData.data.set(pixels);
    layerCtx.putImageData(editor.composeLayerImageData, 0, 0);
    composeCtx.globalCompositeOperation =
      normalizeBlendMode(layer.blendMode) === "multiply" ? "multiply" : "source-over";
    composeCtx.globalAlpha = opacity;
    composeCtx.drawImage(editor.composeLayerCanvas, 0, 0);
  }

  composeCtx.restore();
  const result = composeCtx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE).data;
  return new Uint8ClampedArray(result);
}

function mergeSelectedLayers() {
  const orderedSelected = editor.layers.filter(
    (layer) => layer.kind === "paint" && editor.selectedLayerIds.has(layer.id)
  );
  if (orderedSelected.length < 2) {
    showToast("Select at least 2 paint layers to merge.");
    return false;
  }

  const bottomLayer = orderedSelected[0];
  const mergedPixels = composePaintLayersToPixels(orderedSelected);
  const mergedLayer = {
    ...bottomLayer,
    visible: true,
    opacity: 1,
    blendMode: "normal"
  };

  const removeIds = new Set(orderedSelected.map((layer) => layer.id));
  const nextLayers = [];
  let inserted = false;
  for (const layer of editor.layers) {
    if (layer.id === mergedLayer.id) {
      if (!inserted) {
        nextLayers.push(mergedLayer);
        inserted = true;
      }
      continue;
    }
    if (removeIds.has(layer.id)) {
      continue;
    }
    nextLayers.push(layer);
  }

  editor.layers = nextLayers;
  for (const layer of orderedSelected) {
    if (layer.id !== mergedLayer.id) {
      delete editor.paintLayerPixelsById[layer.id];
    }
  }
  editor.paintLayerPixelsById[mergedLayer.id] = mergedPixels;
  if (editor.inlineRenameLayerId && !getLayerById(editor.inlineRenameLayerId)) {
    editor.inlineRenameLayerId = "";
  }
  editor.selectedLayerIds = new Set([mergedLayer.id]);
  editor.layerPanelSelectionId = mergedLayer.id;
  setActivePaintLayer(mergedLayer.id, { announce: false, render: false });

  renderLayersPanel();
  renderPixelCanvas();
  setDirty(true);
  showToast(`Merged ${orderedSelected.length} layers.`, 1000);
  return true;
}

function wireGlobalButtons() {
  document.getElementById("goLibraryBtn")?.addEventListener("click", async () => {
    const shouldLeave = await maybeHandleUnsavedBeforeAction({
      title: "Close Project",
      message: "Save current changes before closing this project?",
      saveLabel: "Save and Close",
      discardLabel: "Close"
    });
    if (!shouldLeave) {
      return;
    }
    state.activeProject = null;
    setDirty(false);
    navigateToLibrary();
  });

  document.getElementById("saveProjectBtn")?.addEventListener("click", () => {
    void handleSaveProject();
  });

  document.getElementById("revertProjectBtn")?.addEventListener("click", async () => {
    if (!state.activeProject) {
      return;
    }
    if (!state.savedSnapshot) {
      const reloaded = await loadProjectById(state.activeProject.id);
      if (!reloaded) {
        showToast("Could not reload project.");
        return;
      }
      await hydrateEditorFromLoadedState(reloaded, { allowRecoveryPrompt: false });
    } else {
      await applyEditorSnapshot(state.savedSnapshot, { resetHistory: true });
      setDirty(false);
    }
    setDirty(false);
    showToast("Reverted to saved state.", 1200);
  });

  addLayerBtnEl?.addEventListener("click", () => {
    addPaintLayer();
  });

  mergeLayersBtnEl?.addEventListener("click", () => {
    mergeSelectedLayers();
  });

  deleteLayerBtnEl?.addEventListener("click", () => {
    deleteSelectedLayers();
  });

  historyUndoBtnEl?.addEventListener("click", () => {
    if (undoEditorHistory()) {
      showToast("Undo", 900);
    }
  });

  historyRedoBtnEl?.addEventListener("click", () => {
    if (redoEditorHistory()) {
      showToast("Redo", 900);
    }
  });
}

function wireFileMenu() {
  if (!fileMenuBtnEl || !fileMenuPopoverEl) {
    return;
  }

  fileMenuBtnEl.addEventListener("click", (event) => {
    event.preventDefault();
    const nextOpen = !isFileMenuOpen();
    setFileMenuOpen(nextOpen);
  });

  fileMenuPopoverEl.addEventListener("pointermove", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }
    const subpanelTrigger = target.closest("[data-file-subpanel]");
    if (subpanelTrigger) {
      const kind = String(subpanelTrigger.getAttribute("data-file-subpanel") ?? "").trim();
      if (!kind) {
        return;
      }
      setActiveFileSubpanel(kind, subpanelTrigger);
      return;
    }

    // If the cursor moves to a normal file-menu row (no side panel),
    // collapse any previously opened side panel and clear highlight state.
    const plainItem = target.closest(".file-menu-item");
    if (plainItem) {
      setActiveFileSubpanel("");
      return;
    }
  });

  fileMenuPopoverEl.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }
    const subpanelTrigger = target.closest("[data-file-subpanel]");
    if (subpanelTrigger) {
      const kind = String(subpanelTrigger.getAttribute("data-file-subpanel") ?? "").trim();
      if (kind) {
        setActiveFileSubpanel(kind, subpanelTrigger);
      }
      event.preventDefault();
      return;
    }

    const actionButton = target.closest("[data-file-action]");
    if (!actionButton || actionButton.classList.contains("is-disabled")) {
      return;
    }
    const action = String(actionButton.getAttribute("data-file-action") ?? "").trim();
    if (!action) {
      return;
    }
    const projectId = String(actionButton.getAttribute("data-project-id") ?? "").trim();
    setFileMenuOpen(false);
    void handleFileMenuAction(action, projectId);
  });

  fileMenuSubpanelListEl?.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }
    const actionButton = target.closest("[data-file-action]");
    if (!actionButton || actionButton.classList.contains("is-disabled")) {
      return;
    }
    const action = String(actionButton.getAttribute("data-file-action") ?? "").trim();
    if (!action) {
      return;
    }
    const projectId = String(actionButton.getAttribute("data-project-id") ?? "").trim();
    setFileMenuOpen(false);
    void handleFileMenuAction(action, projectId);
  });

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!isFileMenuOpen()) {
        return;
      }
      const target = getEventTargetElement(event);
      if (target && fileMenuEl?.contains(target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setFileMenuOpen(false);
    },
    true
  );

  window.addEventListener("blur", () => {
    if (!isFileMenuOpen()) {
      return;
    }
    setFileMenuOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isFileMenuOpen()) {
      return;
    }
    event.preventDefault();
    setFileMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (!isFileMenuOpen() || !state.fileMenuSubpanelKind) {
      return;
    }
    positionFileMenuSubpanelForKind(state.fileMenuSubpanelKind);
  });
}

function setFileMenuOpen(open) {
  if (!fileMenuPopoverEl || !fileMenuBtnEl) {
    return;
  }
  fileMenuPopoverEl.hidden = !open;
  fileMenuBtnEl.setAttribute("aria-expanded", open ? "true" : "false");
  if (!open) {
    setActiveFileSubpanel("");
    return;
  }
  void refreshRecentProjectsForFileMenu();
}

function isFileMenuOpen() {
  return Boolean(fileMenuPopoverEl && !fileMenuPopoverEl.hidden);
}

function setActiveFileSubpanel(kind, triggerEl = null) {
  const normalizedKind = String(kind ?? "").trim();
  state.fileMenuSubpanelKind = normalizedKind;
  document.querySelectorAll("[data-file-subpanel]").forEach((trigger) => {
    const triggerKind = String(trigger.getAttribute("data-file-subpanel") ?? "").trim();
    trigger.classList.toggle("is-active", normalizedKind.length > 0 && triggerKind === normalizedKind);
  });

  if (!fileMenuSubpanelEl || !fileMenuSubpanelTitleEl || !fileMenuSubpanelListEl) {
    return;
  }
  if (!normalizedKind) {
    fileMenuSubpanelEl.hidden = true;
    fileMenuSubpanelListEl.innerHTML = "";
    return;
  }

  const payload = buildFileMenuSubpanelPayload(normalizedKind);
  if (!payload) {
    fileMenuSubpanelEl.hidden = true;
    fileMenuSubpanelListEl.innerHTML = "";
    return;
  }

  fileMenuSubpanelTitleEl.textContent = payload.title;
  fileMenuSubpanelListEl.innerHTML = payload.itemsHtml;
  fileMenuSubpanelEl.hidden = false;
  positionFileMenuSubpanel(normalizedKind, triggerEl);
}

async function refreshRecentProjectsForFileMenu() {
  state.recentProjectCache = await listRecentProjects();
  if (state.fileMenuSubpanelKind === "recent") {
    setActiveFileSubpanel("recent");
  }
}

function positionFileMenuSubpanelForKind(kind) {
  const normalizedKind = String(kind ?? "").trim();
  if (!normalizedKind) {
    return;
  }
  const trigger = findFileSubpanelTrigger(normalizedKind);
  positionFileMenuSubpanel(normalizedKind, trigger);
}

function findFileSubpanelTrigger(kind) {
  const normalizedKind = String(kind ?? "").trim();
  if (!normalizedKind || !fileMenuPopoverEl) {
    return null;
  }
  const triggers = fileMenuPopoverEl.querySelectorAll("[data-file-subpanel]");
  for (const trigger of triggers) {
    const triggerKind = String(trigger.getAttribute("data-file-subpanel") ?? "").trim();
    if (triggerKind === normalizedKind) {
      return trigger;
    }
  }
  return null;
}

function positionFileMenuSubpanel(kind, triggerEl = null) {
  if (!fileMenuSubpanelEl || fileMenuSubpanelEl.hidden || !fileMenuPopoverEl || !fileMenuEl) {
    return;
  }

  const normalizedKind = String(kind ?? "").trim();
  if (!normalizedKind) {
    return;
  }

  const trigger = triggerEl instanceof HTMLElement ? triggerEl : findFileSubpanelTrigger(normalizedKind);
  if (!trigger) {
    return;
  }

  const menuRect = fileMenuEl.getBoundingClientRect();
  const popoverRect = fileMenuPopoverEl.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = fileMenuSubpanelEl.getBoundingClientRect();
  const panelWidth = panelRect.width || 228;
  const panelHeight = panelRect.height || 0;
  const gap = 6;
  const viewportPad = 8;

  let left = popoverRect.right - menuRect.left + gap;
  if (menuRect.left + left + panelWidth > window.innerWidth - viewportPad) {
    left = popoverRect.left - menuRect.left - panelWidth - gap;
  }

  let top = triggerRect.top - menuRect.top;
  if (panelHeight > 0) {
    const minTop = viewportPad - menuRect.top;
    const maxTop = window.innerHeight - viewportPad - panelHeight - menuRect.top;
    top = clamp(top, minTop, maxTop);
  }

  fileMenuSubpanelEl.style.left = `${Math.round(left)}px`;
  fileMenuSubpanelEl.style.top = `${Math.round(top)}px`;
}

function buildFileMenuSubpanelPayload(kind) {
  if (kind === "save-as") {
    return {
      title: "Save As",
      itemsHtml: `
        <button class="file-menu-item" type="button" data-file-action="save-project-as-qse">
          QueenSkin Project (.qse)
        </button>
      `
    };
  }

  if (kind === "export") {
    const disabled = !state.activeProject ? "is-disabled" : "";
    return {
      title: "Export",
      itemsHtml: `
        <button class="file-menu-item ${disabled}" type="button" data-file-action="export-project-png">
          Skin PNG (.png)
        </button>
        <button class="file-menu-item ${disabled}" type="button" data-file-action="export-project-obj">
          OBJ Model (.obj)
        </button>
      `
    };
  }

  if (kind !== "recent") {
    return null;
  }

  const activeId = String(state.activeProject?.id ?? "");
  const items = [...(Array.isArray(state.recentProjectCache) ? state.recentProjectCache : [])]
    .filter((entry) => String(entry?.id ?? "").trim().length > 0)
    .slice(0, 12);

  if (!items.length) {
    return {
      title: "Open Recent",
      itemsHtml:
        '<button class="file-menu-item is-disabled" type="button" aria-disabled="true">No recent projects</button>'
    };
  }

  return {
    title: "Open Recent",
    itemsHtml: items
      .map((project) => {
        const projectId = escapeHtml(project.id);
        const projectName = escapeHtml(project.name);
        const isCurrent = project.id === activeId;
        return `
          <button
            class="file-menu-item ${isCurrent ? "is-current" : ""}"
            type="button"
            data-file-action="open-recent"
            data-project-id="${projectId}"
            ${isCurrent ? 'aria-current="true"' : ""}
          >
            ${projectName}${isCurrent ? " (Current)" : ""}
          </button>
        `;
      })
      .join("")
  };
}

async function listRecentProjects() {
  if (hasTauriBackend) {
    try {
      const projects = await invokeBackend("list_internal_projects");
      if (Array.isArray(projects)) {
        return projects.map((entry) => normalizeProjectSummary(entry));
      }
    } catch (error) {
      console.error(error);
    }
  }
  return readFallbackProjects();
}

async function handleFileMenuAction(action, projectId = "") {
  if (action === "new-project") {
    await createProjectFromFileMenu();
    return;
  }
  if (action === "open-project") {
    await openProjectFromFileMenu();
    return;
  }
  if (action === "open-recent") {
    await openRecentProjectFromFileMenu(projectId);
    return;
  }
  if (action === "close-project") {
    await closeProjectFromFileMenu();
    return;
  }
  if (action === "save-project") {
    await handleSaveProject();
    return;
  }
  if (action === "save-project-as-qse") {
    await handleSaveProjectAs();
    return;
  }
  if (action === "export-project-png") {
    await handleExportProject("png");
    return;
  }
  if (action === "export-project-obj") {
    await handleExportProject("obj");
    return;
  }
  if (action === "project-settings") {
    await openProjectSettingsFromFileMenu();
    return;
  }
  if (action === "keybinds") {
    openKeybindModal();
  }
}

async function handleSaveProject() {
  if (!state.activeProject) {
    showToast("No active project.");
    return false;
  }
  const saved = await saveActiveProject({ reason: "manual", showToastOnSuccess: true });
  if (!saved) {
    showToast("Save failed.");
    return false;
  }
  void refreshRecentProjectsForFileMenu();
  return true;
}

async function handleSaveProjectAs() {
  if (!state.activeProject?.id) {
    showToast("No active project.");
    return;
  }
  if (!hasTauriBackend) {
    showToast("Save As requires the desktop app runtime.");
    return;
  }

  const synced = await saveActiveProject({ reason: "save-as", showToastOnSuccess: false });
  if (!synced) {
    showToast("Could not sync project before Save As.");
    return;
  }

  try {
    const picked = await invokeBackend("save_internal_project_as", {
      input: {
        id: state.activeProject.id,
        suggestedName: state.activeProject.name
      }
    });
    if (!picked) {
      return;
    }
    const fileName = String(picked).split(/[\\/]/).at(-1) || String(picked);
    showToast(`Saved copy as ${fileName}.`, 1400);
  } catch (error) {
    console.error(error);
    showToast("Could not Save As.");
  }
}

async function handleExportProject(format = "") {
  if (!state.activeProject) {
    showToast("No active project.");
    return;
  }
  if (!hasTauriBackend) {
    showToast("Export requires the desktop app runtime.");
    return;
  }

  try {
    const pixels = composePaintLayersToPixels(getPaintLayers());
    const preflightReport = await runExportPreflight(format, pixels);
    const hasIssues =
      Number(preflightReport?.warningCount ?? 0) > 0 || Number(preflightReport?.errorCount ?? 0) > 0;
    if (hasIssues) {
      const accepted = await requestPreflightModal(preflightReport, format);
      if (!accepted) {
        showToast("Export cancelled.");
        return;
      }
    }

    const exportedPath = await invokeBackend("export_project_asset", {
      input: {
        suggestedName: state.activeProject.name,
        armType: normalizeArmType(state.activeProject.armType),
        pixels: Array.from(pixels),
        format: String(format ?? "").trim().toLowerCase()
      }
    });
    if (!exportedPath) {
      return;
    }
    const fileName = String(exportedPath).split(/[\\/]/).at(-1) || String(exportedPath);
    showToast(`Exported ${fileName}.`, 1400);
  } catch (error) {
    console.error(error);
    showToast("Could not export project.");
  }
}

async function runExportPreflight(format, pixels) {
  const normalizedFormat = String(format ?? "").trim().toLowerCase() || "png";
  const armType = normalizeArmType(state.activeProject?.armType);

  if (hasTauriBackend) {
    try {
      const report = await invokeBackend("export_project_preflight", {
        input: {
          armType,
          format: normalizedFormat,
          pixels: Array.from(pixels ?? [])
        }
      });
      state.lastPreflight = report;
      updatePreflightStatus(report);
      return report;
    } catch (error) {
      console.error(error);
    }
  }

  const fallback = buildFallbackPreflightReport(pixels, normalizedFormat, armType);
  state.lastPreflight = fallback;
  updatePreflightStatus(fallback);
  return fallback;
}

function buildFallbackPreflightReport(rawPixels, format, armType) {
  const pixels = rawPixels instanceof Uint8Array || rawPixels instanceof Uint8ClampedArray ? rawPixels : [];
  const totalPixels = Math.floor((pixels.length || 0) / 4);
  let opaquePixels = 0;
  let transparentPixels = 0;
  let semiTransparentPixels = 0;
  let visiblePixels = 0;
  const uniqueColors = new Set();

  for (let index = 0; index < pixels.length; index += 4) {
    const r = clampByte(pixels[index]);
    const g = clampByte(pixels[index + 1]);
    const b = clampByte(pixels[index + 2]);
    const a = clampByte(pixels[index + 3]);
    const rgba = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
    uniqueColors.add(rgba);
    if (a === 0) {
      transparentPixels += 1;
    } else if (a === 255) {
      opaquePixels += 1;
      visiblePixels += 1;
    } else {
      semiTransparentPixels += 1;
      visiblePixels += 1;
    }
  }

  const issues = [];
  if (pixels.length !== TEXTURE_SIZE * TEXTURE_SIZE * 4) {
    issues.push({
      level: "error",
      code: "texture_size",
      message: "Texture payload is not 64x64 RGBA."
    });
  }
  if (visiblePixels === 0) {
    issues.push({
      level: "warning",
      code: "blank_export",
      message: "The skin is fully transparent."
    });
  }
  if (semiTransparentPixels > 0) {
    issues.push({
      level: "warning",
      code: "semi_alpha",
      message:
        "Semi-transparent pixels detected. This is valid for overlays but can look different across clients."
    });
  }
  if (transparentPixels > 0) {
    issues.push({
      level: "info",
      code: "transparent_pixels",
      message:
        "Transparent pixels detected. This is valid for overlay/unused zones; verify if this is intentional."
    });
  }
  if (format !== "obj" && pixels.length === TEXTURE_SIZE * TEXTURE_SIZE * 4) {
    const baseMask = buildFallbackJavaBaseOpacityMask(armType);
    let baseTransparentPixels = 0;
    let baseSemiTransparentPixels = 0;
    for (let pixelIndex = 0; pixelIndex < TEXTURE_SIZE * TEXTURE_SIZE; pixelIndex += 1) {
      if (!baseMask[pixelIndex]) {
        continue;
      }
      const alpha = clampByte(pixels[pixelIndex * 4 + 3]);
      if (alpha === 0) {
        baseTransparentPixels += 1;
      } else if (alpha < 255) {
        baseSemiTransparentPixels += 1;
      }
    }
    const baseNonOpaquePixels = baseTransparentPixels + baseSemiTransparentPixels;
    if (baseNonOpaquePixels > 0) {
      issues.push({
        level: "error",
        code: "java_base_alpha",
        message:
          `Java base skin zones must be fully opaque. Found ${baseNonOpaquePixels} non-opaque base pixel(s)` +
          ` (${baseTransparentPixels} transparent, ${baseSemiTransparentPixels} semi-transparent).`
      });
    }
  }
  if (format === "obj") {
    issues.push({
      level: "info",
      code: "obj_material",
      message: "OBJ export bakes to a single texture and material."
    });
  }

  const warningCount = issues.filter((issue) => String(issue.level) === "warning").length;
  const errorCount = issues.filter((issue) => String(issue.level) === "error").length;
  return {
    ok: errorCount === 0,
    warningCount,
    errorCount,
    issues,
    stats: {
      armType,
      format,
      totalPixels,
      opaquePixels,
      transparentPixels,
      semiTransparentPixels,
      visiblePixels,
      uniqueColorCount: uniqueColors.size
    }
  };
}

function buildFallbackJavaBaseOpacityMask(armType) {
  const normalizedArmType = normalizeArmType(armType);
  const mask = new Array(TEXTURE_SIZE * TEXTURE_SIZE).fill(false);
  const markRect = (xStart, yStart, xEnd, yEnd) => {
    const xs = clamp(Math.floor(xStart), 0, TEXTURE_SIZE - 1);
    const ys = clamp(Math.floor(yStart), 0, TEXTURE_SIZE - 1);
    const xe = clamp(Math.floor(xEnd), 0, TEXTURE_SIZE - 1);
    const ye = clamp(Math.floor(yEnd), 0, TEXTURE_SIZE - 1);
    for (let y = ys; y <= ye; y += 1) {
      for (let x = xs; x <= xe; x += 1) {
        mask[y * TEXTURE_SIZE + x] = true;
      }
    }
  };

  markRect(0, 0, 31, 15); // Head base
  markRect(16, 16, 39, 31); // Torso base
  markRect(0, 16, 15, 31); // Right leg base
  markRect(16, 48, 31, 63); // Left leg base

  if (normalizedArmType === "slim") {
    markRect(40, 16, 53, 31); // Right arm base (slim)
    markRect(32, 48, 45, 63); // Left arm base (slim)
  } else {
    markRect(40, 16, 55, 31); // Right arm base (classic)
    markRect(32, 48, 47, 63); // Left arm base (classic)
  }

  return mask;
}

function updatePreflightStatus(report) {
  const warningCount = Number(report?.warningCount ?? 0);
  const errorCount = Number(report?.errorCount ?? 0);
  if (errorCount > 0) {
    state.preflightStatus = `error ${errorCount}`;
  } else if (warningCount > 0) {
    state.preflightStatus = `warn ${warningCount}`;
  } else {
    state.preflightStatus = "ok";
  }
  updateStatusBar();
}

async function maybeHandleUnsavedBeforeAction(options = {}) {
  if (!state.dirty) {
    return true;
  }

  const {
    title = "Unsaved Changes",
    message = "Save current changes before continuing?",
    saveLabel = "Save and Continue",
    discardLabel = "Continue without Saving",
    cancelLabel = "Cancel"
  } = options;
  const decision = await requestUnsavedCloseModal({
    title,
    message,
    saveLabel,
    discardLabel,
    cancelLabel
  });
  if (decision === "cancel") {
    return false;
  }
  if (decision === "discard") {
    return true;
  }
  return handleSaveProject();
}

async function closeProjectFromFileMenu() {
  if (!state.activeProject) {
    navigateToLibrary();
    return;
  }
  const canClose = await maybeHandleUnsavedBeforeAction({
    title: "Close Project",
    message: "Save current changes before closing this project?",
    saveLabel: "Save and Close",
    discardLabel: "Close"
  });
  if (!canClose) {
    return;
  }

  state.activeProject = null;
  state.savedSnapshot = null;
  setDirty(false);
  navigateToLibrary();
}

async function createProjectFromFileMenu() {
  const canSwitch = await maybeHandleUnsavedBeforeAction({
    title: "New Project",
    message: "Save current changes before creating a new project?",
    saveLabel: "Save and Continue",
    discardLabel: "Continue without Saving"
  });
  if (!canSwitch) {
    return;
  }

  const details = await requestProjectConfigModal({
    title: "New Project",
    confirmLabel: "Create",
    initialName: "Untitled Project",
    initialArmType: normalizeArmType(state.activeProject?.armType),
    includeArmType: true
  });
  if (!details) {
    return;
  }

  const created = await createNewProjectFromEditor(details.name, details.armType);
  if (!created?.id) {
    showToast("Could not create project.");
    return;
  }

  const opened = await openProjectById(created.id, { allowRecoveryPrompt: false, announceOpened: false });
  if (!opened) {
    return;
  }
  showToast(`Created ${created.name}.`, 1400);
}

async function openProjectFromFileMenu() {
  const canSwitch = await maybeHandleUnsavedBeforeAction({
    title: "Open Project",
    message: "Save current changes before opening another project?",
    saveLabel: "Save and Continue",
    discardLabel: "Continue without Saving"
  });
  if (!canSwitch) {
    return;
  }

  if (!hasTauriBackend) {
    showToast("Open Project requires the desktop app runtime.");
    return;
  }

  try {
    const pickedPath = await invokeBackend("pick_project_file");
    if (!pickedPath) {
      return;
    }

    const imported = await invokeBackend("import_external_project", { path: pickedPath });
    if (!imported?.id) {
      showToast("Selected file could not be opened.");
      return;
    }

    await openProjectById(imported.id, { allowRecoveryPrompt: true, announceOpened: true });
  } catch (error) {
    console.error(error);
    showToast("Could not open selected file.");
  }
}

async function openRecentProjectFromFileMenu(projectId) {
  const targetId = String(projectId ?? "").trim();
  if (!targetId) {
    return;
  }
  if (state.activeProject?.id === targetId) {
    showToast("Project already open.", 900);
    return;
  }

  const canSwitch = await maybeHandleUnsavedBeforeAction({
    title: "Open Recent",
    message: "Save current changes before opening another project?",
    saveLabel: "Save and Continue",
    discardLabel: "Continue without Saving"
  });
  if (!canSwitch) {
    return;
  }

  await openProjectById(targetId, { allowRecoveryPrompt: true, announceOpened: true });
}

async function openProjectById(projectId, options = {}) {
  const { allowRecoveryPrompt = true, announceOpened = true } = options;
  const targetId = String(projectId ?? "").trim();
  if (!targetId) {
    return false;
  }

  const loaded = await loadProjectById(targetId);
  if (!loaded) {
    showToast("Project could not be loaded.");
    return false;
  }

  await hydrateEditorFromLoadedState(loaded, { allowRecoveryPrompt });
  resetViewportPose({ resetZoom: true });
  setActiveTool("pencil", { announce: false });
  queueEditorCanvasFitAndRender();
  startAutosaveTimer();

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("projectId", targetId);
  window.history.replaceState({}, "", nextUrl);

  void refreshRecentProjectsForFileMenu();
  if (announceOpened) {
    showToast(`Opened ${state.activeProject?.name ?? "project"}.`);
  }
  return true;
}

async function createNewProjectFromEditor(rawName, rawArmType) {
  const name = String(rawName ?? "").trim() || "Untitled Project";
  const armType = normalizeArmType(rawArmType);

  if (hasTauriBackend) {
    try {
      const created = await invokeBackend("create_internal_project", {
        input: {
          name,
          armType
        }
      });
      return normalizeProjectSummary(created);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const fallbackProject = normalizeProjectSummary({
    id: crypto.randomUUID(),
    name,
    updatedAt: Date.now(),
    armType,
    layerCount: 2
  });
  const snapshot = createDefaultProjectState({ name, armType });
  writeFallbackProjectState(fallbackProject.id, snapshot);
  clearFallbackAutosaveState(fallbackProject.id);

  const projects = readFallbackProjects().filter((entry) => entry.id !== fallbackProject.id);
  projects.unshift(fallbackProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 24)));
  return fallbackProject;
}

async function openProjectSettingsFromFileMenu() {
  if (!state.activeProject) {
    showToast("No active project.");
    return;
  }

  const details = await requestProjectConfigModal({
    title: "Project Settings",
    confirmLabel: "Apply",
    initialName: state.activeProject.name,
    initialArmType: normalizeArmType(state.activeProject.armType),
    includeArmType: true
  });
  if (!details) {
    return;
  }

  const nextName = details.name || "Untitled Project";
  const nextArmType = normalizeArmType(details.armType);
  const currentName = state.activeProject.name;
  const currentArmType = normalizeArmType(state.activeProject.armType);
  const nameChanged = nextName !== currentName;
  const armTypeChanged = nextArmType !== currentArmType;

  if (!nameChanged && !armTypeChanged) {
    showToast("No project setting changes.");
    return;
  }

  if (armTypeChanged) {
    const accepted = await requestConfirmModal({
      title: "Change Skin Type",
      message:
        "Changing skin type can misalign existing painted regions. Continue and switch skin type?",
      confirmLabel: "Accept",
      cancelLabel: "Cancel",
      confirmTone: "danger"
    });
    if (!accepted) {
      return;
    }
  }

  if (nameChanged) {
    const renamed = await renameActiveProject(nextName);
    if (!renamed) {
      return;
    }
  }

  if (armTypeChanged) {
    state.activeProject.armType = nextArmType;
    await syncGuideTemplateForProject(nextArmType, false);
    await ensureViewportModelForArmType(nextArmType);
    resetViewportPose({ resetZoom: true });
    setDirty(true);
    queueViewportRender();
  }

  void refreshRecentProjectsForFileMenu();
  showToast("Project settings updated.", 1300);
}

function wireEditorInteractions() {
  hexInputEl?.addEventListener("change", () => {
    syncColorFromHexInput();
  });

  hexInputEl?.addEventListener("input", () => {
    syncColorFromHexInput(false);
  });

  document.querySelectorAll(".tool").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTool(button.dataset.tool);
    });
  });

  layerOpacityRangeEl?.addEventListener("input", () => {
    const layer = ensureLayerPanelSelection();
    if (!layer) {
      return;
    }

    const nextOpacity = clamp(Number(layerOpacityRangeEl.value ?? 100) / 100, 0, 1);
    if (nextOpacity === layer.opacity) {
      return;
    }

    layer.opacity = nextOpacity;
    updateLayerSharedControls(layer);
    renderPixelCanvas();
    queueViewportRender();
    setDirty(true);
  });

  layerBlendSelectEl?.addEventListener("change", () => {
    const layer = ensureLayerPanelSelection();
    if (!layer) {
      return;
    }

    const nextBlend = normalizeBlendMode(layerBlendSelectEl.value);
    if (nextBlend === layer.blendMode) {
      return;
    }

    layer.blendMode = nextBlend;
    updateLayerSharedControls(layer);
    renderPixelCanvas();
    queueViewportRender();
    setDirty(true);
  });

  layersListEl?.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }

    const button = target.closest("button[data-layer-action]");
    if (button) {
      const action = button.getAttribute("data-layer-action");
      const layerId = button.getAttribute("data-layer-id");
      const layer = getLayerById(layerId);
      if (!layer) {
        return;
      }

      if (action === "toggle-layer-visible") {
        layer.visible = !layer.visible;
        renderLayersPanel();
        renderPixelCanvas();
        queueViewportRender();
        setDirty(true);
        showToast(layer.visible ? `${layer.name} visible.` : `${layer.name} hidden.`, 900);
        return;
      }
      return;
    }

    const title = target.closest(".layer-title[data-layer-id]");
    if (title) {
      const layerId = title.getAttribute("data-layer-id");
      const layer = getLayerById(layerId);
      if (!layer) {
        return;
      }
      if (layer.kind !== "paint") {
        selectLayerFromUi(layer.id, { append: event.shiftKey === true });
        return;
      }
      const now = typeof performance?.now === "function" ? performance.now() : Date.now();
      const isSecondClick =
        !event.shiftKey &&
        editor.lastLayerTitleClickLayerId === layer.id &&
        now - editor.lastLayerTitleClickAtMs <= 360;
      if (isSecondClick) {
        editor.lastLayerTitleClickLayerId = "";
        editor.lastLayerTitleClickAtMs = 0;
        event.preventDefault();
        startInlineLayerRename(layer.id);
        return;
      }

      editor.lastLayerTitleClickLayerId = layer.id;
      editor.lastLayerTitleClickAtMs = now;
      selectLayerFromUi(layer.id, { append: event.shiftKey === true });
      return;
    }

    const row = target.closest(".layer-row[data-layer-id]");
    if (!row) {
      return;
    }
    if (target.closest("input,select,textarea")) {
      return;
    }

    const layerId = row.getAttribute("data-layer-id");
    const layer = getLayerById(layerId);
    if (!layer) {
      return;
    }
    editor.lastLayerTitleClickLayerId = "";
    editor.lastLayerTitleClickAtMs = 0;
    selectLayerFromUi(layer.id, { append: event.shiftKey === true });
  });

  layersListEl?.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("layer-name-inline-input")) {
      return;
    }

    const layerId = target.getAttribute("data-layer-id");
    if (!layerId) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      commitInlineLayerRename(layerId, target.value);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelInlineLayerRename();
    }
  });

  layersListEl?.addEventListener("focusout", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("layer-name-inline-input")) {
      return;
    }
    const layerId = target.getAttribute("data-layer-id");
    if (!layerId) {
      return;
    }
    window.setTimeout(() => {
      if (editor.inlineRenameLayerId === layerId) {
        commitInlineLayerRename(layerId, target.value, { announce: false });
      }
    }, 0);
  });

  layersListEl?.addEventListener("input", (event) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute("data-layer-action");
    const layerId = target.getAttribute("data-layer-id");
    if (!action || !layerId) {
      return;
    }

    const layer = getLayerById(layerId);
    if (!layer) {
      return;
    }

      if (action === "set-layer-opacity") {
      const nextOpacity = clamp(Number(target.value ?? 100) / 100, 0, 1);
      if (nextOpacity === layer.opacity) {
        return;
      }
      layer.opacity = nextOpacity;
      const valueLabel = target
        .closest(".layer-opacity")
        ?.querySelector(".layer-opacity-value");
        if (valueLabel) {
          valueLabel.textContent = `${Math.round(nextOpacity * 100)}%`;
        }
        renderPixelCanvas();
        queueViewportRender();
        setDirty(true);
        return;
      }

    if (layer.kind !== "paint") {
      return;
    }

      if (action === "set-layer-blend") {
      const nextBlend = normalizeBlendMode(target.value);
      if (nextBlend === layer.blendMode) {
        return;
        }
        layer.blendMode = nextBlend;
        renderPixelCanvas();
        queueViewportRender();
        setDirty(true);
      }
  });

  layersListEl?.addEventListener("pointerdown", (event) => {
    const target = getEventTargetElement(event);
    if (!target) {
      return;
    }

    const dragHandle = target.closest(".layer-drag-handle[data-layer-id]");
    if (!dragHandle || event.button !== 0) {
      return;
    }

    const layerId = dragHandle.getAttribute("data-layer-id");
    const layer = getLayerById(layerId);
    if (!layerId || !layer || layer.kind !== "paint") {
      return;
    }

    event.preventDefault();
    clearPendingLayerTitleClick();
    editor.inlineRenameLayerId = "";
    editor.draggingLayerId = layerId;
    editor.dropTargetLayerId = null;
    editor.dropTargetBelow = false;
    editor.layerReorderPointerId = event.pointerId;
    renderLayersPanel();
  });

  window.addEventListener("pointermove", (event) => {
    if (!editor.draggingLayerId) {
      return;
    }
    if (editor.layerReorderPointerId !== null && event.pointerId !== editor.layerReorderPointerId) {
      return;
    }
    updateLayerDropTargetFromPoint(event.clientX, event.clientY);
  });

  const endLayerReorder = (event) => {
    if (!editor.draggingLayerId) {
      return;
    }
    if (editor.layerReorderPointerId !== null && event?.pointerId !== editor.layerReorderPointerId) {
      return;
    }

    const draggingLayerId = editor.draggingLayerId;
    const targetLayerId = editor.dropTargetLayerId;
    const dropBelow = editor.dropTargetBelow;
    resetLayerReorderState({ render: false });

    let moved = false;
    if (draggingLayerId && targetLayerId) {
      moved = moveLayerInDisplayOrder(draggingLayerId, targetLayerId, dropBelow);
    }

    renderLayersPanel();
    if (moved) {
      renderPixelCanvas();
      queueViewportRender();
      setDirty(true);
      showToast("Layer order updated.", 900);
    }
  };

  window.addEventListener("pointerup", endLayerReorder);
  window.addEventListener("pointercancel", endLayerReorder);
  window.addEventListener("blur", () => {
    if (!editor.draggingLayerId) {
      return;
    }
    resetLayerReorderState();
  });

  redRangeEl?.addEventListener("input", onRgbStripInput);
  greenRangeEl?.addEventListener("input", onRgbStripInput);
  blueRangeEl?.addEventListener("input", onRgbStripInput);
  alphaRangeEl?.addEventListener("input", onRgbStripInput);
  brushSizeRangeEl?.addEventListener("input", () => {
    const next = Number.parseInt(brushSizeRangeEl.value, 10);
    setBrushSize(next, { announce: false });
  });
  gridToggleBtnEl?.addEventListener("click", () => {
    editor.showCanvasGrid = !editor.showCanvasGrid;
    updateGridToggleUi();
    renderPixelCanvas();
  });

  wireColorPickerCanvases();

  updateBrushSizeUi();
  updateGridToggleUi();
  updateCanvasHud();
  updateColorControls();
}

function wireKeyboard() {
  window.addEventListener("keydown", (event) => {
    if (handleKeybindCaptureKeydown(event)) {
      return;
    }

    if (eventMatchesActionBinding(event, "commandPalette")) {
      if (isAnyModalOpen() && (!keybindModalEl || keybindModalEl.hidden)) {
        return;
      }
      event.preventDefault();
      if (keybindModalEl && !keybindModalEl.hidden) {
        closeKeybindModal();
      } else {
        openKeybindModal();
      }
      return;
    }

    if (isAnyModalOpen()) {
      return;
    }
    if (isFileMenuOpen()) {
      return;
    }

    const cmdOrCtrl = event.metaKey || event.ctrlKey;
    if (eventMatchesActionBinding(event, "saveProject")) {
      event.preventDefault();
      void handleSaveProject();
      return;
    }
    if (eventMatchesActionBinding(event, "saveProjectAs")) {
      event.preventDefault();
      void handleSaveProjectAs();
      return;
    }
    if (eventMatchesActionBinding(event, "exportPng")) {
      event.preventDefault();
      void handleExportProject("png");
      return;
    }
    if (eventMatchesActionBinding(event, "exportObj")) {
      event.preventDefault();
      void handleExportProject("obj");
      return;
    }
    if (eventMatchesActionBinding(event, "newProject")) {
      event.preventDefault();
      void createProjectFromFileMenu();
      return;
    }
    if (eventMatchesActionBinding(event, "openProject")) {
      event.preventDefault();
      void openProjectFromFileMenu();
      return;
    }
    if (eventMatchesActionBinding(event, "closeProject")) {
      event.preventDefault();
      void closeProjectFromFileMenu();
      return;
    }
    if (eventMatchesActionBinding(event, "projectSettings")) {
      event.preventDefault();
      void openProjectSettingsFromFileMenu();
      return;
    }
    if (eventMatchesActionBinding(event, "openThemes")) {
      event.preventDefault();
      openThemeBrowserModal();
      return;
    }

    if (state.view !== "editor") {
      return;
    }

    if (event.code === "Space" && document.activeElement === lightingModeEl) {
      event.preventDefault();
      lightingModeEl.blur();
      if (!editor.spacePanActive) {
        editor.spacePanActive = true;
        updateToolUI();
      }
      return;
    }

    if (event.code === "Space" && !isEditingText(event.target)) {
      event.preventDefault();
      if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === "SELECT") {
        document.activeElement.blur();
      }
      if (!editor.spacePanActive) {
        editor.spacePanActive = true;
        updateToolUI();
      }
      return;
    }

    if (eventMatchesActionBinding(event, "undo")) {
      event.preventDefault();
      const didChange = undoEditorHistory();
      if (didChange) {
        showToast("Undo", 900);
      }
      return;
    }

    if (eventMatchesActionBinding(event, "redo")) {
      event.preventDefault();
      const didChange = redoEditorHistory();
      if (didChange) {
        showToast("Redo", 900);
      }
      return;
    }

    if (eventMatchesActionBinding(event, "mergeLayers")) {
      event.preventDefault();
      mergeSelectedLayers();
      return;
    }

    if (event.key === "Alt") {
      if (!editor.altEyedropperActive) {
        editor.altEyedropperActive = true;
        updateToolUI();
      }
      return;
    }

    if (isEditingText(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (cmdOrCtrl && key === "c") {
      event.preventDefault();
      copySelectionToClipboard();
      return;
    }

    if (cmdOrCtrl && key === "x") {
      event.preventDefault();
      cutSelectionToClipboard();
      return;
    }

    if (cmdOrCtrl && key === "v") {
      event.preventDefault();
      pasteClipboardIntoActiveLayer();
      return;
    }

    if (eventMatchesActionBinding(event, "deselectSelection")) {
      event.preventDefault();
      if (clearBoxSelection()) {
        showToast("Selection cleared.", 900);
      }
      return;
    }

    if (eventMatchesActionBinding(event, "toolPencil")) {
      event.preventDefault();
      setActiveTool("pencil", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "toolEraser")) {
      event.preventDefault();
      setActiveTool("eraser", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "toolFill")) {
      event.preventDefault();
      if (isToolBlockedInViewport("fill")) {
        maybeShowViewportToolBlockToast();
        return;
      }
      setActiveTool("fill", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "toolSelect")) {
      event.preventDefault();
      if (isToolBlockedInViewport("select")) {
        maybeShowViewportToolBlockToast();
        return;
      }
      setActiveTool("select", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "toolEyedropper")) {
      event.preventDefault();
      setActiveTool("eyedropper", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "toolZoom")) {
      event.preventDefault();
      setActiveTool("zoom", { announce: false });
      return;
    }

    if (eventMatchesActionBinding(event, "newLayer")) {
      event.preventDefault();
      addPaintLayer();
      return;
    }

    if (eventMatchesActionBinding(event, "toggleCanvasGrid")) {
      event.preventDefault();
      editor.showCanvasGrid = !editor.showCanvasGrid;
      updateGridToggleUi();
      renderPixelCanvas();
      return;
    }

    if (eventMatchesActionBinding(event, "toggleViewportGrid")) {
      event.preventDefault();
      editor.viewportShowGrid = !editor.viewportShowGrid;
      updateViewportGridToggleUi();
      queueViewportRender();
      return;
    }

    if (eventMatchesActionBinding(event, "brushSizeDown")) {
      event.preventDefault();
      adjustBrushSize(-1);
      return;
    }

    if (eventMatchesActionBinding(event, "brushSizeUp")) {
      event.preventDefault();
      adjustBrushSize(1);
      return;
    }

    if (eventMatchesActionBinding(event, "brushOpacityDown")) {
      event.preventDefault();
      adjustBrushAlpha(-0.1);
      return;
    }

    if (eventMatchesActionBinding(event, "brushOpacityUp")) {
      event.preventDefault();
      adjustBrushAlpha(0.1);
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      adjustEditorZoom(-1);
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      adjustEditorZoom(1);
      return;
    }

    if (eventMatchesActionBinding(event, "deleteLayerOrSelection")) {
      event.preventDefault();
      if (getEffectiveTool() === "select" && deleteSelectedPixelsInSelection()) {
        return;
      }
      deleteSelectedLayers();
      return;
    }

    if (event.key === "Backspace" && state.keybinds.deleteLayerOrSelection === KEYBIND_DEFAULTS.deleteLayerOrSelection) {
      event.preventDefault();
      if (getEffectiveTool() === "select" && deleteSelectedPixelsInSelection()) {
        return;
      }
      deleteSelectedLayers();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "Alt" && editor.altEyedropperActive) {
      editor.altEyedropperActive = false;
      updateToolUI();
      return;
    }

    if (event.code === "Space" && editor.spacePanActive) {
      editor.spacePanActive = false;
      updateToolUI();
    }
  });
}

function setActiveTool(tool, options = {}) {
  if (!tool) {
    return;
  }

  const { announce = true } = options;
  if (isToolBlockedInViewport(tool)) {
    if (editor.currentTool === "fill" || editor.currentTool === "select") {
      editor.currentTool = "pencil";
    }
    updateToolUI();
    if (announce) {
      showToast("Fill and Box Select are 2D-only tools.");
    }
    return;
  }

  editor.currentTool = tool;
  updateToolUI();
  updateBrushSizeUi();
  updateStatusBar();

  if (announce) {
    const label = TOOL_LABELS[tool] ?? tool;
    showToast(`Tool: ${label}`, 900);
  }
}

function updateToolUI() {
  const activeTool = getEffectiveTool();
  document.querySelectorAll(".tool").forEach((button) => {
    const toolId = button.dataset.tool ?? "";
    button.classList.toggle("is-active", toolId === activeTool);
    if (toolId === "zoom") {
      button.classList.toggle("is-zoom-out", editor.currentTool === "zoom" && editor.altEyedropperActive);
    }
  });
  updateViewportToolAvailability();
  updateCanvasCursor();
  updateViewportCursor();
  updateBrushSizeUi();
}

function getEffectiveTool() {
  if (editor.isPanning || editor.spacePanActive) {
    return "grab";
  }
  if (editor.altEyedropperActive && editor.currentTool !== "zoom") {
    return "eyedropper";
  }
  return editor.currentTool;
}

function adjustBrushSize(delta) {
  setBrushSize(editor.brushSize + delta);
}

function setBrushSize(nextSize, options = {}) {
  const { announce = true } = options;
  const next = clamp(Number(nextSize), 1, 8);
  if (next === editor.brushSize) {
    updateBrushSizeUi();
    return;
  }
  editor.brushSize = next;
  updateBrushSizeUi();
  updateCanvasHud();
  updateStatusBar();
  renderPixelCanvas();
  if (announce) {
    showToast(`${getBrushSizeLabelPrefix()} size: ${editor.brushSize}px`, 900);
  }
}

function getBrushSizeLabelPrefix() {
  return editor.currentTool === "eraser" ? "Eraser" : "Brush";
}

function updateBrushSizeUi() {
  if (brushSizeRangeEl) {
    brushSizeRangeEl.value = String(editor.brushSize);
  }
  if (brushSizeLabelEl) {
    brushSizeLabelEl.textContent = `${getBrushSizeLabelPrefix()} ${editor.brushSize}px`;
  }
}

function updateGridToggleUi() {
  if (!gridToggleBtnEl) {
    return;
  }
  gridToggleBtnEl.setAttribute("aria-pressed", editor.showCanvasGrid ? "true" : "false");
  gridToggleBtnEl.textContent = editor.showCanvasGrid ? "Grid: On" : "Grid: Off";
}

function wireLayoutSplitters() {
  centerSplitEl?.addEventListener("pointerdown", (event) => {
    if (!centerStageEl || !viewportPanelEl || !centerSplitEl || window.matchMedia("(max-width: 1360px)").matches) {
      return;
    }
    beginResizeDrag({
      type: "center",
      pointerId: event.pointerId,
      splitterEl: centerSplitEl
    });
    centerSplitEl.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  rightSplitTopEl?.addEventListener("pointerdown", (event) => {
    if (
      !rightStackEl ||
      !colorPanelEl ||
      !partsPanelEl ||
      !layersPanelEl ||
      !rightSplitTopEl ||
      window.matchMedia("(max-width: 1080px)").matches
    ) {
      return;
    }
    beginResizeDrag({
      type: "rightTop",
      pointerId: event.pointerId,
      splitterEl: rightSplitTopEl
    });
    rightSplitTopEl.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  rightSplitBottomEl?.addEventListener("pointerdown", (event) => {
    if (
      !rightStackEl ||
      !colorPanelEl ||
      !partsPanelEl ||
      !layersPanelEl ||
      !rightSplitBottomEl ||
      window.matchMedia("(max-width: 1080px)").matches
    ) {
      return;
    }
    beginResizeDrag({
      type: "rightBottom",
      pointerId: event.pointerId,
      splitterEl: rightSplitBottomEl
    });
    rightSplitBottomEl.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  window.addEventListener("pointermove", onResizePointerMove);
  window.addEventListener("pointerup", endResizeDrag);
  window.addEventListener("pointercancel", endResizeDrag);
  applySplitLayout();
}

function beginResizeDrag(payload) {
  state.activeResize = payload;
  payload.splitterEl.classList.add("is-dragging");
  document.body.classList.add("is-resizing");
  document.body.style.cursor = payload.type === "center" ? "ew-resize" : "ns-resize";
}

function endResizeDrag(event) {
  if (!state.activeResize) {
    return;
  }

  if (event?.pointerId && state.activeResize.pointerId !== event.pointerId) {
    return;
  }

  state.activeResize.splitterEl?.classList.remove("is-dragging");
  state.activeResize = null;
  document.body.classList.remove("is-resizing");
  document.body.style.cursor = "";
}

function onResizePointerMove(event) {
  if (!state.activeResize) {
    return;
  }
  if (state.activeResize.pointerId !== event.pointerId) {
    return;
  }

  if (state.activeResize.type === "center") {
    resizeCenterSplit(event.clientX);
  } else if (state.activeResize.type === "rightTop") {
    resizeRightTopSplit(event.clientY);
  } else if (state.activeResize.type === "rightBottom") {
    resizeRightBottomSplit(event.clientY);
  }

  applySplitLayout();
  renderPixelCanvas();
  event.preventDefault();
}

function resizeCenterSplit(clientX) {
  if (!centerStageEl || !centerSplitEl) {
    return;
  }
  const rect = centerStageEl.getBoundingClientRect();
  const splitWidth = centerSplitEl.getBoundingClientRect().width || 10;
  const total = rect.width - splitWidth;
  if (total <= 0) {
    return;
  }

  const minLeft = 220;
  const minRight = 260;
  const left = clamp(clientX - rect.left - splitWidth / 2, minLeft, total - minRight);
  editor.centerSplitRatio = clamp(left / total, 0.2, 0.8);
}

function resizeRightTopSplit(clientY) {
  if (!rightStackEl || !rightSplitTopEl) {
    return;
  }

  const metrics = getRightStackMetrics();
  if (!metrics) {
    return;
  }

  const { rect, availableHeight, topHeight, middleHeight, bottomHeight } = metrics;
  const minHeight = 120;
  const proposedTop = clamp(
    clientY - rect.top - rightSplitTopEl.getBoundingClientRect().height / 2,
    minHeight,
    availableHeight - bottomHeight - minHeight
  );
  const nextMiddle = availableHeight - proposedTop - bottomHeight;
  if (nextMiddle < minHeight) {
    return;
  }

  editor.rightTopRatio = proposedTop / availableHeight;
  editor.rightMiddleRatio = nextMiddle / availableHeight;
}

function resizeRightBottomSplit(clientY) {
  if (!rightStackEl || !rightSplitBottomEl) {
    return;
  }

  const metrics = getRightStackMetrics();
  if (!metrics) {
    return;
  }

  const { rect, availableHeight, topHeight } = metrics;
  const minHeight = 120;
  const offsetY = clamp(clientY - rect.top, minHeight * 2, availableHeight - minHeight);
  const proposedBottom = clamp(availableHeight - offsetY, minHeight, availableHeight - topHeight - minHeight);
  const nextMiddle = availableHeight - topHeight - proposedBottom;
  if (nextMiddle < minHeight) {
    return;
  }

  editor.rightTopRatio = topHeight / availableHeight;
  editor.rightMiddleRatio = nextMiddle / availableHeight;
}

function getRightStackMetrics() {
  if (!rightStackEl || !rightSplitTopEl || !rightSplitBottomEl) {
    return null;
  }
  const rect = rightStackEl.getBoundingClientRect();
  const splitTopHeight = rightSplitTopEl.getBoundingClientRect().height || 10;
  const splitBottomHeight = rightSplitBottomEl.getBoundingClientRect().height || 10;
  const availableHeight = rect.height - splitTopHeight - splitBottomHeight;
  if (availableHeight <= 0) {
    return null;
  }

  const topHeight = availableHeight * editor.rightTopRatio;
  const middleHeight = availableHeight * editor.rightMiddleRatio;
  const bottomHeight = availableHeight - topHeight - middleHeight;

  return {
    rect,
    availableHeight,
    topHeight,
    middleHeight,
    bottomHeight
  };
}

function applySplitLayout() {
  applyCenterSplitLayout();
  applyRightSplitLayout();
}

function applyCenterSplitLayout() {
  if (!centerStageEl || !viewportPanelEl || !centerSplitEl) {
    return;
  }

  if (window.matchMedia("(max-width: 1360px)").matches) {
    viewportPanelEl.style.flexBasis = "";
    return;
  }

  const rect = centerStageEl.getBoundingClientRect();
  const splitWidth = centerSplitEl.getBoundingClientRect().width || 10;
  const total = rect.width - splitWidth;
  if (total <= 0) {
    return;
  }

  const minLeft = 220;
  const minRight = 260;
  const leftPx = clamp(Math.round(total * editor.centerSplitRatio), minLeft, total - minRight);
  viewportPanelEl.style.flexBasis = `${leftPx}px`;
}

function applyRightSplitLayout() {
  if (!rightStackEl || !colorPanelEl || !partsPanelEl || !layersPanelEl || !rightSplitTopEl || !rightSplitBottomEl) {
    return;
  }

  if (window.matchMedia("(max-width: 1080px)").matches) {
    colorPanelEl.style.flex = "";
    partsPanelEl.style.flex = "";
    layersPanelEl.style.flex = "";
    return;
  }

  const rect = rightStackEl.getBoundingClientRect();
  const splitTopHeight = rightSplitTopEl.getBoundingClientRect().height || 10;
  const splitBottomHeight = rightSplitBottomEl.getBoundingClientRect().height || 10;
  const available = rect.height - splitTopHeight - splitBottomHeight;
  if (available <= 0) {
    return;
  }

  const minHeight = 120;
  let top = clamp(Math.round(available * editor.rightTopRatio), minHeight, available - minHeight * 2);
  let middle = clamp(Math.round(available * editor.rightMiddleRatio), minHeight, available - top - minHeight);
  let bottom = available - top - middle;

  if (bottom < minHeight) {
    const deficit = minHeight - bottom;
    middle = Math.max(minHeight, middle - deficit);
    bottom = available - top - middle;
  }
  if (middle < minHeight) {
    const deficit = minHeight - middle;
    top = Math.max(minHeight, top - deficit);
    middle = available - top - bottom;
  }

  colorPanelEl.style.flex = `0 0 ${top}px`;
  partsPanelEl.style.flex = `0 0 ${middle}px`;
  layersPanelEl.style.flex = `0 0 ${bottom}px`;

  editor.rightTopRatio = top / available;
  editor.rightMiddleRatio = middle / available;
}

function autoFitColorPanelHeightOnStartup() {
  if (editor.startupColorPaneFitted) {
    return false;
  }
  if (
    !rightStackEl ||
    !colorPanelEl ||
    !rightSplitTopEl ||
    !rightSplitBottomEl ||
    !hexPreviewEl ||
    window.matchMedia("(max-width: 1080px)").matches
  ) {
    return false;
  }

  const stackRect = rightStackEl.getBoundingClientRect();
  const splitTopHeight = rightSplitTopEl.getBoundingClientRect().height || 10;
  const splitBottomHeight = rightSplitBottomEl.getBoundingClientRect().height || 10;
  const available = stackRect.height - splitTopHeight - splitBottomHeight;
  if (available <= 0) {
    return false;
  }

  const minHeight = 120;
  const maxTop = available - minHeight * 2;
  if (maxTop <= minHeight) {
    return false;
  }

  const panelRect = colorPanelEl.getBoundingClientRect();
  const previewRect = hexPreviewEl.getBoundingClientRect();
  if (panelRect.height <= 0 || previewRect.height <= 0) {
    return false;
  }

  const requiredTop = Math.ceil(previewRect.bottom - panelRect.top + 14);
  const currentTop = available * editor.rightTopRatio;
  const targetTop = clamp(Math.max(currentTop, requiredTop), minHeight, maxTop);
  if (Math.abs(targetTop - currentTop) < 1) {
    editor.startupColorPaneFitted = true;
    return false;
  }

  const currentMiddle = available * editor.rightMiddleRatio;
  const targetMiddle = clamp(currentMiddle, minHeight, available - targetTop - minHeight);
  editor.rightTopRatio = targetTop / available;
  editor.rightMiddleRatio = targetMiddle / available;
  editor.startupColorPaneFitted = true;
  return true;
}

function adjustBrushAlpha(delta) {
  const current = editor.brushColor[3] / 255;
  const nextRatio = clamp(Number((current + delta).toFixed(2)), 0, 1);
  const nextAlpha = clampByte(Math.round(nextRatio * 255));
  if (nextAlpha === editor.brushColor[3]) {
    return;
  }
  setBrushColorFromRgba(editor.brushColor[0], editor.brushColor[1], editor.brushColor[2], nextAlpha, {
    writeHex: true
  });
  showToast(`Brush alpha: ${Math.round((nextAlpha / 255) * 100)}%`, 900);
}

function adjustEditorZoom(delta, announce = true, focusPoint = null) {
  const currentZoom = editor.zoom;
  const next = clamp(currentZoom + delta, MIN_CANVAS_ZOOM, MAX_CANVAS_ZOOM);
  if (next === currentZoom) {
    return false;
  }

  if (focusPoint && pixelCanvasEl) {
    const canvasRect = pixelCanvasEl.getBoundingClientRect();
    if (canvasRect.width > 0 && canvasRect.height > 0) {
      const currentDrawSize = canvasRect.width;
      const currentPixelSize = currentDrawSize / TEXTURE_SIZE;
      const textureX = clamp((focusPoint.x - canvasRect.left) / currentPixelSize, 0, TEXTURE_SIZE);
      const textureY = clamp((focusPoint.y - canvasRect.top) / currentPixelSize, 0, TEXTURE_SIZE);
      const nextDrawSize = next * TEXTURE_SIZE;

      // Derive the centered base position from the real rendered rect so
      // zoom anchoring remains exact even with stage padding/borders.
      const currentBaseLeft = canvasRect.left - editor.panX;
      const currentBaseTop = canvasRect.top - editor.panY;
      const nextBaseLeft = currentBaseLeft + (currentDrawSize - nextDrawSize) / 2;
      const nextBaseTop = currentBaseTop + (currentDrawSize - nextDrawSize) / 2;

      const desiredLeft = focusPoint.x - textureX * next;
      const desiredTop = focusPoint.y - textureY * next;
      editor.panX = desiredLeft - nextBaseLeft;
      editor.panY = desiredTop - nextBaseTop;
    }
  }

  editor.zoom = next;
  renderPixelCanvas();
  if (announce) {
    showToast(`Canvas zoom: ${editor.zoom}x`, 900);
  }
  return true;
}

function syncColorFromHexInput(commitNormalized = true) {
  const normalized = normalizeHex(hexInputEl?.value ?? DEFAULT_HEX);
  if (commitNormalized) {
    hexInputEl.value = normalized;
  }
  const [r, g, b, a] = parseHexRgba(normalized);
  setBrushColorFromRgba(r, g, b, a, { writeHex: commitNormalized });
}

function setBrushColorFromRgba(r, g, b, a, options = {}) {
  const { writeHex = true } = options;
  const next = [clampByte(r), clampByte(g), clampByte(b), clampByte(a)];
  editor.brushColor = next;

  const [h, s, v] = rgbToHsv(next[0], next[1], next[2]);
  editor.colorHue = h;
  editor.colorSat = s;
  editor.colorVal = v;

  if (writeHex && hexInputEl) {
    hexInputEl.value = formatHexRgba(next[0], next[1], next[2], next[3]);
  }
  updateColorControls();
}

function onRgbStripInput() {
  const r = Number.parseInt(redRangeEl?.value ?? "0", 10);
  const g = Number.parseInt(greenRangeEl?.value ?? "0", 10);
  const b = Number.parseInt(blueRangeEl?.value ?? "0", 10);
  const alpha = Number.parseInt(alphaRangeEl?.value ?? `${editor.brushColor[3]}`, 10);
  setBrushColorFromRgba(r, g, b, alpha, { writeHex: true });
}

function wireColorPickerCanvases() {
  const beginDrag = (mode, event) => {
    editor.colorPickerDragMode = mode;
    editor.colorPickerPointerId = event.pointerId;
    if (event.target?.setPointerCapture) {
      event.target.setPointerCapture(event.pointerId);
    }
    applyColorPickerFromEvent(mode, event);
    event.preventDefault();
  };

  const moveDrag = (event) => {
    if (editor.colorPickerPointerId !== event.pointerId || !editor.colorPickerDragMode) {
      return;
    }
    applyColorPickerFromEvent(editor.colorPickerDragMode, event);
    event.preventDefault();
  };

  const endDrag = (event) => {
    if (editor.colorPickerPointerId !== event.pointerId) {
      return;
    }
    editor.colorPickerPointerId = null;
    editor.colorPickerDragMode = null;
  };

  svCanvasEl?.addEventListener("pointerdown", (event) => beginDrag("sv", event));
  svCanvasEl?.addEventListener("pointermove", moveDrag);
  svCanvasEl?.addEventListener("pointerup", endDrag);
  svCanvasEl?.addEventListener("pointercancel", endDrag);

  hueCanvasEl?.addEventListener("pointerdown", (event) => beginDrag("hue", event));
  hueCanvasEl?.addEventListener("pointermove", moveDrag);
  hueCanvasEl?.addEventListener("pointerup", endDrag);
  hueCanvasEl?.addEventListener("pointercancel", endDrag);
}

function applyColorPickerFromEvent(mode, event) {
  if (mode === "hue" && hueCanvasEl) {
    const rect = hueCanvasEl.getBoundingClientRect();
    if (rect.height <= 0) {
      return;
    }
    const localY = clamp(event.clientY - rect.top, 0, rect.height);
    editor.colorHue = clamp((localY / rect.height) * 360, 0, 360);
    applyCurrentHsvToBrush();
    return;
  }

  if (mode === "sv" && svCanvasEl) {
    const rect = svCanvasEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const localX = clamp(event.clientX - rect.left, 0, rect.width);
    const localY = clamp(event.clientY - rect.top, 0, rect.height);
    editor.colorSat = clamp(localX / rect.width, 0, 1);
    editor.colorVal = clamp(1 - localY / rect.height, 0, 1);
    applyCurrentHsvToBrush();
  }
}

function applyCurrentHsvToBrush() {
  const [r, g, b] = hsvToRgb(editor.colorHue, editor.colorSat, editor.colorVal);
  const alpha = editor.brushColor[3];
  setBrushColorFromRgba(r, g, b, alpha, { writeHex: true });
}

function updateColorControls() {
  if (redRangeEl) {
    redRangeEl.value = String(editor.brushColor[0]);
  }
  if (greenRangeEl) {
    greenRangeEl.value = String(editor.brushColor[1]);
  }
  if (blueRangeEl) {
    blueRangeEl.value = String(editor.brushColor[2]);
  }
  if (alphaRangeEl) {
    alphaRangeEl.value = String(editor.brushColor[3]);
  }
  if (redValueEl) {
    redValueEl.textContent = String(editor.brushColor[0]);
  }
  if (greenValueEl) {
    greenValueEl.textContent = String(editor.brushColor[1]);
  }
  if (blueValueEl) {
    blueValueEl.textContent = String(editor.brushColor[2]);
  }
  if (alphaValueEl) {
    alphaValueEl.textContent = String(editor.brushColor[3]);
  }
  if (hexPreviewEl) {
    const [r, g, b, a] = editor.brushColor;
    hexPreviewEl.style.setProperty("--preview-color", `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(4)})`);
  }
  drawHueCanvas();
  drawSvCanvas();
}

function drawHueCanvas() {
  if (!hueCanvasEl) {
    return;
  }
  const ctx = hueCanvasEl.getContext("2d");
  if (!ctx) {
    return;
  }

  const { width, height } = hueCanvasEl;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(1 / 6, "#ffff00");
  gradient.addColorStop(2 / 6, "#00ff00");
  gradient.addColorStop(3 / 6, "#00ffff");
  gradient.addColorStop(4 / 6, "#0000ff");
  gradient.addColorStop(5 / 6, "#ff00ff");
  gradient.addColorStop(1, "#ff0000");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const markerY = clamp((editor.colorHue / 360) * height, 0, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, markerY + 0.5);
  ctx.lineTo(width, markerY + 0.5);
  ctx.stroke();
}

function drawSvCanvas() {
  if (!svCanvasEl) {
    return;
  }
  const ctx = svCanvasEl.getContext("2d");
  if (!ctx) {
    return;
  }

  const { width, height } = svCanvasEl;
  const [hueR, hueG, hueB] = hsvToRgb(editor.colorHue, 1, 1);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = `rgb(${hueR}, ${hueG}, ${hueB})`;
  ctx.fillRect(0, 0, width, height);

  const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
  whiteGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  whiteGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, width, height);

  const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
  blackGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  blackGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, width, height);

  const markerX = clamp(editor.colorSat * width, 0, width);
  const markerY = clamp((1 - editor.colorVal) * height, 0, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(markerX, markerY, 7.5, 0, Math.PI * 2);
  ctx.stroke();
}

function onCanvasPointerDown(event) {
  if (state.view !== "editor") {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  const tool = getEffectiveTool();
  if (tool === "grab") {
    startCanvasPan(event);
    event.preventDefault();
    return;
  }

  const point = eventToPixel(event);
  if (!point) {
    return;
  }
  editor.hoverPoint = point;

  if (tool === "eyedropper") {
    samplePixelToColor(point.x, point.y);
    renderPixelCanvas();
    return;
  }

  if (tool === "zoom") {
    adjustEditorZoom(event.altKey ? -1 : 1, true, { x: event.clientX, y: event.clientY });
    return;
  }

  if (tool === "fill") {
    runFillAtPoint(point);
    renderPixelCanvas();
    event.preventDefault();
    return;
  }

  if (tool === "select") {
    beginBoxSelectionInteraction(point, event);
    event.preventDefault();
    return;
  }

  if (!isPaintTool(tool)) {
    maybeShowUnsupportedToolToast(tool);
    return;
  }

  const activeLayer = getActivePaintLayer();
  if (!activeLayer) {
    showToast("No active paint layer.");
    return;
  }
  if (activeLayer.locked) {
    showToast("Active layer is locked.");
    return;
  }

  ensureLayerPixels(activeLayer.id);
  editor.pixels = editor.paintLayerPixelsById[activeLayer.id];

  editor.isPointerDown = true;
  editor.pointerId = event.pointerId;
  editor.lastPoint = point;
  editor.pendingStrokeLayerId = activeLayer.id;
  editor.pendingStrokeBefore = new Uint8ClampedArray(editor.pixels);
  editor.strokeBasePixels = editor.pendingStrokeBefore;
  editor.strokeVisited = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE);
  editor.strokeChanged = false;

  pixelCanvasEl.setPointerCapture(event.pointerId);
  applyStrokeBetween(point, point, tool);
  renderPixelCanvas();

  event.preventDefault();
}

function onCanvasPointerMove(event) {
  if (editor.selectionDrag) {
    if (editor.selectionDrag.pointerId !== event.pointerId) {
      return;
    }
    const point = eventToPixel(event);
    if (!point) {
      return;
    }
    editor.hoverPoint = point;
    updateBoxSelectionDrag(point);
    renderPixelCanvas();
    event.preventDefault();
    return;
  }

  if (editor.isPanning) {
    if (event.pointerId !== editor.panPointerId) {
      return;
    }

    editor.panX = editor.panStartX + (event.clientX - editor.panStartClientX);
    editor.panY = editor.panStartY + (event.clientY - editor.panStartClientY);
    applyCanvasTransform();
    event.preventDefault();
    return;
  }

  const point = eventToPixel(event);
  if (!point) {
    return;
  }
  editor.hoverPoint = point;

  if (!editor.isPointerDown || editor.pointerId !== event.pointerId) {
    renderPixelCanvas();
    return;
  }

  const tool = getEffectiveTool();
  if (tool === "zoom") {
    renderPixelCanvas();
    return;
  }

  applyStrokeBetween(editor.lastPoint, point, tool);
  editor.lastPoint = point;
  renderPixelCanvas();
  event.preventDefault();
}

function onCanvasPointerUp(event) {
  if (editor.selectionDrag && editor.selectionDrag.pointerId === event.pointerId) {
    const point = eventToPixel(event);
    editor.hoverPoint = point;
    finishBoxSelectionInteraction(point);
    try {
      pixelCanvasEl.releasePointerCapture(event.pointerId);
    } catch {
      // no-op if capture is already released
    }
    renderPixelCanvas();
    return;
  }

  if (editor.isPanning && editor.panPointerId === event.pointerId) {
    finishCanvasPan();
    try {
      pixelCanvasEl.releasePointerCapture(event.pointerId);
    } catch {
      // no-op if capture is already released
    }
    renderPixelCanvas();
    return;
  }

  if (!editor.isPointerDown || editor.pointerId !== event.pointerId) {
    return;
  }

  finishActiveStroke();
  try {
    pixelCanvasEl.releasePointerCapture(event.pointerId);
  } catch {
    // no-op if capture is already released
  }

  const point = eventToPixel(event);
  editor.hoverPoint = point;
  renderPixelCanvas();
}

function finishActiveStroke() {
  editor.isPointerDown = false;
  editor.pointerId = null;
  editor.lastPoint = null;

  if (!editor.pendingStrokeBefore || !editor.pendingStrokeLayerId) {
    editor.pendingStrokeLayerId = null;
    return;
  }

  if (editor.strokeChanged) {
    const after = new Uint8ClampedArray(editor.pixels);
    pushHistoryEntry({
      layerId: editor.pendingStrokeLayerId,
      before: editor.pendingStrokeBefore,
      after,
      action: getEffectiveTool() === "eraser" ? "Erase Stroke" : "Paint Stroke"
    });
    setDirty(true);
  }

  editor.pendingStrokeLayerId = null;
  editor.pendingStrokeBefore = null;
  editor.strokeChanged = false;
  editor.strokeVisited = null;
  editor.strokeBasePixels = null;
}

function startCanvasPan(event) {
  editor.isPanning = true;
  editor.panPointerId = event.pointerId;
  editor.panStartClientX = event.clientX;
  editor.panStartClientY = event.clientY;
  editor.panStartX = editor.panX;
  editor.panStartY = editor.panY;
  editor.hoverPoint = null;
  pixelCanvasEl.setPointerCapture(event.pointerId);
  updateCanvasCursor();
  renderPixelCanvas();
}

function finishCanvasPan() {
  editor.isPanning = false;
  editor.panPointerId = null;
  editor.panStartClientX = 0;
  editor.panStartClientY = 0;
  editor.panStartX = editor.panX;
  editor.panStartY = editor.panY;
  updateCanvasCursor();
}

function hasActiveBoxSelection(layerId = editor.activeLayerId) {
  return Boolean(
    editor.boxSelection &&
      editor.boxSelectionLayerId &&
      editor.boxSelectionLayerId === layerId &&
      editor.boxSelection.width > 0 &&
      editor.boxSelection.height > 0
  );
}

function getSelectionConstraintRectForLayer(layerId = editor.activeLayerId) {
  if (!hasActiveBoxSelection(layerId)) {
    return null;
  }
  return editor.boxSelection;
}

function clearBoxSelection(options = {}) {
  const { render = true } = options;
  if (!editor.boxSelection && !editor.selectionDrag && !editor.boxSelectionLayerId) {
    return false;
  }
  editor.boxSelection = null;
  editor.boxSelectionLayerId = "";
  editor.selectionDrag = null;
  if (render) {
    renderPixelCanvas();
  }
  return true;
}

function normalizeRectFromPoints(startPoint, endPoint) {
  if (!startPoint || !endPoint) {
    return null;
  }
  const minX = clamp(Math.min(startPoint.x, endPoint.x), 0, TEXTURE_SIZE - 1);
  const minY = clamp(Math.min(startPoint.y, endPoint.y), 0, TEXTURE_SIZE - 1);
  const maxX = clamp(Math.max(startPoint.x, endPoint.x), 0, TEXTURE_SIZE - 1);
  const maxY = clamp(Math.max(startPoint.y, endPoint.y), 0, TEXTURE_SIZE - 1);
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function offsetRectWithinBounds(sourceRect, deltaX, deltaY) {
  const width = clamp(Math.floor(sourceRect.width), 1, TEXTURE_SIZE);
  const height = clamp(Math.floor(sourceRect.height), 1, TEXTURE_SIZE);
  const nextX = clamp(Math.floor(sourceRect.x + deltaX), 0, TEXTURE_SIZE - width);
  const nextY = clamp(Math.floor(sourceRect.y + deltaY), 0, TEXTURE_SIZE - height);
  return { x: nextX, y: nextY, width, height };
}

function isPointInsideRect(point, rect) {
  if (!point || !rect) {
    return false;
  }
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x < rect.x + rect.width &&
    point.y < rect.y + rect.height
  );
}

function isCoordinateInsideRect(x, y, rect) {
  if (!rect) {
    return true;
  }
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

function extractRectPixels(layerPixels, rect) {
  const width = clamp(Math.floor(rect?.width ?? 0), 0, TEXTURE_SIZE);
  const height = clamp(Math.floor(rect?.height ?? 0), 0, TEXTURE_SIZE);
  const output = new Uint8ClampedArray(width * height * 4);
  if (!width || !height || !layerPixels) {
    return output;
  }

  for (let y = 0; y < height; y += 1) {
    const srcY = rect.y + y;
    if (srcY < 0 || srcY >= TEXTURE_SIZE) {
      continue;
    }
    for (let x = 0; x < width; x += 1) {
      const srcX = rect.x + x;
      if (srcX < 0 || srcX >= TEXTURE_SIZE) {
        continue;
      }
      const srcIndex = (srcY * TEXTURE_SIZE + srcX) * 4;
      const dstIndex = (y * width + x) * 4;
      output[dstIndex] = layerPixels[srcIndex];
      output[dstIndex + 1] = layerPixels[srcIndex + 1];
      output[dstIndex + 2] = layerPixels[srcIndex + 2];
      output[dstIndex + 3] = layerPixels[srcIndex + 3];
    }
  }
  return output;
}

function clearRectPixels(layerPixels, rect) {
  if (!layerPixels || !rect) {
    return false;
  }
  let changed = false;
  for (let y = 0; y < rect.height; y += 1) {
    const py = rect.y + y;
    if (py < 0 || py >= TEXTURE_SIZE) {
      continue;
    }
    for (let x = 0; x < rect.width; x += 1) {
      const px = rect.x + x;
      if (px < 0 || px >= TEXTURE_SIZE) {
        continue;
      }
      const index = (py * TEXTURE_SIZE + px) * 4;
      if (layerPixels[index] || layerPixels[index + 1] || layerPixels[index + 2] || layerPixels[index + 3]) {
        layerPixels[index] = 0;
        layerPixels[index + 1] = 0;
        layerPixels[index + 2] = 0;
        layerPixels[index + 3] = 0;
        changed = true;
      }
    }
  }
  return changed;
}

function blitRectPixels(layerPixels, sourcePixels, sourceWidth, sourceHeight, destX, destY) {
  if (!layerPixels || !sourcePixels || sourceWidth <= 0 || sourceHeight <= 0) {
    return false;
  }
  let changed = false;
  for (let y = 0; y < sourceHeight; y += 1) {
    const py = destY + y;
    if (py < 0 || py >= TEXTURE_SIZE) {
      continue;
    }
    for (let x = 0; x < sourceWidth; x += 1) {
      const px = destX + x;
      if (px < 0 || px >= TEXTURE_SIZE) {
        continue;
      }
      const srcIndex = (y * sourceWidth + x) * 4;
      const dstIndex = (py * TEXTURE_SIZE + px) * 4;
      const sr = sourcePixels[srcIndex];
      const sg = sourcePixels[srcIndex + 1];
      const sb = sourcePixels[srcIndex + 2];
      const sa = sourcePixels[srcIndex + 3];
      if (
        layerPixels[dstIndex] !== sr ||
        layerPixels[dstIndex + 1] !== sg ||
        layerPixels[dstIndex + 2] !== sb ||
        layerPixels[dstIndex + 3] !== sa
      ) {
        layerPixels[dstIndex] = sr;
        layerPixels[dstIndex + 1] = sg;
        layerPixels[dstIndex + 2] = sb;
        layerPixels[dstIndex + 3] = sa;
        changed = true;
      }
    }
  }
  return changed;
}

function pixelsEqual(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

function withLayerHistoryMutation(layerId, mutateFn, options = {}) {
  const { action = "Layer Edit" } = options;
  const layer = getLayerById(layerId);
  if (!layer || layer.kind !== "paint") {
    return false;
  }
  const layerPixels = ensureLayerPixels(layer.id);
  const before = new Uint8ClampedArray(layerPixels);
  const changed = Boolean(mutateFn(layerPixels, before));
  if (!changed) {
    layerPixels.set(before);
    if (editor.activeLayerId === layer.id) {
      editor.pixels = layerPixels;
      syncTextureCanvas();
    }
    return false;
  }
  const after = new Uint8ClampedArray(layerPixels);
  if (pixelsEqual(before, after)) {
    layerPixels.set(before);
    if (editor.activeLayerId === layer.id) {
      editor.pixels = layerPixels;
      syncTextureCanvas();
    }
    return false;
  }

  pushHistoryEntry({ layerId: layer.id, before, after, action });
  if (editor.activeLayerId === layer.id) {
    editor.pixels = layerPixels;
    syncTextureCanvas();
  }
  setDirty(true);
  return true;
}

function runFillAtPoint(point) {
  const activeLayer = getActivePaintLayer();
  if (!activeLayer) {
    showToast("No active paint layer.");
    return false;
  }
  if (activeLayer.locked) {
    showToast("Active layer is locked.");
    return false;
  }

  const selectionRect = getSelectionConstraintRectForLayer(activeLayer.id);
  if (selectionRect && !isCoordinateInsideRect(point.x, point.y, selectionRect)) {
    return false;
  }

  const didChange = withLayerHistoryMutation(activeLayer.id, (layerPixels, beforePixels) =>
    floodFillLayerPixels(layerPixels, beforePixels, point.x, point.y, selectionRect)
  , { action: "Fill" });
  return didChange;
}

function floodFillLayerPixels(layerPixels, sourcePixels, startX, startY, selectionRect = null) {
  if (!layerPixels || !sourcePixels) {
    return false;
  }

  if (selectionRect && !isCoordinateInsideRect(startX, startY, selectionRect)) {
    return false;
  }

  const startOffset = startY * TEXTURE_SIZE + startX;
  const startIndex = startOffset * 4;
  const targetR = sourcePixels[startIndex];
  const targetG = sourcePixels[startIndex + 1];
  const targetB = sourcePixels[startIndex + 2];
  const targetA = sourcePixels[startIndex + 3];

  const [fillR, fillG, fillB, fillA] = blendPencilOverBase(
    targetR,
    targetG,
    targetB,
    targetA,
    editor.brushColor[0],
    editor.brushColor[1],
    editor.brushColor[2],
    editor.brushColor[3]
  );
  if (fillR === targetR && fillG === targetG && fillB === targetB && fillA === targetA) {
    return false;
  }

  const stack = [startOffset];
  const visited = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE);
  let changed = false;

  while (stack.length > 0) {
    const offset = stack.pop();
    if (offset === undefined || visited[offset]) {
      continue;
    }
    visited[offset] = 1;

    const x = offset % TEXTURE_SIZE;
    const y = Math.floor(offset / TEXTURE_SIZE);
    if (selectionRect && !isCoordinateInsideRect(x, y, selectionRect)) {
      continue;
    }

    const index = offset * 4;
    if (
      sourcePixels[index] !== targetR ||
      sourcePixels[index + 1] !== targetG ||
      sourcePixels[index + 2] !== targetB ||
      sourcePixels[index + 3] !== targetA
    ) {
      continue;
    }

    const [nextR, nextG, nextB, nextA] = blendPencilOverBase(
      sourcePixels[index],
      sourcePixels[index + 1],
      sourcePixels[index + 2],
      sourcePixels[index + 3],
      editor.brushColor[0],
      editor.brushColor[1],
      editor.brushColor[2],
      editor.brushColor[3]
    );

    if (
      layerPixels[index] !== nextR ||
      layerPixels[index + 1] !== nextG ||
      layerPixels[index + 2] !== nextB ||
      layerPixels[index + 3] !== nextA
    ) {
      layerPixels[index] = nextR;
      layerPixels[index + 1] = nextG;
      layerPixels[index + 2] = nextB;
      layerPixels[index + 3] = nextA;
      changed = true;
    }

    if (x > 0) {
      stack.push(offset - 1);
    }
    if (x < TEXTURE_SIZE - 1) {
      stack.push(offset + 1);
    }
    if (y > 0) {
      stack.push(offset - TEXTURE_SIZE);
    }
    if (y < TEXTURE_SIZE - 1) {
      stack.push(offset + TEXTURE_SIZE);
    }
  }

  return changed;
}

function beginBoxSelectionInteraction(point, event) {
  const activeLayer = getActivePaintLayer();
  if (!activeLayer) {
    showToast("No active paint layer.");
    return;
  }

  const canMoveSelection =
    hasActiveBoxSelection(activeLayer.id) &&
    isPointInsideRect(point, editor.boxSelection) &&
    !activeLayer.locked;

  if (canMoveSelection) {
    const sourceRect = { ...editor.boxSelection };
    const layerPixels = ensureLayerPixels(activeLayer.id);
    editor.selectionDrag = {
      mode: "move",
      pointerId: event.pointerId,
      layerId: activeLayer.id,
      startPoint: { ...point },
      sourceRect,
      previewRect: { ...sourceRect },
      sourcePixels: extractRectPixels(layerPixels, sourceRect),
      beforePixels: new Uint8ClampedArray(layerPixels)
    };
  } else {
    if (hasActiveBoxSelection(activeLayer.id) && isPointInsideRect(point, editor.boxSelection) && activeLayer.locked) {
      showToast("Active layer is locked.");
      return;
    }
    editor.selectionDrag = {
      mode: "marquee",
      pointerId: event.pointerId,
      layerId: activeLayer.id,
      startPoint: { ...point },
      currentPoint: { ...point }
    };
  }

  try {
    pixelCanvasEl?.setPointerCapture(event.pointerId);
  } catch {
    // no-op
  }
}

function updateBoxSelectionDrag(point) {
  const drag = editor.selectionDrag;
  if (!drag) {
    return;
  }

  if (drag.mode === "marquee") {
    drag.currentPoint = { ...point };
    return;
  }

  if (drag.mode !== "move") {
    return;
  }

  const layer = getLayerById(drag.layerId);
  if (!layer || layer.kind !== "paint") {
    return;
  }

  const deltaX = point.x - drag.startPoint.x;
  const deltaY = point.y - drag.startPoint.y;
  const previewRect = offsetRectWithinBounds(drag.sourceRect, deltaX, deltaY);
  const sameRect =
    drag.previewRect &&
    drag.previewRect.x === previewRect.x &&
    drag.previewRect.y === previewRect.y &&
    drag.previewRect.width === previewRect.width &&
    drag.previewRect.height === previewRect.height;
  if (sameRect) {
    return;
  }

  const layerPixels = ensureLayerPixels(layer.id);
  layerPixels.set(drag.beforePixels);
  clearRectPixels(layerPixels, drag.sourceRect);
  blitRectPixels(
    layerPixels,
    drag.sourcePixels,
    drag.sourceRect.width,
    drag.sourceRect.height,
    previewRect.x,
    previewRect.y
  );
  drag.previewRect = previewRect;

  if (editor.activeLayerId === layer.id) {
    editor.pixels = layerPixels;
    syncTextureCanvas();
  }
}

function finishBoxSelectionInteraction(point) {
  const drag = editor.selectionDrag;
  if (!drag) {
    return;
  }
  editor.selectionDrag = null;

  if (drag.mode === "marquee") {
    const endPoint = point ?? drag.currentPoint ?? drag.startPoint;
    const rect = normalizeRectFromPoints(drag.startPoint, endPoint);
    if (!rect) {
      return;
    }
    editor.boxSelection = rect;
    editor.boxSelectionLayerId = drag.layerId;
    return;
  }

  if (drag.mode !== "move") {
    return;
  }

  const layer = getLayerById(drag.layerId);
  if (!layer || layer.kind !== "paint") {
    return;
  }

  const layerPixels = ensureLayerPixels(layer.id);
  const after = new Uint8ClampedArray(layerPixels);
  const changed = !pixelsEqual(drag.beforePixels, after);
  if (changed) {
    pushHistoryEntry({
      layerId: layer.id,
      before: drag.beforePixels,
      after,
      action: "Move Selection"
    });
    setDirty(true);
  } else {
    layerPixels.set(drag.beforePixels);
    if (editor.activeLayerId === layer.id) {
      editor.pixels = layerPixels;
      syncTextureCanvas();
    }
  }

  editor.boxSelection = { ...(drag.previewRect ?? drag.sourceRect) };
  editor.boxSelectionLayerId = layer.id;
}

function copySelectionToClipboard(options = {}) {
  const { announce = true } = options;
  if (!editor.boxSelection || !editor.boxSelectionLayerId) {
    if (announce) {
      showToast("No selection to copy.", 900);
    }
    return false;
  }

  const layer = getLayerById(editor.boxSelectionLayerId);
  if (!layer || layer.kind !== "paint") {
    if (announce) {
      showToast("Selection layer is unavailable.");
    }
    return false;
  }

  const rect = { ...editor.boxSelection };
  const layerPixels = ensureLayerPixels(layer.id);
  editor.selectionClipboard = {
    width: rect.width,
    height: rect.height,
    pixels: extractRectPixels(layerPixels, rect)
  };
  if (announce) {
    showToast(`Copied ${rect.width}×${rect.height}.`, 900);
  }
  return true;
}

function cutSelectionToClipboard() {
  if (!editor.boxSelection || !editor.boxSelectionLayerId) {
    showToast("No selection to cut.", 900);
    return false;
  }

  const layer = getLayerById(editor.boxSelectionLayerId);
  if (!layer || layer.kind !== "paint") {
    showToast("Selection layer is unavailable.");
    return false;
  }
  if (layer.locked) {
    showToast("Active layer is locked.");
    return false;
  }

  copySelectionToClipboard({ announce: false });
  const rect = { ...editor.boxSelection };
  const didChange = withLayerHistoryMutation(
    layer.id,
    (layerPixels) => clearRectPixels(layerPixels, rect),
    { action: "Cut Selection" }
  );
  if (!didChange) {
    return false;
  }
  showToast("Cut selection.", 900);
  return true;
}

function deleteSelectedPixelsInSelection() {
  if (!editor.boxSelection || !editor.boxSelectionLayerId) {
    return false;
  }
  const layer = getLayerById(editor.boxSelectionLayerId);
  if (!layer || layer.kind !== "paint") {
    return false;
  }
  if (layer.locked) {
    showToast("Active layer is locked.");
    return true;
  }
  const rect = { ...editor.boxSelection };
  const didChange = withLayerHistoryMutation(
    layer.id,
    (layerPixels) => clearRectPixels(layerPixels, rect),
    { action: "Delete Selection" }
  );
  if (didChange) {
    showToast("Deleted selected pixels.", 900);
  }
  return true;
}

function pasteClipboardIntoActiveLayer() {
  const clipboard = editor.selectionClipboard;
  if (!clipboard?.pixels || !clipboard.width || !clipboard.height) {
    showToast("Clipboard is empty.", 900);
    return false;
  }

  const activeLayer = getActivePaintLayer();
  if (!activeLayer) {
    showToast("No active paint layer.");
    return false;
  }
  if (activeLayer.locked) {
    showToast("Active layer is locked.");
    return false;
  }

  const width = clamp(Math.floor(clipboard.width), 1, TEXTURE_SIZE);
  const height = clamp(Math.floor(clipboard.height), 1, TEXTURE_SIZE);
  let destX = 0;
  let destY = 0;

  if (hasActiveBoxSelection(activeLayer.id)) {
    destX = editor.boxSelection.x;
    destY = editor.boxSelection.y;
  } else if (editor.hoverPoint) {
    destX = editor.hoverPoint.x - Math.floor(width / 2);
    destY = editor.hoverPoint.y - Math.floor(height / 2);
  }

  const rect = offsetRectWithinBounds({ x: destX, y: destY, width, height }, 0, 0);
  const didChange = withLayerHistoryMutation(
    activeLayer.id,
    (layerPixels) => blitRectPixels(layerPixels, clipboard.pixels, width, height, rect.x, rect.y),
    { action: "Paste Selection" }
  );
  if (!didChange) {
    return false;
  }

  editor.boxSelection = { ...rect };
  editor.boxSelectionLayerId = activeLayer.id;
  showToast("Pasted selection.", 900);
  return true;
}

function pushHistoryEntry(entry) {
  if (!entry || !entry.layerId || !entry.before || !entry.after) {
    return;
  }

  const normalizedEntry = {
    id: `h${editor.historySequence + 1}`,
    layerId: entry.layerId,
    before: entry.before,
    after: entry.after,
    action: String(entry.action ?? "Layer Edit").trim() || "Layer Edit",
    timestamp: Number.isFinite(Number(entry.timestamp)) ? Number(entry.timestamp) : Date.now()
  };
  editor.historySequence += 1;

  if (editor.historyIndex < editor.history.length - 1) {
    editor.history = editor.history.slice(0, editor.historyIndex + 1);
  }

  editor.history.push(normalizedEntry);

  if (editor.history.length > HISTORY_LIMIT) {
    editor.history.shift();
  }

  editor.historyIndex = editor.history.length - 1;
  renderUndoHistoryPanel();
  updateStatusBar();
}

function undoEditorHistory() {
  if (editor.historyIndex < 0) {
    return false;
  }

  const entry = editor.history[editor.historyIndex];
  const layer = getLayerById(entry.layerId);
  if (!layer || layer.kind !== "paint") {
    editor.historyIndex -= 1;
    return false;
  }
  const targetPixels = ensureLayerPixels(layer.id);
  targetPixels.set(entry.before);
  if (editor.activeLayerId === layer.id) {
    editor.pixels = targetPixels;
    syncTextureCanvas();
  }
  editor.historyIndex -= 1;
  renderPixelCanvas();
  renderUndoHistoryPanel();
  setDirty(true);
  updateStatusBar();
  return true;
}

function redoEditorHistory() {
  if (editor.historyIndex >= editor.history.length - 1) {
    return false;
  }

  const entry = editor.history[editor.historyIndex + 1];
  const layer = getLayerById(entry.layerId);
  if (!layer || layer.kind !== "paint") {
    editor.historyIndex += 1;
    return false;
  }
  const targetPixels = ensureLayerPixels(layer.id);
  targetPixels.set(entry.after);
  if (editor.activeLayerId === layer.id) {
    editor.pixels = targetPixels;
    syncTextureCanvas();
  }
  editor.historyIndex += 1;
  renderPixelCanvas();
  renderUndoHistoryPanel();
  setDirty(true);
  updateStatusBar();
  return true;
}

function renderUndoHistoryPanel() {
  if (!historyListEl) {
    return;
  }

  historyUndoBtnEl?.toggleAttribute("disabled", editor.historyIndex < 0);
  historyRedoBtnEl?.toggleAttribute("disabled", editor.historyIndex >= editor.history.length - 1);

  if (!editor.history.length) {
    historyListEl.innerHTML = '<div class="history-empty">No edits yet.</div>';
    return;
  }

  const rows = [];
  for (let i = editor.history.length - 1; i >= 0; i -= 1) {
    const entry = editor.history[i];
    const isActive = i === editor.historyIndex;
    const isRedoable = i > editor.historyIndex;
    rows.push(
      `<div class="history-row ${isActive ? "is-active" : ""} ${isRedoable ? "is-redoable" : ""}">
        <span class="history-row-label">${escapeHtml(entry.action ?? "Layer Edit")}</span>
        <span class="history-row-time">${escapeHtml(formatHistoryTime(entry.timestamp))}</span>
      </div>`
    );
  }

  historyListEl.innerHTML = rows.join("");
}

function formatHistoryTime(rawTimestamp) {
  const timestamp = Number(rawTimestamp);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "--:--";
  }
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function applyStrokeBetween(startPoint, endPoint, tool) {
  if (!startPoint || !endPoint) {
    return;
  }

  let changed = false;
  forEachLinePoint(startPoint.x, startPoint.y, endPoint.x, endPoint.y, (x, y) => {
    if (applyBrushAt(x, y, tool)) {
      changed = true;
    }
  });

  if (changed) {
    editor.strokeChanged = true;
    syncTextureCanvas();
  }
}

function applyBrushAt(centerX, centerY, tool) {
  const startX = centerX - Math.floor((editor.brushSize - 1) / 2);
  const startY = centerY - Math.floor((editor.brushSize - 1) / 2);
  let changed = false;

  for (let y = startY; y < startY + editor.brushSize; y += 1) {
    for (let x = startX; x < startX + editor.brushSize; x += 1) {
      if (x < 0 || y < 0 || x >= TEXTURE_SIZE || y >= TEXTURE_SIZE) {
        continue;
      }
      if (drawPixel(x, y, tool)) {
        changed = true;
      }
    }
  }

  return changed;
}

function blendPencilOverBase(baseR, baseG, baseB, baseA, srcR, srcG, srcB, srcAByte) {
  const srcA = srcAByte / 255;
  if (srcA <= 0) {
    return [baseR, baseG, baseB, baseA];
  }

  const dstA = baseA / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) {
    return [0, 0, 0, 0];
  }

  const dstR = baseR / 255;
  const dstG = baseG / 255;
  const dstB = baseB / 255;
  const srcRN = srcR / 255;
  const srcGN = srcG / 255;
  const srcBN = srcB / 255;

  const outR = (srcRN * srcA + dstR * dstA * (1 - srcA)) / outA;
  const outG = (srcGN * srcA + dstG * dstA * (1 - srcA)) / outA;
  const outB = (srcBN * srcA + dstB * dstA * (1 - srcA)) / outA;

  return [
    clampByte(Math.round(outR * 255)),
    clampByte(Math.round(outG * 255)),
    clampByte(Math.round(outB * 255)),
    clampByte(Math.round(outA * 255))
  ];
}

function drawPixel(x, y, tool) {
  const selectionRect = getSelectionConstraintRectForLayer(editor.pendingStrokeLayerId || editor.activeLayerId);
  if (selectionRect && !isCoordinateInsideRect(x, y, selectionRect)) {
    return false;
  }

  const index = (y * TEXTURE_SIZE + x) * 4;
  const pixelOffset = y * TEXTURE_SIZE + x;

  if (editor.isPointerDown && editor.strokeVisited?.[pixelOffset]) {
    return false;
  }

  const oldR = editor.pixels[index];
  const oldG = editor.pixels[index + 1];
  const oldB = editor.pixels[index + 2];
  const oldA = editor.pixels[index + 3];
  const basePixels = editor.isPointerDown && editor.strokeBasePixels ? editor.strokeBasePixels : editor.pixels;
  const baseR = basePixels[index];
  const baseG = basePixels[index + 1];
  const baseB = basePixels[index + 2];
  const baseA = basePixels[index + 3];

  let nextR = oldR;
  let nextG = oldG;
  let nextB = oldB;
  let nextA = oldA;

  if (tool === "pencil") {
    const [srcR, srcG, srcB, srcAByte] = editor.brushColor;
    if (srcAByte <= 0) {
      return false;
    }
    [nextR, nextG, nextB, nextA] = blendPencilOverBase(baseR, baseG, baseB, baseA, srcR, srcG, srcB, srcAByte);
  } else if (tool === "eraser") {
    const keep = 1 - editor.brushColor[3] / 255;
    nextR = clampByte(Math.round(baseR * keep));
    nextG = clampByte(Math.round(baseG * keep));
    nextB = clampByte(Math.round(baseB * keep));
    nextA = clampByte(Math.round(baseA * keep));

    if (nextA === 0) {
      nextR = 0;
      nextG = 0;
      nextB = 0;
    }
  } else {
    return false;
  }

  const changed = oldR !== nextR || oldG !== nextG || oldB !== nextB || oldA !== nextA;
  if (!changed) {
    return false;
  }

  editor.pixels[index] = nextR;
  editor.pixels[index + 1] = nextG;
  editor.pixels[index + 2] = nextB;
  editor.pixels[index + 3] = nextA;
  if (editor.isPointerDown && editor.strokeVisited) {
    editor.strokeVisited[pixelOffset] = 1;
  }
  return true;
}

function samplePixelToColor(x, y) {
  const clampedX = clamp(Math.floor(Number(x)), 0, TEXTURE_SIZE - 1);
  const clampedY = clamp(Math.floor(Number(y)), 0, TEXTURE_SIZE - 1);
  const compositePixels = composeVisibleLayersToPixelsForViewport();
  const index = (clampedY * TEXTURE_SIZE + clampedX) * 4;
  const r = compositePixels[index];
  const g = compositePixels[index + 1];
  const b = compositePixels[index + 2];
  const a = compositePixels[index + 3];
  const rgbaHex = formatHexRgba(r, g, b, a);
  setBrushColorFromRgba(r, g, b, a, { writeHex: true });
  showToast(`Sampled ${rgbaHex}`, 900);
}

function maybeShowUnsupportedToolToast(tool) {
  const now = Date.now();
  if (now - editor.lastUnsupportedToastAt < 700) {
    return;
  }

  editor.lastUnsupportedToastAt = now;
  const label = TOOL_LABELS[tool] ?? tool;
  showToast(`${label} tool is queued next.`, 1000);
}

function isPaintTool(tool) {
  return tool === "pencil" || tool === "eraser";
}

function eventToPixel(event) {
  if (!pixelCanvasEl) {
    return null;
  }

  const rect = pixelCanvasEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;

  if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height) {
    return null;
  }

  const x = clamp(Math.floor((localX / rect.width) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  const y = clamp(Math.floor((localY / rect.height) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  return { x, y };
}

function forEachLinePoint(x0, y0, x1, y1, visit) {
  let currentX = x0;
  let currentY = y0;
  const deltaX = Math.abs(x1 - x0);
  const deltaY = Math.abs(y1 - y0);
  const stepX = x0 < x1 ? 1 : -1;
  const stepY = y0 < y1 ? 1 : -1;
  let error = deltaX - deltaY;

  while (true) {
    visit(currentX, currentY);
    if (currentX === x1 && currentY === y1) {
      break;
    }

    const errorTimesTwo = error * 2;
    if (errorTimesTwo > -deltaY) {
      error -= deltaY;
      currentX += stepX;
    }
    if (errorTimesTwo < deltaX) {
      error += deltaX;
      currentY += stepY;
    }
  }
}

function renderPixelCanvas() {
  if (!pixelCanvasEl || !canvasStageEl || !editor.viewCtx || !editor.textureCanvas) {
    return;
  }

  const stageSize = getCanvasStageAvailableSize();
  if (!stageSize) {
    return;
  }

  const pixelSize = clamp(editor.zoom, MIN_CANVAS_ZOOM, MAX_CANVAS_ZOOM);
  const drawSize = pixelSize * TEXTURE_SIZE;

  editor.renderedPixelSize = pixelSize;

  const dpr = window.devicePixelRatio || 1;
  const renderWidth = Math.floor(drawSize * dpr);
  const renderHeight = Math.floor(drawSize * dpr);

  if (pixelCanvasEl.width !== renderWidth || pixelCanvasEl.height !== renderHeight) {
    pixelCanvasEl.width = renderWidth;
    pixelCanvasEl.height = renderHeight;
  }

  pixelCanvasEl.style.width = `${drawSize}px`;
  pixelCanvasEl.style.height = `${drawSize}px`;
  applyCanvasTransform();

  const ctx = editor.viewCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  drawCanvasBackdrop(ctx, drawSize, pixelSize);
  drawLayerStack(ctx, drawSize);

  if (editor.showCanvasGrid && pixelSize >= 6) {
    drawCanvasGrid(ctx, drawSize, pixelSize);
  }

  drawSelectionOverlay(ctx, pixelSize);
  drawBrushOutline(ctx, pixelSize);

  ctx.strokeStyle = "rgba(152, 146, 192, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, drawSize - 1, drawSize - 1);

  updateCanvasHud();
  updateCanvasCursor();
}

function drawLayerStack(ctx, drawSize) {
  for (const layer of editor.layers) {
    if (!layer.visible) {
      continue;
    }

    if (layer.kind === "paint") {
      const pixels = getLayerPixels(layer.id);
      if (!pixels) {
        continue;
      }
      syncTextureCanvasFromPixels(pixels);
      ctx.save();
      ctx.globalAlpha = clamp(Number(layer.opacity ?? 1), 0, 1);
      ctx.globalCompositeOperation = normalizeBlendMode(layer.blendMode) === "multiply" ? "multiply" : "source-over";
      ctx.drawImage(editor.textureCanvas, 0, 0, drawSize, drawSize);
      ctx.restore();
      continue;
    }

    if (layer.kind === "guide" && editor.guideImage) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = clamp(Number(layer.opacity ?? 1), 0, 1);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(editor.guideImage, 0, 0, drawSize, drawSize);
      ctx.restore();
    }
  }
}

function applyCanvasTransform() {
  if (!pixelCanvasEl) {
    return;
  }
  pixelCanvasEl.style.transformOrigin = "top left";
  pixelCanvasEl.style.transform = `translate(${editor.panX}px, ${editor.panY}px)`;
}

function updateCanvasCursor() {
  if (!pixelCanvasEl) {
    return;
  }

  const tool = getEffectiveTool();
  const zoomOut = editor.currentTool === "zoom" && editor.altEyedropperActive;
  let cursor = getCursorForTool(tool, { zoomOut, grabbing: editor.isPanning });

  if (tool === "select") {
    const moveTargetRect =
      editor.selectionDrag?.mode === "move"
        ? editor.selectionDrag.previewRect
        : hasActiveBoxSelection() && editor.boxSelection
          ? editor.boxSelection
          : null;
    cursor =
      moveTargetRect && editor.hoverPoint && isPointInsideRect(editor.hoverPoint, moveTargetRect)
        ? "move"
        : getCursorForTool("select");
  }

  pixelCanvasEl.style.cursor = cursor;
  if (canvasStageEl) {
    canvasStageEl.style.cursor = cursor;
  }
}

function drawCanvasBackdrop(ctx, drawSize, pixelSize) {
  const colorA = "#1f1b33";
  const colorB = "#2a2540";

  ctx.clearRect(0, 0, drawSize, drawSize);
  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < TEXTURE_SIZE; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

function drawCanvasGrid(ctx, drawSize, pixelSize) {
  ctx.strokeStyle = "rgba(132, 127, 168, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 1; i < TEXTURE_SIZE; i += 1) {
    const position = i * pixelSize + 0.5;
    ctx.moveTo(position, 0);
    ctx.lineTo(position, drawSize);
    ctx.moveTo(0, position);
    ctx.lineTo(drawSize, position);
  }

  ctx.stroke();
}

function drawBrushOutline(ctx, pixelSize) {
  const tool = getEffectiveTool();
  if (!(tool === "pencil" || tool === "eraser")) {
    return;
  }
  if (!editor.hoverPoint) {
    return;
  }

  const startX = editor.hoverPoint.x - Math.floor((editor.brushSize - 1) / 2);
  const startY = editor.hoverPoint.y - Math.floor((editor.brushSize - 1) / 2);
  const endX = startX + editor.brushSize - 1;
  const endY = startY + editor.brushSize - 1;

  const clampedStartX = clamp(startX, 0, TEXTURE_SIZE - 1);
  const clampedStartY = clamp(startY, 0, TEXTURE_SIZE - 1);
  const clampedEndX = clamp(endX, 0, TEXTURE_SIZE - 1);
  const clampedEndY = clamp(endY, 0, TEXTURE_SIZE - 1);

  if (clampedEndX < clampedStartX || clampedEndY < clampedStartY) {
    return;
  }

  const drawX = clampedStartX * pixelSize + 0.5;
  const drawY = clampedStartY * pixelSize + 0.5;
  const drawW = (clampedEndX - clampedStartX + 1) * pixelSize - 1;
  const drawH = (clampedEndY - clampedStartY + 1) * pixelSize - 1;

  ctx.save();
  ctx.strokeStyle = tool === "eraser" ? "rgba(255, 120, 140, 0.95)" : "rgba(102, 194, 255, 0.95)";
  ctx.lineWidth = 1;
  ctx.setLineDash(pixelSize >= 5 ? [] : [2, 2]);
  ctx.strokeRect(drawX, drawY, drawW, drawH);
  ctx.restore();
}

function drawSelectionOverlay(ctx, pixelSize) {
  let rect = null;

  if (editor.selectionDrag?.mode === "marquee") {
    rect = normalizeRectFromPoints(editor.selectionDrag.startPoint, editor.selectionDrag.currentPoint);
  } else if (editor.selectionDrag?.mode === "move") {
    rect = editor.selectionDrag.previewRect ?? editor.selectionDrag.sourceRect;
  } else if (editor.boxSelection) {
    rect = editor.boxSelection;
  }

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const drawX = rect.x * pixelSize + 0.5;
  const drawY = rect.y * pixelSize + 0.5;
  const drawW = rect.width * pixelSize - 1;
  const drawH = rect.height * pixelSize - 1;
  if (drawW <= 0 || drawH <= 0) {
    return;
  }

  const phase = (Date.now() / 120) % 8;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(245, 248, 255, 0.95)";
  ctx.lineDashOffset = -phase;
  ctx.strokeRect(drawX, drawY, drawW, drawH);
  ctx.strokeStyle = "rgba(8, 10, 16, 0.92)";
  ctx.lineDashOffset = 4 - phase;
  ctx.strokeRect(drawX, drawY, drawW, drawH);
  ctx.restore();
}

function updateCanvasHud() {
  if (!canvasHudEl) {
    return;
  }

  canvasHudEl.textContent = `Zoom ${editor.renderedPixelSize}x • Brush ${editor.brushSize}px`;
  updateStatusBar();
}

function updateStatusBar() {
  const projectName = state.activeProject?.name?.trim() || "none";
  const activeLayer = state.activeProject ? getActivePaintLayer() : null;
  const tool = TOOL_LABELS[getEffectiveTool()] ?? "Pencil";
  const zoom = Number.isFinite(editor.renderedPixelSize) ? editor.renderedPixelSize : editor.zoom;
  const historyCurrent = editor.historyIndex + 1;
  const historyTotal = editor.history.length;

  if (statusProjectEl) {
    statusProjectEl.textContent = `Project: ${projectName}`;
  }
  if (statusToolEl) {
    statusToolEl.textContent = `Tool: ${tool}`;
  }
  if (statusZoomEl) {
    statusZoomEl.textContent = `Zoom: ${zoom}x`;
  }
  if (statusLayerEl) {
    statusLayerEl.textContent = `Layer: ${activeLayer?.name ?? "none"}`;
  }
  if (statusHistoryEl) {
    statusHistoryEl.textContent = `History: ${Math.max(0, historyCurrent)} / ${historyTotal}`;
  }
  if (statusAutosaveEl) {
    const autosaveLabel = state.lastAutosaveAt
      ? `Autosave: ${formatStatusTime(state.lastAutosaveAt)}`
      : state.lastSaveAt
        ? `Autosave: idle (saved ${formatStatusTime(state.lastSaveAt)})`
        : "Autosave: idle";
    statusAutosaveEl.textContent = autosaveLabel;
  }
  if (statusPreflightEl) {
    const preflightText = String(state.preflightStatus ?? "n/a");
    statusPreflightEl.textContent = `Preflight: ${preflightText}`;
    const tone =
      preflightText.startsWith("error")
        ? "danger"
        : preflightText.startsWith("warn")
          ? "warn"
          : preflightText.startsWith("ok")
            ? "ok"
            : "";
    setStatusItemTone(statusPreflightEl, tone);
  }
  if (statusDirtyEl) {
    const dirtyText = state.dirty ? "State: Unsaved" : "State: Saved";
    statusDirtyEl.textContent = dirtyText;
    setStatusItemTone(statusDirtyEl, state.dirty ? "warn" : "ok");
  }
}

function setStatusItemTone(element, tone) {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  element.classList.remove("is-warn", "is-danger", "is-ok");
  if (tone === "warn") {
    element.classList.add("is-warn");
  } else if (tone === "danger") {
    element.classList.add("is-danger");
  } else if (tone === "ok") {
    element.classList.add("is-ok");
  }
}

function formatStatusTime(rawTimestamp) {
  const timestamp = Number(rawTimestamp);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "idle";
  }
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

async function hydrateEditorFromLoadedState(loaded, options = {}) {
  const { allowRecoveryPrompt = false } = options;

  const summary = normalizeProjectSummary(loaded.summary);
  state.activeProject = summary;
  state.lastSaveAt = Number(summary.updatedAt ?? Date.now());
  state.lastAutosaveAt = 0;

  const baseSnapshot = loadedStateToSnapshot(
    loaded.project,
    loaded.paintPixels,
    loaded.layerBitmaps,
    summary
  );
  await applyEditorSnapshot(baseSnapshot, { resetHistory: true });

  state.savedSnapshot = cloneEditorSnapshot(baseSnapshot);
  state.lastPreflight = null;
  state.preflightStatus = "n/a";
  setDirty(false);
  updateStatusBar();

  if (!allowRecoveryPrompt || !loaded.autosave) {
    return;
  }

  const recoveryUpdatedAt = Number(loaded.autosave.updatedAt ?? 0);
  const savedUpdatedAt = Number(summary.updatedAt ?? 0);
  if (!(recoveryUpdatedAt > savedUpdatedAt + 1000)) {
    return;
  }

  const recoveryTime = new Date(recoveryUpdatedAt).toLocaleString();
  const recoveryDecision = await requestRecoveryModal({
    title: "Recovery Center",
    message: `Recovered autosave found from ${recoveryTime}. Restore unsaved changes for this project?`,
    restoreLabel: "Restore autosave",
    discardLabel: "Discard"
  });

  if (recoveryDecision !== "restore") {
    await clearProjectAutosave(summary.id);
    showToast("Discarded autosave recovery snapshot.", 1400);
    return;
  }

  const recoveredSnapshot = loadedStateToSnapshot(
    loaded.autosave.project,
    loaded.autosave.paintPixels,
    loaded.autosave.layerBitmaps,
    summary
  );
  await applyEditorSnapshot(recoveredSnapshot, { resetHistory: true });
  state.lastAutosaveAt = recoveryUpdatedAt;
  setDirty(true);
  updateStatusBar();
  showToast("Recovered unsaved autosave snapshot.", 1500);
}

async function applyEditorSnapshot(snapshot, options = {}) {
  const { resetHistory = true } = options;
  if (!snapshot) {
    return;
  }

  if (state.activeProject) {
    state.activeProject.name = snapshot.name;
    state.activeProject.armType = normalizeArmType(snapshot.armType);
  }

  editor.layers = normalizeEditorLayers(snapshot.layers);
  editor.partsState = normalizePartsState(snapshot.parts);
  editor.paintLayerPixelsById = normalizeLayerBitmapStore(
    snapshot.layerBitmaps,
    editor.layers,
    snapshot.paintPixels
  );

  if (resetHistory) {
    editor.history = [];
    editor.historyIndex = -1;
    editor.historySequence = 0;
    editor.pendingStrokeLayerId = null;
    editor.pendingStrokeBefore = null;
    editor.strokeChanged = false;
    editor.strokeVisited = null;
    editor.strokeBasePixels = null;
  }

  const requestedActiveLayerId = String(snapshot.activeLayerId ?? "").trim();
  const activated =
    (requestedActiveLayerId && setActivePaintLayer(requestedActiveLayerId, { announce: false, render: false })) ||
    setActivePaintLayer(getPaintLayers().at(-1)?.id ?? "", { announce: false, render: false });

  if (!activated) {
    editor.activeLayerId = "";
    editor.pixels = new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
    syncTextureCanvas();
  }

  const snapshotSelected = Array.isArray(snapshot.selectedLayerIds) ? snapshot.selectedLayerIds : [];
  editor.selectedLayerIds = new Set(
    snapshotSelected.filter((layerId) => getLayerById(layerId)?.kind === "paint")
  );
  const active = getActivePaintLayer();
  if (active && !editor.selectedLayerIds.size) {
    editor.selectedLayerIds.add(active.id);
  }
  editor.layerPanelSelectionId = active?.id ?? getGuideLayer()?.id ?? "";

  updateProjectChip();
  renderPartsPanel();
  renderLayersPanel();
  await syncGuideTemplateForProject(state.activeProject?.armType, false);
  await ensureViewportModelForArmType(state.activeProject?.armType);
  renderPixelCanvas();
  renderUndoHistoryPanel();
  updateStatusBar();
}

function loadedStateToSnapshot(project, paintPixels, layerBitmaps, summary) {
  const baseName = project?.name?.trim() || summary?.name?.trim() || "Untitled Project";
  const baseArmType = normalizeArmType(project?.armType ?? summary?.armType);
  const layers = normalizeEditorLayers(project?.layers);
  const firstPaintLayerId = [...layers].reverse().find((layer) => layer.kind === "paint")?.id ?? "";

  return {
    name: baseName,
    armType: baseArmType,
    layers,
    parts: normalizePartsState(project?.parts),
    paintPixels: normalizePaintPixels(paintPixels),
    layerBitmaps: normalizeLayerBitmapsPayload(layerBitmaps),
    activeLayerId: firstPaintLayerId,
    selectedLayerIds: firstPaintLayerId ? [firstPaintLayerId] : []
  };
}

function normalizeProjectSummary(summary) {
  return {
    id: String(summary?.id ?? ""),
    name: String(summary?.name ?? "Untitled Project"),
    armType: normalizeArmType(summary?.armType),
    updatedAt: Number(summary?.updatedAt ?? Date.now()),
    layerCount: Number(summary?.layerCount ?? 2),
    path: String(summary?.path ?? "")
  };
}

function normalizeEditorLayers(rawLayers) {
  const input = Array.isArray(rawLayers) ? rawLayers : [];
  const next = input
    .map((layer, index) => {
      const kind = normalizeLayerKind(layer?.kind);
      const fallbackName = kind === "guide" ? "Layer 1 · Guide" : "Layer 2 · Paint";
      return {
        id: String(layer?.id ?? `layer-${index + 1}`),
        name: String(layer?.name ?? fallbackName),
        kind,
        visible: layer?.visible !== false,
        locked: layer?.locked === true,
        opacity: clamp(Number(layer?.opacity ?? 1), 0, 1),
        blendMode: normalizeBlendMode(layer?.blendMode),
        file:
          kind === "paint"
            ? String(layer?.file ?? "layers/paint.png")
            : String(layer?.file ?? "")
      };
    })
    .filter((layer) => layer.id.trim().length > 0);

  if (!next.some((layer) => layer.kind === "guide")) {
    next.unshift({
      id: "layer-guide",
      name: "Layer 1 · Guide",
      kind: "guide",
      visible: true,
      locked: true,
      opacity: 1,
      blendMode: "normal",
      file: ""
    });
  }

  if (!next.some((layer) => layer.kind === "paint")) {
    next.push({
      id: "layer-paint",
      name: "Layer 2 · Paint",
      kind: "paint",
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      file: "layers/paint.png"
    });
  }

  normalizePaintLayerFilesInPlace(next);

  return next;
}

function normalizePaintLayerFilesInPlace(layers) {
  const used = new Set();
  let paintIndex = 0;
  for (const layer of layers) {
    if (layer.kind !== "paint") {
      continue;
    }

    const rawFile = String(layer.file ?? "").trim();
    let candidate = rawFile || (paintIndex === 0 ? "layers/paint.png" : `layers/paint-${paintIndex + 1}.png`);
    if (!candidate.toLowerCase().endsWith(".png")) {
      candidate = `${candidate}.png`;
    }
    if (!candidate.startsWith("layers/")) {
      const fileName = candidate.split("/").at(-1) || `paint-${paintIndex + 1}.png`;
      candidate = `layers/${fileName}`;
    }
    if (used.has(candidate)) {
      let dedupe = paintIndex + 1;
      while (used.has(`layers/paint-${dedupe}.png`)) {
        dedupe += 1;
      }
      candidate = dedupe === 1 ? "layers/paint.png" : `layers/paint-${dedupe}.png`;
    }
    layer.file = candidate;
    used.add(candidate);
    paintIndex += 1;
  }
}

function normalizeLayerBitmapsPayload(rawBitmaps) {
  const input = Array.isArray(rawBitmaps) ? rawBitmaps : [];
  return input
    .map((entry) => ({
      layerId: String(entry?.layerId ?? ""),
      file: String(entry?.file ?? ""),
      pixels: normalizePaintPixels(entry?.pixels ?? entry?.paintPixels)
    }))
    .filter((entry) => entry.layerId.trim().length > 0);
}

function normalizeLayerBitmapStore(rawBitmaps, layers, fallbackPaintPixels) {
  const byId = new Map();
  const byFile = new Map();
  for (const entry of normalizeLayerBitmapsPayload(rawBitmaps)) {
    byId.set(entry.layerId, entry.pixels);
    if (entry.file.trim().length > 0) {
      byFile.set(entry.file, entry.pixels);
    }
  }

  const output = {};
  let fallbackUnused = normalizePaintPixels(fallbackPaintPixels);
  let fallbackConsumed = false;
  for (const layer of layers) {
    if (layer.kind !== "paint") {
      continue;
    }
    const fromId = byId.get(layer.id);
    const fromFile = byFile.get(String(layer.file ?? ""));
    let pixels = fromId ?? fromFile;
    if (!pixels && !fallbackConsumed) {
      pixels = fallbackUnused;
      fallbackConsumed = true;
    }
    output[layer.id] = new Uint8ClampedArray(pixels ?? new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4));
  }

  return output;
}

function normalizePartsState(rawParts) {
  const input = Array.isArray(rawParts) ? rawParts : [];
  return PART_NAMES.map((partName) => {
    const found = input.find((entry) => String(entry?.part ?? "").toLowerCase() === partName.toLowerCase());
    return {
      part: partName,
      baseLock: found?.baseLock === true,
      outerLock: found?.outerLock === true,
      baseVisibility: found?.baseVisibility !== false,
      outerVisibility: found?.outerVisibility !== false
    };
  });
}

function normalizePaintPixels(rawPixels) {
  const output = new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  if (!Array.isArray(rawPixels) && !(rawPixels instanceof Uint8Array) && !(rawPixels instanceof Uint8ClampedArray)) {
    return output;
  }

  const source = rawPixels;
  const length = Math.min(output.length, source.length);
  for (let i = 0; i < length; i += 1) {
    output[i] = clampByte(Number(source[i] ?? 0));
  }
  return output;
}

function cloneEditorSnapshot(snapshot) {
  return {
    name: snapshot.name,
    armType: snapshot.armType,
    layers: snapshot.layers.map((layer) => ({ ...layer })),
    parts: snapshot.parts.map((part) => ({ ...part })),
    paintPixels: new Uint8ClampedArray(snapshot.paintPixels),
    layerBitmaps: normalizeLayerBitmapsPayload(snapshot.layerBitmaps).map((entry) => ({
      ...entry,
      pixels: new Uint8ClampedArray(entry.pixels)
    })),
    activeLayerId: String(snapshot.activeLayerId ?? ""),
    selectedLayerIds: Array.isArray(snapshot.selectedLayerIds) ? [...snapshot.selectedLayerIds] : []
  };
}

function getPrimaryPaintPixelsForSave() {
  const firstPaintLayer = getPaintLayers()[0] ?? null;
  if (!firstPaintLayer) {
    return new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  }
  return normalizePaintPixels(ensureLayerPixels(firstPaintLayer.id));
}

function buildProjectSaveInput() {
  if (!state.activeProject?.id) {
    return null;
  }

  return {
    id: state.activeProject.id,
    name: state.activeProject.name,
    armType: normalizeArmType(state.activeProject.armType),
    layers: editor.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      kind: normalizeLayerKind(layer.kind),
      visible: layer.visible !== false,
      locked: layer.locked === true,
      opacity: clamp(Number(layer.opacity ?? 1), 0, 1),
      blendMode: normalizeBlendMode(layer.blendMode),
      file: normalizeLayerKind(layer.kind) === "paint" ? String(layer.file ?? "layers/paint.png") : ""
    })),
    layerBitmaps: getPaintLayers().map((layer) => ({
      layerId: layer.id,
      file: String(layer.file ?? ""),
      pixels: Array.from(ensureLayerPixels(layer.id) ?? new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4))
    })),
    parts: editor.partsState.map((part) => ({
      part: part.part,
      baseLock: part.baseLock === true,
      outerLock: part.outerLock === true,
      baseVisibility: part.baseVisibility !== false,
      outerVisibility: part.outerVisibility !== false
    })),
    paintPixels: Array.from(getPrimaryPaintPixelsForSave())
  };
}

async function saveActiveProject(options = {}) {
  const { showToastOnSuccess = false, autosave = false } = options;
  const input = buildProjectSaveInput();
  if (!input || !state.activeProject) {
    return false;
  }

  if (hasTauriBackend) {
    try {
      if (autosave) {
        await invokeBackend("save_internal_autosave", { input });
        state.lastAutosaveAt = Date.now();
      } else {
        const previewBytes = await buildLibraryModelPreviewPngBytes();
        if (previewBytes.length > 0) {
          input.previewPng = Array.from(previewBytes);
        }
        const summary = await invokeBackend("save_internal_project", { input });
        state.activeProject = normalizeProjectSummary(summary);
        state.savedSnapshot = captureCurrentEditorSnapshot();
        state.lastSaveAt = Date.now();
        setDirty(false);
      }

      updateStatusBar();
      if (showToastOnSuccess) {
        showToast(autosave ? "Autosaved." : `Saved ${state.activeProject.name}.`);
      }
      return true;
    } catch (error) {
      console.error(error);
      if (!autosave) {
        showToast("Could not save project.");
      }
      return false;
    }
  }

  const snapshot = captureCurrentEditorSnapshot();
  if (autosave) {
    writeFallbackAutosaveState(state.activeProject.id, snapshot);
    state.lastAutosaveAt = Date.now();
    updateStatusBar();
    return true;
  }

  writeFallbackProjectState(state.activeProject.id, snapshot);
  clearFallbackAutosaveState(state.activeProject.id);
  updateFallbackProjectSummary({
    ...state.activeProject,
    name: snapshot.name,
    armType: snapshot.armType,
    updatedAt: Date.now(),
    layerCount: snapshot.layers.length
  });
  state.savedSnapshot = snapshot;
  state.lastSaveAt = Date.now();
  setDirty(false);
  updateStatusBar();
  if (showToastOnSuccess) {
    showToast(`Saved ${state.activeProject.name}.`);
  }
  return true;
}

async function renameActiveProject(nextNameRaw) {
  if (!state.activeProject?.id) {
    return false;
  }

  const nextName = String(nextNameRaw ?? "").trim();
  if (!nextName) {
    showToast("Project name cannot be empty.");
    return false;
  }

  if (hasTauriBackend) {
    try {
      const summary = await invokeBackend("rename_internal_project", {
        input: {
          id: state.activeProject.id,
          name: nextName
        }
      });
      state.activeProject = normalizeProjectSummary(summary);
      if (state.savedSnapshot) {
        state.savedSnapshot.name = state.activeProject.name;
      }
      updateProjectChip();
      return true;
    } catch (error) {
      console.error(error);
      showToast("Could not rename project.");
      return false;
    }
  }

  const projectId = state.activeProject.id;
  updateFallbackProjectSummary({
    ...state.activeProject,
    name: nextName,
    updatedAt: Date.now()
  });

  updateFallbackStateName(fallbackProjectStateKey(projectId), nextName);
  updateFallbackStateName(fallbackAutosaveStateKey(projectId), nextName);
  if (state.savedSnapshot) {
    state.savedSnapshot.name = nextName;
  }
  updateProjectChip();
  return true;
}

function captureCurrentEditorSnapshot() {
  const layerBitmaps = getPaintLayers().map((layer) => ({
    layerId: layer.id,
    file: String(layer.file ?? ""),
    pixels: new Uint8ClampedArray(ensureLayerPixels(layer.id) ?? new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4))
  }));

  return {
    name: state.activeProject?.name?.trim() || "Untitled Project",
    armType: normalizeArmType(state.activeProject?.armType),
    layers: editor.layers.map((layer) => ({ ...layer })),
    parts: editor.partsState.map((part) => ({ ...part })),
    paintPixels: new Uint8ClampedArray(getPrimaryPaintPixelsForSave()),
    layerBitmaps,
    activeLayerId: String(editor.activeLayerId ?? ""),
    selectedLayerIds: Array.from(editor.selectedLayerIds)
  };
}

async function maybeAutosave(reason = "interval") {
  if (!state.activeProject?.id || !state.dirty || state.autosaveInFlight) {
    return;
  }

  state.autosaveInFlight = true;
  try {
    await saveActiveProject({ reason, autosave: true, showToastOnSuccess: false });
  } finally {
    state.autosaveInFlight = false;
  }
}

function startAutosaveTimer() {
  stopAutosaveTimer();
  state.autosaveTimerId = window.setInterval(() => {
    void maybeAutosave("interval");
  }, AUTOSAVE_INTERVAL_MS);
}

function stopAutosaveTimer() {
  if (state.autosaveTimerId !== null) {
    window.clearInterval(state.autosaveTimerId);
    state.autosaveTimerId = null;
  }
}

function wireAutosaveLifecycle() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void maybeAutosave("hidden");
    }
  });

  window.addEventListener("pagehide", () => {
    void maybeAutosave("pagehide");
  });

  window.addEventListener("beforeunload", (event) => {
    void maybeAutosave("beforeunload");
    const hasNativeCloseGuard = Boolean(tauriWindowApi?.getCurrentWindow?.()?.onCloseRequested);
    if (!state.dirty || hasNativeCloseGuard) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  });
}

function wireRenameModal() {
  if (!renameModalEl || !renameModalFormEl) {
    return;
  }

  renameModalCancelBtnEl?.addEventListener("click", () => {
    closeRenameModal(null);
  });

  renameModalEl.addEventListener("click", (event) => {
    if (event.target === renameModalEl) {
      closeRenameModal(null);
    }
  });

  renameModalFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(renameModalInputEl?.value ?? "").trim();
    if (!name) {
      showToast("Project name cannot be empty.");
      renameModalInputEl?.focus();
      return;
    }

    closeRenameModal(name);
  });

  window.addEventListener("keydown", (event) => {
    if (!renameModalEl || renameModalEl.hidden) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeRenameModal(null);
    }
  });
}

function requestRenameModal(initialName) {
  if (!renameModalEl || !renameModalFormEl) {
    return Promise.resolve(null);
  }

  if (state.renameModalResolver) {
    closeRenameModal(null);
  }

  if (renameModalInputEl) {
    renameModalInputEl.value = initialName;
  }

  renameModalEl.hidden = false;
  window.setTimeout(() => {
    renameModalInputEl?.focus();
    renameModalInputEl?.select();
  }, 0);

  return new Promise((resolve) => {
    state.renameModalResolver = resolve;
  });
}

function closeRenameModal(result) {
  if (!renameModalEl) {
    return;
  }

  const resolver = state.renameModalResolver;
  state.renameModalResolver = null;
  renameModalEl.hidden = true;
  if (!resolver) {
    return;
  }

  resolver(result ? String(result).trim() : null);
}

function wireProjectConfigModal() {
  if (!projectConfigModalEl || !projectConfigModalFormEl) {
    return;
  }

  projectConfigCancelBtnEl?.addEventListener("click", () => {
    closeProjectConfigModal(null);
  });

  projectConfigModalEl.addEventListener("click", (event) => {
    if (event.target === projectConfigModalEl) {
      closeProjectConfigModal(null);
    }
  });

  projectConfigModalFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(projectConfigNameInputEl?.value ?? "").trim();
    if (!name) {
      showToast("Project name cannot be empty.");
      projectConfigNameInputEl?.focus();
      return;
    }
    closeProjectConfigModal({
      name,
      armType: projectConfigArmSlimEl?.checked ? "slim" : "classic"
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!projectConfigModalEl || projectConfigModalEl.hidden) {
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeProjectConfigModal(null);
  });
}

function requestProjectConfigModal(options = {}) {
  if (!projectConfigModalEl || !projectConfigModalFormEl) {
    return Promise.resolve(null);
  }

  const {
    title = "Project",
    confirmLabel = "Confirm",
    initialName = "Untitled Project",
    initialArmType = "classic",
    includeArmType = true
  } = options;

  if (state.projectConfigModalResolver) {
    closeProjectConfigModal(null);
  }

  state.projectConfigModalIncludeArmType = includeArmType;
  if (projectConfigModalTitleEl) {
    projectConfigModalTitleEl.textContent = title;
  }
  if (projectConfigConfirmBtnEl) {
    projectConfigConfirmBtnEl.textContent = confirmLabel;
  }
  if (projectConfigNameInputEl) {
    projectConfigNameInputEl.value = initialName;
  }
  if (projectConfigArmTypeGroupEl) {
    projectConfigArmTypeGroupEl.hidden = !includeArmType;
    const radios = projectConfigArmTypeGroupEl.querySelectorAll("input[type='radio']");
    radios.forEach((radio) => {
      radio.disabled = !includeArmType;
    });
  }

  const normalizedArmType = normalizeArmType(initialArmType);
  if (projectConfigArmSlimEl) {
    projectConfigArmSlimEl.checked = normalizedArmType === "slim";
  }
  if (projectConfigArmClassicEl) {
    projectConfigArmClassicEl.checked = normalizedArmType !== "slim";
  }

  projectConfigModalEl.hidden = false;
  window.setTimeout(() => {
    projectConfigNameInputEl?.focus();
    projectConfigNameInputEl?.select();
  }, 0);

  return new Promise((resolve) => {
    state.projectConfigModalResolver = resolve;
  });
}

function closeProjectConfigModal(result) {
  if (!projectConfigModalEl) {
    return;
  }

  const resolver = state.projectConfigModalResolver;
  state.projectConfigModalResolver = null;
  projectConfigModalEl.hidden = true;

  if (!resolver) {
    return;
  }

  if (!result) {
    resolver(null);
    return;
  }

  resolver({
    name: String(result.name ?? "").trim(),
    armType: state.projectConfigModalIncludeArmType ? normalizeArmType(result.armType) : "classic"
  });
}

function wireConfirmModal() {
  if (!confirmModalEl || !confirmModalFormEl) {
    return;
  }

  confirmModalCancelBtnEl?.addEventListener("click", () => {
    closeConfirmModal(false);
  });

  confirmModalEl.addEventListener("click", (event) => {
    if (event.target === confirmModalEl) {
      closeConfirmModal(false);
    }
  });

  confirmModalFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    closeConfirmModal(true);
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

function requestConfirmModal(options = {}) {
  if (!confirmModalEl || !confirmModalFormEl) {
    const fallbackAccepted = window.confirm(
      String(options.message ?? options.title ?? "Are you sure?")
    );
    return Promise.resolve(fallbackAccepted);
  }

  const {
    title = "Confirm",
    message = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmTone = "success"
  } = options;

  if (state.confirmModalResolver) {
    closeConfirmModal(false);
  }

  if (confirmModalTitleEl) {
    confirmModalTitleEl.textContent = title;
  }
  if (confirmModalMessageEl) {
    confirmModalMessageEl.textContent = message;
  }
  if (confirmModalCancelBtnEl) {
    confirmModalCancelBtnEl.textContent = cancelLabel;
  }
  if (confirmModalConfirmBtnEl) {
    confirmModalConfirmBtnEl.textContent = confirmLabel;
    confirmModalConfirmBtnEl.classList.remove("success", "danger");
    confirmModalConfirmBtnEl.classList.add(confirmTone === "danger" ? "danger" : "success");
  }

  state.confirmModalOptions = {
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirmTone
  };
  confirmModalEl.hidden = false;
  window.setTimeout(() => {
    confirmModalConfirmBtnEl?.focus();
  }, 0);

  return new Promise((resolve) => {
    state.confirmModalResolver = resolve;
  });
}

function closeConfirmModal(result) {
  if (!confirmModalEl) {
    return;
  }
  const resolver = state.confirmModalResolver;
  state.confirmModalResolver = null;
  state.confirmModalOptions = null;
  confirmModalEl.hidden = true;
  if (!resolver) {
    return;
  }
  resolver(result === true);
}

function wireUnsavedCloseModal() {
  if (!unsavedCloseModalEl) {
    return;
  }

  unsavedCloseCancelBtnEl?.addEventListener("click", () => {
    closeUnsavedCloseModal("cancel");
  });

  unsavedCloseDiscardBtnEl?.addEventListener("click", () => {
    closeUnsavedCloseModal("discard");
  });

  unsavedCloseSaveBtnEl?.addEventListener("click", () => {
    closeUnsavedCloseModal("save");
  });

  unsavedCloseModalEl.addEventListener("click", (event) => {
    if (event.target === unsavedCloseModalEl) {
      closeUnsavedCloseModal("cancel");
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!unsavedCloseModalEl || unsavedCloseModalEl.hidden) {
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeUnsavedCloseModal("cancel");
  });
}

function requestUnsavedCloseModal(options = {}) {
  if (!unsavedCloseModalEl) {
    const fallbackAccepted = window.confirm(
      String(options.message ?? options.title ?? "You have unsaved changes.")
    );
    return Promise.resolve(fallbackAccepted ? "discard" : "cancel");
  }

  const {
    title = "Unsaved Changes",
    message = "You have unsaved changes. Are you sure you want to close without saving?",
    saveLabel = "Save and Close",
    discardLabel = "Close",
    cancelLabel = "Cancel"
  } = options;

  if (state.unsavedCloseModalResolver) {
    closeUnsavedCloseModal("cancel");
  }

  if (unsavedCloseModalTitleEl) {
    unsavedCloseModalTitleEl.textContent = String(title);
  }
  if (unsavedCloseModalMessageEl) {
    unsavedCloseModalMessageEl.textContent = String(message);
  }
  if (unsavedCloseSaveBtnEl) {
    unsavedCloseSaveBtnEl.textContent = String(saveLabel);
  }
  if (unsavedCloseDiscardBtnEl) {
    unsavedCloseDiscardBtnEl.textContent = String(discardLabel);
  }
  if (unsavedCloseCancelBtnEl) {
    unsavedCloseCancelBtnEl.textContent = String(cancelLabel);
  }

  unsavedCloseModalEl.hidden = false;
  window.setTimeout(() => {
    unsavedCloseSaveBtnEl?.focus();
  }, 0);

  return new Promise((resolve) => {
    state.unsavedCloseModalResolver = resolve;
  });
}

function closeUnsavedCloseModal(result) {
  if (!unsavedCloseModalEl) {
    return;
  }

  const resolver = state.unsavedCloseModalResolver;
  state.unsavedCloseModalResolver = null;
  unsavedCloseModalEl.hidden = true;

  if (!resolver) {
    return;
  }
  resolver(result === "save" || result === "discard" || result === "cancel" ? result : "cancel");
}

function wireRecoveryModal() {
  if (!recoveryModalEl) {
    return;
  }

  recoveryDiscardBtnEl?.addEventListener("click", () => {
    closeRecoveryModal("discard");
  });

  recoveryRestoreBtnEl?.addEventListener("click", () => {
    closeRecoveryModal("restore");
  });
}

function requestRecoveryModal(options = {}) {
  if (!recoveryModalEl) {
    const fallbackAccepted = window.confirm(
      String(options.message ?? options.title ?? "Recovered autosave found. Restore unsaved changes?")
    );
    return Promise.resolve(fallbackAccepted ? "restore" : "discard");
  }

  const {
    title = "Recovery Center",
    message = "A newer autosave was found for this project. Restore unsaved changes?",
    restoreLabel = "Restore autosave",
    discardLabel = "Discard"
  } = options;

  if (state.recoveryModalResolver) {
    closeRecoveryModal("discard");
  }

  if (recoveryModalTitleEl) {
    recoveryModalTitleEl.textContent = String(title);
  }
  if (recoveryModalMessageEl) {
    recoveryModalMessageEl.textContent = String(message);
  }
  if (recoveryRestoreBtnEl) {
    recoveryRestoreBtnEl.textContent = String(restoreLabel);
  }
  if (recoveryDiscardBtnEl) {
    recoveryDiscardBtnEl.textContent = String(discardLabel);
  }

  recoveryModalEl.hidden = false;
  window.setTimeout(() => {
    recoveryRestoreBtnEl?.focus();
  }, 0);

  return new Promise((resolve) => {
    state.recoveryModalResolver = resolve;
  });
}

function closeRecoveryModal(result) {
  if (!recoveryModalEl) {
    return;
  }

  const resolver = state.recoveryModalResolver;
  state.recoveryModalResolver = null;
  recoveryModalEl.hidden = true;

  if (!resolver) {
    return;
  }
  resolver(result === "restore" || result === "discard" ? result : "discard");
}

async function closeCurrentWindowSafely(currentWindow) {
  if (!currentWindow) {
    return false;
  }

  if (typeof currentWindow.close === "function") {
    try {
      await currentWindow.close();
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  if (typeof currentWindow.destroy === "function") {
    try {
      await currentWindow.destroy();
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  return false;
}

function wireWindowCloseGuard() {
  if (state.closeGuardWired) {
    return;
  }
  state.closeGuardWired = true;

  const currentWindow = tauriWindowApi?.getCurrentWindow?.();
  if (!currentWindow?.onCloseRequested) {
    return;
  }

  try {
    const maybePromise = currentWindow.onCloseRequested(async (event) => {
      if (state.bypassWindowCloseOnce) {
        state.bypassWindowCloseOnce = false;
        return;
      }

      if (!state.dirty) {
        return;
      }

      event?.preventDefault?.();
      const decision = await requestUnsavedCloseModal({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Are you sure you want to close without saving?",
        saveLabel: "Save and Close",
        discardLabel: "Close",
        cancelLabel: "Cancel"
      });

      if (decision === "cancel") {
        return;
      }
      if (decision === "save") {
        const saved = await handleSaveProject();
        if (!saved) {
          return;
        }
      }

      state.bypassWindowCloseOnce = true;
      const closed = await closeCurrentWindowSafely(currentWindow);
      if (!closed) {
        state.bypassWindowCloseOnce = false;
      }
    });

    // Keep the promise alive in case the runtime requires awaiting registration.
    if (maybePromise && typeof maybePromise.then === "function") {
      void maybePromise;
    }
  } catch (error) {
    console.error(error);
  }
}

function wireAppExitGuard() {
  if (!hasTauriBackend || typeof tauriEventApi?.listen !== "function") {
    return;
  }

  try {
    const maybePromise = tauriEventApi.listen("qse://app-exit-requested", async () => {
      if (state.appExitGuardBusy) {
        return;
      }
      state.appExitGuardBusy = true;

      try {
        if (state.dirty) {
          const decision = await requestUnsavedCloseModal({
            title: "Unsaved Changes",
            message: "You have unsaved changes. Are you sure you want to close without saving?",
            saveLabel: "Save and Close",
            discardLabel: "Close",
            cancelLabel: "Cancel"
          });

          if (decision === "cancel") {
            return;
          }
          if (decision === "save") {
            const saved = await handleSaveProject();
            if (!saved) {
              return;
            }
          }
        }

        await invokeBackend("confirm_app_exit");
      } catch (error) {
        console.error(error);
      } finally {
        state.appExitGuardBusy = false;
      }
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      void maybePromise;
    }
  } catch (error) {
    console.error(error);
  }
}

function wirePreflightModal() {
  if (!preflightModalEl) {
    return;
  }

  preflightCancelBtnEl?.addEventListener("click", () => {
    closePreflightModal(false);
  });
  preflightProceedBtnEl?.addEventListener("click", () => {
    closePreflightModal(true);
  });
  preflightModalEl.addEventListener("click", (event) => {
    if (event.target === preflightModalEl) {
      closePreflightModal(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!preflightModalEl || preflightModalEl.hidden) {
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closePreflightModal(false);
  });
}

function requestPreflightModal(report, format = "png") {
  const normalizedFormat = String(format ?? "png").toUpperCase();
  const warningCount = Number(report?.warningCount ?? 0);
  const errorCount = Number(report?.errorCount ?? 0);
  const hasBlockingErrors = errorCount > 0;
  const issueCount = warningCount + errorCount;
  const stats = report?.stats ?? {};

  if (!preflightModalEl || !preflightSummaryEl || !preflightIssuesEl) {
    if (hasBlockingErrors) {
      return Promise.resolve(false);
    }
    return Promise.resolve(window.confirm("Export contains warnings. Continue anyway?"));
  }

  preflightSummaryEl.textContent =
    `${normalizedFormat} preflight found ${issueCount} issue(s). ` +
    `Opaque: ${Number(stats.opaquePixels ?? 0)}, Transparent: ${Number(stats.transparentPixels ?? 0)}, ` +
    `Semi: ${Number(stats.semiTransparentPixels ?? 0)}.` +
    (hasBlockingErrors ? " Export is blocked until errors are fixed." : "");

  const issues = Array.isArray(report?.issues) ? report.issues : [];
  preflightIssuesEl.innerHTML = issues
    .map((issue) => {
      const level = String(issue?.level ?? "info").toLowerCase();
      return `
        <article class="preflight-issue ${level === "error" ? "is-error" : level === "warning" ? "is-warning" : ""}">
          <div class="preflight-issue-header">
            <span>${escapeHtml(level)}</span>
            <span class="preflight-issue-code">${escapeHtml(String(issue?.code ?? "CHECK"))}</span>
          </div>
          <div class="preflight-issue-copy">${escapeHtml(String(issue?.message ?? ""))}</div>
        </article>
      `;
    })
    .join("");

  if (preflightProceedBtnEl) {
    preflightProceedBtnEl.textContent = hasBlockingErrors ? "Fix Errors to Export" : "Continue Export";
    preflightProceedBtnEl.classList.remove("danger", "success");
    preflightProceedBtnEl.classList.add(hasBlockingErrors ? "danger" : "success");
    preflightProceedBtnEl.disabled = hasBlockingErrors;
  }

  if (state.preflightModalResolver) {
    closePreflightModal(false);
  }
  preflightModalEl.hidden = false;
  window.setTimeout(() => {
    if (hasBlockingErrors) {
      preflightCancelBtnEl?.focus();
    } else {
      preflightProceedBtnEl?.focus();
    }
  }, 0);
  return new Promise((resolve) => {
    state.preflightModalResolver = resolve;
  });
}

function closePreflightModal(result) {
  if (!preflightModalEl) {
    return;
  }
  const resolver = state.preflightModalResolver;
  state.preflightModalResolver = null;
  preflightModalEl.hidden = true;
  if (!resolver) {
    return;
  }
  resolver(result === true);
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
    updateKeybindUiHints();
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
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    if (state.keybindCaptureActionId) {
      state.keybindCaptureActionId = "";
      renderKeybindModal();
      return;
    }
    closeKeybindModal();
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

function updateKeybindUiHints() {
  const toolActionById = {
    pencil: "toolPencil",
    eraser: "toolEraser",
    fill: "toolFill",
    select: "toolSelect",
    eyedropper: "toolEyedropper",
    zoom: "toolZoom"
  };

  document.querySelectorAll(".tool[data-tool]").forEach((button) => {
    const toolId = String(button.getAttribute("data-tool") ?? "").trim();
    const actionId = toolActionById[toolId];
    const label = TOOL_LABELS[toolId] ?? toolId;
    const keybindLabel = actionId ? bindingToDisplayLabel(getActionBinding(actionId)) : "";
    button.title = keybindLabel && keybindLabel !== "Unassigned" ? `${label} (${keybindLabel})` : label;
  });

}

function handleKeybindCaptureKeydown(event) {
  if (!keybindModalEl || keybindModalEl.hidden || !state.keybindCaptureActionId) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();

  if (event.key === "Escape") {
    state.keybindCaptureActionId = "";
    renderKeybindModal();
    return true;
  }

  const binding = eventToBindingString(event);
  if (!binding) {
    return true;
  }

  setActionBinding(state.keybindCaptureActionId, binding, { announce: true });
  state.keybindCaptureActionId = "";
  renderKeybindModal();
  return true;
}

function isAnyModalOpen() {
  return (
    (renameModalEl && !renameModalEl.hidden) ||
    (projectConfigModalEl && !projectConfigModalEl.hidden) ||
    (confirmModalEl && !confirmModalEl.hidden) ||
    (unsavedCloseModalEl && !unsavedCloseModalEl.hidden) ||
    (recoveryModalEl && !recoveryModalEl.hidden) ||
    (keybindModalEl && !keybindModalEl.hidden) ||
    (themeBrowserModalEl && !themeBrowserModalEl.hidden) ||
    (helpModalEl && !helpModalEl.hidden) ||
    (preflightModalEl && !preflightModalEl.hidden)
  );
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

function setActionBinding(actionId, nextBinding, options = {}) {
  const { announce = false } = options;
  if (!Object.prototype.hasOwnProperty.call(KEYBIND_DEFAULTS, actionId)) {
    return;
  }
  const rawBinding = typeof nextBinding === "string" ? nextBinding.trim() : "";
  const normalized = normalizeBindingString(nextBinding);
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
  updateKeybindUiHints();

  if (!announce) {
    return;
  }

  if (clearBinding) {
    showToast("Shortcut cleared.", 1200);
    return;
  }

  const duplicates = getKeybindingDuplicates();
  if (duplicates.has(actionId)) {
    showToast(`Duplicate shortcut set: ${bindingToDisplayLabel(normalized)}.`, 1800);
  } else {
    showToast(`Shortcut updated: ${bindingToDisplayLabel(normalized)}.`, 1200);
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

function eventMatchesActionBinding(event, actionId) {
  const binding = getActionBinding(actionId);
  if (!binding) {
    return false;
  }
  return eventMatchesBinding(event, binding);
}

function eventMatchesBinding(event, binding) {
  const normalized = normalizeBindingString(binding);
  if (!normalized) {
    return false;
  }
  const parts = normalized.split("+");
  let requiresCmdOrCtrl = false;
  let requiresShift = false;
  let requiresAlt = false;
  let mainToken = "";

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
    mainToken = part;
  }

  const hasCmdOrCtrl = event.metaKey || event.ctrlKey;
  if (requiresCmdOrCtrl !== hasCmdOrCtrl) {
    return false;
  }
  if (requiresShift !== event.shiftKey) {
    return false;
  }
  if (requiresAlt !== event.altKey) {
    return false;
  }
  if (!mainToken) {
    return false;
  }

  if (isCodeBindingToken(mainToken)) {
    return event.code === mainToken;
  }
  return normalizeEventKeyToken(event.key) === mainToken;
}

function eventToBindingString(event) {
  if (isModifierEventCode(event.code)) {
    return "";
  }

  const mainToken = normalizeMainBindingToken(event.code, event.key);
  if (!mainToken) {
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
  parts.push(mainToken);
  return normalizeBindingString(parts.join("+"));
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
  let mainToken = "";
  for (const part of parts) {
    const lowered = part.toLowerCase();
    if (lowered === "cmdorctrl" || lowered === "cmd/ctrl" || lowered === "meta" || lowered === "ctrl") {
      requiresCmdOrCtrl = true;
      continue;
    }
    if (lowered === "shift") {
      requiresShift = true;
      continue;
    }
    if (lowered === "alt" || lowered === "option") {
      requiresAlt = true;
      continue;
    }
    mainToken = normalizeMainBindingToken(part, part);
  }

  if (!mainToken) {
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
  normalizedParts.push(mainToken);
  return normalizedParts.join("+");
}

function normalizeMainBindingToken(codeOrToken, keyToken) {
  const code = String(codeOrToken ?? "").trim();
  const key = String(keyToken ?? "").trim();
  const codeUpper = code.toUpperCase();
  const keyUpper = key.toUpperCase();

  if (isCodeBindingToken(code)) {
    return code;
  }
  if (/^KEY[A-Z]$/.test(codeUpper)) {
    return `Key${codeUpper.at(-1)}`;
  }
  if (/^DIGIT[0-9]$/.test(codeUpper)) {
    return `Digit${codeUpper.at(-1)}`;
  }

  if (key.length === 1 && /[A-Z]/i.test(key)) {
    return `Key${keyUpper}`;
  }
  if (key.length === 1 && /[0-9]/.test(key)) {
    return `Digit${key}`;
  }

  if (key === "[") {
    return "BracketLeft";
  }
  if (key === "]") {
    return "BracketRight";
  }
  if (key === "=" || key === "+") {
    return "Equal";
  }
  if (key === "-" || key === "_") {
    return "Minus";
  }

  const normalizedKey = normalizeEventKeyToken(key);
  return normalizedKey;
}

function isCodeBindingToken(token) {
  return /^(Key[A-Z]|Digit[0-9]|BracketLeft|BracketRight|Equal|Minus)$/.test(String(token ?? ""));
}

function normalizeEventKeyToken(key) {
  const raw = String(key ?? "").trim();
  if (!raw) {
    return "";
  }

  if (raw === " ") {
    return "Space";
  }
  const lowered = raw.toLowerCase();
  if (lowered === "esc") {
    return "Escape";
  }
  if (lowered === "del") {
    return "Delete";
  }
  if (lowered === "arrowup") {
    return "ArrowUp";
  }
  if (lowered === "arrowdown") {
    return "ArrowDown";
  }
  if (lowered === "arrowleft") {
    return "ArrowLeft";
  }
  if (lowered === "arrowright") {
    return "ArrowRight";
  }
  if (raw.length === 1) {
    return raw.toUpperCase();
  }
  return raw[0].toUpperCase() + raw.slice(1);
}

function isModifierEventCode(code) {
  return (
    code === "ShiftLeft" ||
    code === "ShiftRight" ||
    code === "ControlLeft" ||
    code === "ControlRight" ||
    code === "AltLeft" ||
    code === "AltRight" ||
    code === "MetaLeft" ||
    code === "MetaRight"
  );
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
      if (part === "Shift") {
        return "Shift";
      }
      if (part === "Alt") {
        return "Alt";
      }
      if (part.startsWith("Key")) {
        return part.slice(3);
      }
      if (part.startsWith("Digit")) {
        return part.slice(5);
      }
      if (part === "BracketLeft") {
        return "[";
      }
      if (part === "BracketRight") {
        return "]";
      }
      if (part === "Equal") {
        return "+";
      }
      if (part === "Minus") {
        return "-";
      }
      return part;
    })
    .join(" + ");
}

async function clearProjectAutosave(projectId) {
  if (!projectId) {
    return;
  }

  if (hasTauriBackend) {
    try {
      await invokeBackend("clear_internal_autosave", { id: projectId });
    } catch (error) {
      console.error(error);
    }
    return;
  }

  clearFallbackAutosaveState(projectId);
}

function updateFallbackProjectSummary(summary) {
  const normalized = normalizeProjectSummary(summary);
  const projects = readFallbackProjects();
  const rest = projects.filter((item) => item.id !== normalized.id);
  rest.unshift(normalized);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest.slice(0, 24)));
  state.activeProject = normalized;
  updateProjectChip();
}

function fallbackProjectStateKey(projectId) {
  return `${FALLBACK_PROJECT_KEY_PREFIX}${projectId}`;
}

function fallbackAutosaveStateKey(projectId) {
  return `${FALLBACK_AUTOSAVE_KEY_PREFIX}${projectId}`;
}

function serializeSnapshot(snapshot) {
  return JSON.stringify({
    name: snapshot.name,
    armType: normalizeArmType(snapshot.armType),
    layers: snapshot.layers,
    parts: snapshot.parts,
    paintPixels: Array.from(snapshot.paintPixels),
    layerBitmaps: normalizeLayerBitmapsPayload(snapshot.layerBitmaps).map((entry) => ({
      layerId: entry.layerId,
      file: entry.file,
      pixels: Array.from(entry.pixels)
    })),
    activeLayerId: String(snapshot.activeLayerId ?? ""),
    selectedLayerIds: Array.isArray(snapshot.selectedLayerIds) ? snapshot.selectedLayerIds : [],
    updatedAt: Date.now()
  });
}

function createDefaultProjectState(options = {}) {
  const { name = "Untitled Project", armType = "classic" } = options;
  const layers = normalizeEditorLayers([]);
  const firstPaintLayerId = layers.find((layer) => layer.kind === "paint")?.id ?? "layer-paint";
  const layerBitmaps = [
    {
      layerId: firstPaintLayerId,
      file: layers.find((layer) => layer.id === firstPaintLayerId)?.file ?? "layers/paint.png",
      pixels: Array.from(new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4))
    }
  ];
  return {
    name,
    armType: normalizeArmType(armType),
    layers,
    parts: normalizePartsState([]),
    paintPixels: Array.from(new Uint8ClampedArray(TEXTURE_SIZE * TEXTURE_SIZE * 4)),
    layerBitmaps,
    activeLayerId: firstPaintLayerId,
    selectedLayerIds: [firstPaintLayerId],
    updatedAt: Date.now()
  };
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
      name: String(parsed?.name ?? "Untitled Project"),
      armType: normalizeArmType(parsed?.armType),
      layers: normalizeEditorLayers(parsed?.layers),
      parts: normalizePartsState(parsed?.parts),
      paintPixels: Array.from(normalizePaintPixels(parsed?.paintPixels)),
      layerBitmaps: normalizeLayerBitmapsPayload(parsed?.layerBitmaps).map((entry) => ({
        layerId: entry.layerId,
        file: entry.file,
        pixels: Array.from(entry.pixels)
      })),
      activeLayerId: String(parsed?.activeLayerId ?? ""),
      selectedLayerIds: Array.isArray(parsed?.selectedLayerIds) ? parsed.selectedLayerIds : [],
      updatedAt: Number(parsed?.updatedAt ?? Date.now())
    };
  } catch {
    return null;
  }
}

function writeFallbackProjectState(projectId, snapshot) {
  if (!projectId || !snapshot) {
    return;
  }
  localStorage.setItem(fallbackProjectStateKey(projectId), serializeSnapshot(snapshot));
}

function readFallbackAutosaveState(projectId) {
  if (!projectId) {
    return null;
  }
  try {
    const raw = localStorage.getItem(fallbackAutosaveStateKey(projectId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return {
      name: String(parsed?.name ?? "Untitled Project"),
      armType: normalizeArmType(parsed?.armType),
      layers: normalizeEditorLayers(parsed?.layers),
      parts: normalizePartsState(parsed?.parts),
      paintPixels: Array.from(normalizePaintPixels(parsed?.paintPixels)),
      layerBitmaps: normalizeLayerBitmapsPayload(parsed?.layerBitmaps).map((entry) => ({
        layerId: entry.layerId,
        file: entry.file,
        pixels: Array.from(entry.pixels)
      })),
      activeLayerId: String(parsed?.activeLayerId ?? ""),
      selectedLayerIds: Array.isArray(parsed?.selectedLayerIds) ? parsed.selectedLayerIds : [],
      updatedAt: Number(parsed?.updatedAt ?? Date.now())
    };
  } catch {
    return null;
  }
}

function writeFallbackAutosaveState(projectId, snapshot) {
  if (!projectId || !snapshot) {
    return;
  }
  localStorage.setItem(fallbackAutosaveStateKey(projectId), serializeSnapshot(snapshot));
}

function clearFallbackAutosaveState(projectId) {
  if (!projectId) {
    return;
  }
  localStorage.removeItem(fallbackAutosaveStateKey(projectId));
}

function updateFallbackStateName(key, nextName) {
  if (!key) {
    return;
  }
  const raw = localStorage.getItem(key);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    parsed.name = String(nextName ?? "").trim() || "Untitled Project";
    parsed.updatedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    // ignore malformed fallback state
  }
}

function normalizeLayerKind(kind) {
  return String(kind ?? "").toLowerCase() === "guide" ? "guide" : "paint";
}

function normalizeBlendMode(blendMode) {
  return String(blendMode ?? "").toLowerCase() === "multiply" ? "multiply" : "normal";
}

function applyPartControlValue(partState, control, value) {
  if (!partState) {
    return;
  }

  if (control === "base") {
    partState.baseLock = value;
    return;
  }
  if (control === "outer") {
    partState.outerLock = value;
    return;
  }
  if (control === "baseVisibility") {
    partState.baseVisibility = value;
    return;
  }
  if (control === "outerVisibility") {
    partState.outerVisibility = value;
  }
}

async function loadInitialProject() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("projectId");

  if (!projectId) {
    showToast("No project selected. Returning to Projects...", 1400);
    window.setTimeout(() => {
      navigateToLibrary();
    }, 500);
    return;
  }

  const loaded = await loadProjectById(projectId);
  if (!loaded) {
    showToast("Project could not be loaded. Returning to Projects...", 1600);
    window.setTimeout(() => {
      navigateToLibrary();
    }, 700);
    return;
  }

  await hydrateEditorFromLoadedState(loaded, { allowRecoveryPrompt: true });
  resetViewportPose({ resetZoom: true });
  setActiveTool("pencil", { announce: false });
  startAutosaveTimer();
  queueEditorCanvasFitAndRender();
  void refreshRecentProjectsForFileMenu();
  showToast(`Opened ${state.activeProject?.name ?? "project"}.`);
}

async function loadProjectById(projectId) {
  if (hasTauriBackend) {
    try {
      const loaded = await invokeBackend("load_internal_project", { id: projectId });
      let autosave = null;
      try {
        const rawAutosave = await invokeBackend("load_internal_autosave", { id: projectId });
        autosave = rawAutosave
          ? {
              updatedAt: Number(rawAutosave.updatedAt ?? Date.now()),
              project: rawAutosave.project ?? null,
              paintPixels: normalizePaintPixels(rawAutosave.paintPixels),
              layerBitmaps: normalizeLayerBitmapsPayload(rawAutosave.layerBitmaps)
            }
          : null;
      } catch (autosaveError) {
        console.error(autosaveError);
      }
      return {
        summary: normalizeProjectSummary(loaded.summary),
        project: loaded.project ?? null,
        paintPixels: normalizePaintPixels(loaded.paintPixels),
        layerBitmaps: normalizeLayerBitmapsPayload(loaded.layerBitmaps),
        autosave
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const fallbackProjects = readFallbackProjects();
  const project = fallbackProjects.find((item) => item.id === projectId);
  if (!project) {
    return null;
  }

  const savedState =
    readFallbackProjectState(projectId) ??
    createDefaultProjectState({
      name: project.name,
      armType: normalizeArmType(project.armType)
    });
  const autosaveState = readFallbackAutosaveState(projectId);

  return {
    summary: normalizeProjectSummary(project),
    project: {
      format: "qse",
      version: 2,
      name: savedState.name,
      armType: savedState.armType,
      layers: savedState.layers,
      parts: savedState.parts
    },
    paintPixels: normalizePaintPixels(savedState.paintPixels),
    layerBitmaps: normalizeLayerBitmapsPayload(savedState.layerBitmaps),
    autosave: autosaveState
      ? {
          updatedAt: Number(autosaveState.updatedAt ?? Date.now()),
          project: {
            format: "qse",
            version: 2,
            name: autosaveState.name,
            armType: autosaveState.armType,
            layers: autosaveState.layers,
            parts: autosaveState.parts
          },
          paintPixels: normalizePaintPixels(autosaveState.paintPixels),
          layerBitmaps: normalizeLayerBitmapsPayload(autosaveState.layerBitmaps)
        }
      : null
  };
}

function readFallbackProjects() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => normalizeProjectSummary(entry))
      .filter((entry) => entry.id.trim().length > 0);
  } catch {
    return [];
  }
}

function updateProjectChip() {
  if (!projectNameChipEl) {
    updateStatusBar();
    return;
  }

  const name = state.activeProject?.name?.trim() || "No Project";
  projectNameChipEl.textContent = name;
  updateStatusBar();
}

function navigateToLibrary() {
  stopAutosaveTimer();
  const nextUrl = new URL("./library.html", window.location.href);
  window.location.href = nextUrl.toString();
}

async function syncGuideTemplateForProject(armType, resetVisibility = false) {
  const guideLayer = getGuideLayer();
  if (resetVisibility && guideLayer) {
    guideLayer.visible = true;
  }

  const normalizedArmType = normalizeArmType(armType);
  editor.guideArmType = normalizedArmType;
  const loaded = await loadGuideTemplateForArmType(normalizedArmType);
  renderLayersPanel();
  renderPixelCanvas();
  queueViewportRender();

  if (!loaded) {
    const missingName = normalizedArmType === "slim" ? "slim template PNG" : "wide template PNG";
    showToast(`Template PNG missing: ${missingName}`, 1800);
  }
}

async function loadGuideTemplateForArmType(armType) {
  const normalizedArmType = normalizeArmType(armType);
  const loadToken = ++editor.guideLoadToken;
  const sources = GUIDE_TEMPLATE_SOURCES[normalizedArmType] ?? GUIDE_TEMPLATE_SOURCES.classic;

  editor.guideImage = null;
  for (const source of sources) {
    try {
      const image = await loadImageFromUrl(source);
      if (loadToken !== editor.guideLoadToken) {
        return false;
      }
      editor.guideImage = image;
      return true;
    } catch {
      // Try next source.
    }
  }

  if (loadToken === editor.guideLoadToken) {
    editor.guideImage = null;
  }
  return false;
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image at ${url}`));
    image.src = url;
  });
}

function queueEditorCanvasFitAndRender() {
  window.requestAnimationFrame(() => {
    applySplitLayout();
    if (autoFitColorPanelHeightOnStartup()) {
      applySplitLayout();
    }
    fitCanvasToStage({ force: true, resetPan: true });
    renderPixelCanvas();

    // A second frame catches any final grid/layout settle after the first paint.
    window.requestAnimationFrame(() => {
      applySplitLayout();
      if (autoFitColorPanelHeightOnStartup()) {
        applySplitLayout();
      }
      fitCanvasToStage({ force: true, resetPan: true });
      renderPixelCanvas();
    });
  });
}

function fitCanvasToStage(options = {}) {
  const { force = false, resetPan = false } = options;
  const stageSize = getCanvasStageAvailableSize();
  if (!stageSize) {
    return false;
  }

  const fitByWidth = Math.floor(stageSize.width / TEXTURE_SIZE);
  const fitByHeight = Math.floor(stageSize.height / TEXTURE_SIZE);
  const nextZoom = clamp(Math.min(fitByWidth, fitByHeight), MIN_CANVAS_ZOOM, MAX_CANVAS_ZOOM);
  if (!Number.isFinite(nextZoom)) {
    return false;
  }

  if (!force && nextZoom === editor.zoom) {
    return false;
  }

  editor.zoom = nextZoom;
  if (resetPan) {
    editor.panX = 0;
    editor.panY = 0;
  }
  return true;
}

function getCanvasStageAvailableSize() {
  if (!canvasStageEl) {
    return null;
  }

  const stageRect = canvasStageEl.getBoundingClientRect();
  if (stageRect.width <= 0 || stageRect.height <= 0) {
    return null;
  }

  const style = window.getComputedStyle(canvasStageEl);
  const padX = Number.parseFloat(style.paddingLeft || "0") + Number.parseFloat(style.paddingRight || "0");
  const padY = Number.parseFloat(style.paddingTop || "0") + Number.parseFloat(style.paddingBottom || "0");
  const borderX =
    Number.parseFloat(style.borderLeftWidth || "0") + Number.parseFloat(style.borderRightWidth || "0");
  const borderY =
    Number.parseFloat(style.borderTopWidth || "0") + Number.parseFloat(style.borderBottomWidth || "0");

  return {
    width: Math.max(1, Math.floor(stageRect.width - padX - borderX)),
    height: Math.max(1, Math.floor(stageRect.height - padY - borderY))
  };
}

function normalizeViewportLightingMode(value) {
  return String(value ?? "").toLowerCase() === "shadow-preview" ? "shadow-preview" : "true-color";
}

function isToolBlockedInViewport(tool) {
  if (!editor.viewportHovering) {
    return false;
  }
  return tool === "fill" || tool === "select";
}

function maybeShowViewportToolBlockToast() {
  const now = Date.now();
  if (now - editor.viewportLastBlockToastAt < 900) {
    return;
  }
  editor.viewportLastBlockToastAt = now;
  showToast("Fill and Box Select are disabled while cursor is in 3D viewport.", 1200);
}

function updateViewportToolAvailability() {
  const blocked = editor.viewportHovering;
  document.querySelectorAll(".tool").forEach((button) => {
    const tool = button.dataset.tool;
    const isBlocked = blocked && (tool === "fill" || tool === "select");
    button.classList.toggle("is-context-disabled", isBlocked);
    button.disabled = isBlocked;
    button.setAttribute("aria-disabled", isBlocked ? "true" : "false");
  });
}

function setViewportHoverState(isHovering) {
  const next = isHovering === true;
  if (editor.viewportHovering === next) {
    return;
  }
  editor.viewportHovering = next;
  if (
    !next &&
    editor.viewportPointerId === null &&
    editor.viewportRotatePointerId === null &&
    editor.viewportPanPointerId === null
  ) {
    editor.viewportHoverSample = null;
    queueViewportRender();
  }
  updateToolUI();
  if (next && (editor.currentTool === "fill" || editor.currentTool === "select")) {
    setActiveTool("pencil", { announce: false });
    showToast("Auto-switched to Pencil (Fill/Select are 2D-only).", 1200);
  }
}

function resetViewportPose(options = {}) {
  const { resetZoom = true } = options;
  editor.viewportYaw = Math.PI;
  editor.viewportPitch = 0;
  editor.viewportOffsetX = 0;
  editor.viewportOffsetY = 0;
  editor.viewportRotatePointerId = null;
  editor.viewportPanPointerId = null;
  editor.viewportRotateBaseYaw = 0;
  editor.viewportRotateBasePitch = 0;
  editor.viewportPanBaseOffsetX = 0;
  editor.viewportPanBaseOffsetY = 0;
  editor.viewportRotateStartX = 0;
  editor.viewportRotateStartY = 0;
  editor.viewportPanStartX = 0;
  editor.viewportPanStartY = 0;
  if (resetZoom) {
    editor.viewportZoom = 1;
  }
  updateViewportCursor();
  queueViewportRender();
}

function updateTargetBadge(surface = "outer") {
  if (!targetBadgeEl) {
    return;
  }
  const normalized = surface === "base" ? "BASE" : "OUTER";
  targetBadgeEl.textContent = `TARGET: ${normalized}`;
}

function updateViewportGridToggleUi() {
  if (!viewportGridToggleBtnEl) {
    return;
  }
  viewportGridToggleBtnEl.setAttribute("aria-pressed", editor.viewportShowGrid ? "true" : "false");
  viewportGridToggleBtnEl.textContent = editor.viewportShowGrid ? "Grid: On" : "Grid: Off";
}

function snapViewportToAxis(axis, negative = false) {
  const sign = negative ? -1 : 1;
  const frontYaw = Math.PI;
  editor.viewportOffsetX = 0;
  editor.viewportOffsetY = 0;
  editor.viewportRotatePointerId = null;
  editor.viewportPanPointerId = null;
  editor.viewportRotateBaseYaw = 0;
  editor.viewportRotateBasePitch = 0;
  editor.viewportPanBaseOffsetX = 0;
  editor.viewportPanBaseOffsetY = 0;
  editor.viewportRotateStartX = 0;
  editor.viewportRotateStartY = 0;
  editor.viewportPanStartX = 0;
  editor.viewportPanStartY = 0;
  if (axis === "x") {
    editor.viewportYaw = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
    editor.viewportPitch = 0;
  } else if (axis === "y") {
    editor.viewportYaw = frontYaw;
    editor.viewportPitch = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else if (axis === "z") {
    editor.viewportYaw = sign > 0 ? frontYaw : 0;
    editor.viewportPitch = 0;
  } else {
    return;
  }
  updateViewportCursor();
  queueViewportRender();
  showToast(`Snapped to ${negative ? "-" : "+"}${axis.toUpperCase()}.`, 900);
}

function nudgeViewportRotation(deltaYaw = 0, deltaPitch = 0, announce = false) {
  const yawStep = Number(deltaYaw);
  const pitchStep = Number(deltaPitch);
  if (!Number.isFinite(yawStep) || !Number.isFinite(pitchStep)) {
    return false;
  }
  editor.viewportYaw = Number((editor.viewportYaw + yawStep).toFixed(4));
  editor.viewportPitch = clamp(Number((editor.viewportPitch + pitchStep).toFixed(4)), -1.2, 1.2);
  queueViewportRender();
  if (announce) {
    showToast("3D view rotated.", 900);
  }
  return true;
}

function nudgeViewportPan(deltaX = 0, deltaY = 0, announce = false) {
  const xStep = Number(deltaX);
  const yStep = Number(deltaY);
  if (!Number.isFinite(xStep) || !Number.isFinite(yStep)) {
    return false;
  }
  editor.viewportOffsetX = Number((editor.viewportOffsetX + xStep).toFixed(2));
  editor.viewportOffsetY = Number((editor.viewportOffsetY + yStep).toFixed(2));
  queueViewportRender();
  if (announce) {
    showToast("3D view panned.", 900);
  }
  return true;
}

function updateViewportCursor() {
  if (!viewportCanvasEl) {
    return;
  }

  if (editor.viewportPanPointerId !== null) {
    const cursor = getCursorForTool("grab", { grabbing: true });
    viewportCanvasEl.style.cursor = cursor;
    if (viewportCanvasWrapEl) {
      viewportCanvasWrapEl.style.cursor = cursor;
    }
    return;
  }
  if (editor.viewportRotatePointerId !== null) {
    const cursor = getCursorForTool("grab", { grabbing: true });
    viewportCanvasEl.style.cursor = cursor;
    if (viewportCanvasWrapEl) {
      viewportCanvasWrapEl.style.cursor = cursor;
    }
    return;
  }

  const tool = getEffectiveTool();
  const zoomOut = editor.currentTool === "zoom" && editor.altEyedropperActive;
  const cursor = getCursorForTool(tool, {
    zoomOut,
    grabbing: tool === "grab"
  });
  viewportCanvasEl.style.cursor = cursor;
  if (viewportCanvasWrapEl) {
    viewportCanvasWrapEl.style.cursor = cursor;
  }
}

function adjustViewportZoom(delta, announce = true) {
  const factor = delta > 0 ? 1.11 : 0.9;
  const next = clamp(Number((editor.viewportZoom * factor).toFixed(4)), 0.42, 4.5);
  if (next === editor.viewportZoom) {
    return false;
  }

  editor.viewportZoom = next;
  queueViewportRender();
  if (announce) {
    showToast(`3D zoom: ${Math.round(editor.viewportZoom * 100)}%`, 900);
  }
  return true;
}

function adjustViewportZoomByWheel(deltaY, announce = false) {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return false;
  }

  const direction = deltaY < 0 ? 1 : -1;
  const magnitude = clamp(Math.abs(deltaY), 0, 120);
  const normalized = magnitude / 120;
  const factor = 1 + normalized * 0.038;
  const next = clamp(
    editor.viewportZoom * (direction > 0 ? factor : 1 / factor),
    0.42,
    4.5
  );

  if (Math.abs(next - editor.viewportZoom) < 0.00005) {
    return false;
  }

  editor.viewportZoom = Number(next.toFixed(4));
  queueViewportRender();
  if (announce) {
    showToast(`3D zoom: ${Math.round(editor.viewportZoom * 100)}%`, 900);
  }
  return true;
}

function onViewportPointerDown(event) {
  if (state.view !== "editor") {
    return;
  }
  if (event.button !== 0) {
    return;
  }

  setViewportHoverState(true);
  if (event.shiftKey) {
    editor.viewportPanPointerId = event.pointerId;
    editor.viewportPanStartX = event.clientX;
    editor.viewportPanStartY = event.clientY;
    editor.viewportPanBaseOffsetX = editor.viewportOffsetX;
    editor.viewportPanBaseOffsetY = editor.viewportOffsetY;
    try {
      viewportCanvasEl.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    updateViewportCursor();
    event.preventDefault();
    return;
  }
  const tool = getEffectiveTool();
  const rotateWithModifier = event.metaKey || event.ctrlKey;
  if (tool === "grab" || rotateWithModifier) {
    editor.viewportRotatePointerId = event.pointerId;
    editor.viewportRotateStartX = event.clientX;
    editor.viewportRotateStartY = event.clientY;
    editor.viewportRotateBaseYaw = editor.viewportYaw;
    editor.viewportRotateBasePitch = editor.viewportPitch;
    try {
      viewportCanvasEl.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    updateViewportCursor();
    event.preventDefault();
    return;
  }

  if (tool === "zoom") {
    adjustViewportZoom(event.altKey ? -1 : 1, true);
    event.preventDefault();
    return;
  }

  const sample = getViewportPickAtClientPoint(event.clientX, event.clientY);
  if (!sample) {
    if (editor.viewportHoverSample) {
      editor.viewportHoverSample = null;
      queueViewportRender();
    }
    return;
  }
  editor.viewportHoverSample = sample;
  queueViewportRender();

  if (tool === "eyedropper") {
    sampleViewportColor(sample);
    event.preventDefault();
    return;
  }

  if (!isPaintTool(tool)) {
    maybeShowUnsupportedToolToast(tool);
    return;
  }

  const routing = resolve3dRoutingForSample(sample);
  if (!routing.allowed) {
    triggerLockFeedback(routing.blockers);
    showToast("Paint blocked by lock/visibility settings.", 1200);
    event.preventDefault();
    return;
  }

  updateTargetBadge(routing.targetSurface);
  const mapped = mapViewportSampleToSurface(sample, routing.targetSurface);
  if (!mapped) {
    return;
  }

  if (!beginViewportPaintStroke(event.pointerId, event.clientX, event.clientY, tool)) {
    return;
  }

  applyViewportPaintFromClientPath(event.clientX, event.clientY);
  event.preventDefault();
}

function onViewportPointerMove(event) {
  if (editor.viewportPanPointerId !== null) {
    if (event.pointerId !== editor.viewportPanPointerId) {
      return;
    }
    const dx = event.clientX - editor.viewportPanStartX;
    const dy = event.clientY - editor.viewportPanStartY;
    editor.viewportOffsetX = editor.viewportPanBaseOffsetX + dx;
    editor.viewportOffsetY = editor.viewportPanBaseOffsetY + dy;
    queueViewportRender();
    event.preventDefault();
    return;
  }

  if (editor.viewportRotatePointerId !== null) {
    if (event.pointerId !== editor.viewportRotatePointerId) {
      return;
    }
    const dx = event.clientX - editor.viewportRotateStartX;
    const dy = event.clientY - editor.viewportRotateStartY;
    editor.viewportYaw = editor.viewportRotateBaseYaw - dx * 0.0125;
    editor.viewportPitch = clamp(editor.viewportRotateBasePitch + dy * 0.0105, -1.2, 1.2);
    queueViewportRender();
    event.preventDefault();
    return;
  }

  const sample = getViewportPickAtClientPoint(event.clientX, event.clientY);
  const hadHoverSample = Boolean(editor.viewportHoverSample);
  editor.viewportHoverSample = sample ?? null;
  if (sample || hadHoverSample) {
    queueViewportRender();
  }
  if (sample) {
    const routing = resolve3dRoutingForSample(sample);
    if (routing.allowed) {
      updateTargetBadge(routing.targetSurface);
    }
  }

  if (editor.viewportPointerId === null || editor.viewportPointerId !== event.pointerId) {
    return;
  }

  applyViewportPaintFromClientPath(event.clientX, event.clientY);
  event.preventDefault();
}

function onViewportPointerUp(event) {
  if (editor.viewportPanPointerId !== null && event.pointerId === editor.viewportPanPointerId) {
    editor.viewportPanPointerId = null;
    try {
      viewportCanvasEl.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    updateViewportCursor();
    queueViewportRender();
    return;
  }

  if (editor.viewportRotatePointerId !== null && event.pointerId === editor.viewportRotatePointerId) {
    editor.viewportRotatePointerId = null;
    try {
      viewportCanvasEl.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    updateViewportCursor();
    queueViewportRender();
    return;
  }

  if (editor.viewportPointerId !== null && event.pointerId === editor.viewportPointerId) {
    editor.viewportPointerId = null;
    editor.viewportPaintTool = null;
    editor.viewportLastPaintPoint = null;
    editor.viewportLastClientX = 0;
    editor.viewportLastClientY = 0;
    finishActiveStroke();
    try {
      viewportCanvasEl.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }
    renderPixelCanvas();
    updateViewportCursor();
  }

  if (viewportCanvasEl && event && typeof event.clientX === "number" && typeof event.clientY === "number") {
    const rect = viewportCanvasEl.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientY >= rect.top &&
      event.clientX < rect.right &&
      event.clientY < rect.bottom;
    if (!inside) {
      setViewportHoverState(false);
    }
  }
}

function beginViewportPaintStroke(pointerId, startClientX, startClientY, tool) {
  const activeLayer = getActivePaintLayer();
  if (!activeLayer) {
    showToast("No active paint layer.");
    return false;
  }
  if (activeLayer.locked) {
    showToast("Active layer is locked.");
    return false;
  }

  ensureLayerPixels(activeLayer.id);
  editor.pixels = editor.paintLayerPixelsById[activeLayer.id];
  editor.isPointerDown = true;
  editor.pointerId = pointerId;
  editor.lastPoint = null;
  editor.pendingStrokeLayerId = activeLayer.id;
  editor.pendingStrokeBefore = new Uint8ClampedArray(editor.pixels);
  editor.strokeBasePixels = editor.pendingStrokeBefore;
  editor.strokeVisited = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE);
  editor.strokeChanged = false;
  editor.viewportPointerId = pointerId;
  editor.viewportLastPaintPoint = null;
  editor.viewportLastClientX = Number.isFinite(startClientX) ? startClientX : 0;
  editor.viewportLastClientY = Number.isFinite(startClientY) ? startClientY : 0;
  editor.viewportPaintTool = tool;
  try {
    viewportCanvasEl?.setPointerCapture(pointerId);
  } catch {
    // no-op
  }
  return true;
}

function applyViewportPaintFromClientPath(clientX, clientY) {
  if (!editor.isPointerDown || editor.viewportPointerId === null || !editor.viewportPaintTool) {
    return;
  }

  const startX = Number.isFinite(editor.viewportLastClientX) ? editor.viewportLastClientX : clientX;
  const startY = Number.isFinite(editor.viewportLastClientY) ? editor.viewportLastClientY : clientY;
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;
  const distance = Math.hypot(deltaX, deltaY);
  const steps = Math.max(1, Math.ceil(distance / 1.5));
  let changed = false;

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const sampleX = startX + deltaX * t;
    const sampleY = startY + deltaY * t;
    const sample = getViewportPickAtClientPoint(sampleX, sampleY);
    if (!sample) {
      continue;
    }

    const routing = resolve3dRoutingForSample(sample);
    if (!routing.allowed) {
      continue;
    }

    const mapped = mapViewportSampleToSurface(sample, routing.targetSurface);
    if (!mapped) {
      continue;
    }

    if (applyBrushAt(mapped.x, mapped.y, editor.viewportPaintTool)) {
      changed = true;
    }
    editor.viewportLastPaintPoint = { x: mapped.x, y: mapped.y };
    editor.lastPoint = { x: mapped.x, y: mapped.y };
    updateTargetBadge(routing.targetSurface);
  }

  if (changed) {
    editor.strokeChanged = true;
    syncTextureCanvas();
    renderPixelCanvas();
  }

  editor.viewportLastClientX = clientX;
  editor.viewportLastClientY = clientY;
}

function getPartStateByName(partName) {
  if (!partName) {
    return null;
  }
  return editor.partsState.find((part) => part.part === partName) ?? null;
}

function resolve3dRoutingForSample(sample) {
  const tri = sample?.triangle;
  if (!tri) {
    return { allowed: false, blockers: [] };
  }
  const partState = getPartStateByName(tri.part);
  if (!partState) {
    return { allowed: false, blockers: [] };
  }

  const canBase = partState.baseVisibility && !partState.baseLock;
  const canOuter = partState.outerVisibility && !partState.outerLock;
  const prefersOuter = tri.surface === "base" || tri.surface === "outer";
  let targetSurface = null;

  if (partState.outerLock && canBase) {
    targetSurface = "base";
  } else if (prefersOuter && canOuter) {
    targetSurface = "outer";
  } else if (canBase) {
    targetSurface = "base";
  } else if (canOuter) {
    targetSurface = "outer";
  }

  if (targetSurface) {
    return {
      allowed: true,
      targetSurface,
      blockers: []
    };
  }

  const blockers = [];
  if (!partState.outerVisibility) {
    blockers.push({ part: tri.part, control: "outerVisibility", message: `Show Outer (${tri.part})` });
  }
  if (partState.outerLock) {
    blockers.push({ part: tri.part, control: "outer", message: `Unlock Outer (${tri.part})` });
  }
  if (!partState.baseVisibility) {
    blockers.push({ part: tri.part, control: "baseVisibility", message: `Show Base (${tri.part})` });
  }
  if (partState.baseLock) {
    blockers.push({ part: tri.part, control: "base", message: `Unlock Base (${tri.part})` });
  }

  return {
    allowed: false,
    targetSurface: null,
    blockers
  };
}

function mapViewportSampleToSurface(sample, targetSurface) {
  const tri = sample?.triangle;
  if (!tri) {
    return null;
  }

  let targetU = sample.u;
  let targetV = sample.v;
  let usedDirectSurfacePick = false;
  if (targetSurface === "base") {
    const partState = getPartStateByName(tri.part);
    const pickIndex = Number.isInteger(sample?.pickIndex) ? sample.pickIndex : -1;
    if (
      partState?.outerLock === true &&
      pickIndex >= 0 &&
      pickIndex < editor.viewportPickBaseTriangles.length &&
      pickIndex < editor.viewportPickBaseU.length &&
      pickIndex < editor.viewportPickBaseV.length
    ) {
      const baseTriIndex = editor.viewportPickBaseTriangles[pickIndex];
      if (baseTriIndex >= 0) {
        const baseTri = editor.viewportModel?.triangles?.[baseTriIndex];
        if (baseTri && baseTri.surface === "base" && baseTri.part === tri.part) {
          targetU = editor.viewportPickBaseU[pickIndex];
          targetV = editor.viewportPickBaseV[pickIndex];
          usedDirectSurfacePick = true;
        }
      }
    }
  }
  if (tri.surface !== targetSurface && !usedDirectSurfacePick) {
    const counterpart = getViewportTriangleByPartSurfaceSlot(tri.part, targetSurface, tri.surfaceSlot);
    if (counterpart) {
      const weights = barycentricOnUv(
        sample.u,
        sample.v,
        tri.uv1.u,
        tri.uv1.v,
        tri.uv2.u,
        tri.uv2.v,
        tri.uv3.u,
        tri.uv3.v
      );
      if (weights) {
        targetU = weights.w1 * counterpart.uv1.u + weights.w2 * counterpart.uv2.u + weights.w3 * counterpart.uv3.u;
        targetV = weights.w1 * counterpart.uv1.v + weights.w2 * counterpart.uv2.v + weights.w3 * counterpart.uv3.v;
      }
    }
  }

  const x = clamp(Math.floor(clamp(targetU, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  const y = clamp(Math.floor((1 - clamp(targetV, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  return { x, y, u: targetU, v: targetV };
}

function barycentricOnUv(px, py, ax, ay, bx, by, cx, cy) {
  const denominator = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }
  const w1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denominator;
  const w2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denominator;
  const w3 = 1 - w1 - w2;
  return { w1, w2, w3 };
}

function getViewportTriangleByPartSurfaceSlot(part, surface, slot) {
  const key = `${part}:${surface}:${slot}`;
  const model = editor.viewportModel;
  if (!model) {
    return null;
  }
  const triIndex = model.surfaceLookup.get(key);
  if (typeof triIndex !== "number") {
    return null;
  }
  return model.triangles[triIndex] ?? null;
}

function sampleCompositeColorAtUv(texturePixels, u, v) {
  if (!texturePixels || texturePixels.length < TEXTURE_SIZE * TEXTURE_SIZE * 4) {
    return null;
  }
  const x = clamp(Math.floor(clamp(u, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  const y = clamp(Math.floor((1 - clamp(v, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
  const idx = (y * TEXTURE_SIZE + x) * 4;
  return {
    r: texturePixels[idx],
    g: texturePixels[idx + 1],
    b: texturePixels[idx + 2],
    a: texturePixels[idx + 3]
  };
}

function sampleViewportColor(sample) {
  const tri = sample?.triangle;
  if (!tri) {
    return;
  }
  let texturePixels = editor.viewportLastCompositePixels;
  if (!texturePixels || texturePixels.length < TEXTURE_SIZE * TEXTURE_SIZE * 4) {
    texturePixels = composeVisibleLayersToPixelsForViewport();
  }
  let sampled = sampleCompositeColorAtUv(texturePixels, sample.u, sample.v);
  if (!sampled) {
    return;
  }

  // If the front-most shell pixel is fully transparent, sample what is underneath it.
  if (sampled.a === 0 && tri.surface === "outer") {
    const mappedBase = mapViewportSampleToSurface(sample, "base");
    if (mappedBase) {
      const through = sampleCompositeColorAtUv(texturePixels, mappedBase.u, mappedBase.v);
      if (through) {
        sampled = through;
      }
    }
  }

  setBrushColorFromRgba(sampled.r, sampled.g, sampled.b, sampled.a, { writeHex: true });
  showToast(`Sampled ${formatHexRgba(sampled.r, sampled.g, sampled.b, sampled.a)}`, 900);
}

function getViewportPickAtClientPoint(clientX, clientY) {
  if (!viewportCanvasEl || !editor.viewportModel) {
    return null;
  }
  const rect = viewportCanvasEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height) {
    return null;
  }

  const px = clamp(Math.floor((localX / rect.width) * editor.viewportPickWidth), 0, editor.viewportPickWidth - 1);
  const py = clamp(Math.floor((localY / rect.height) * editor.viewportPickHeight), 0, editor.viewportPickHeight - 1);
  if (editor.viewportPickWidth <= 0 || editor.viewportPickHeight <= 0) {
    return null;
  }
  const idx = py * editor.viewportPickWidth + px;
  const triIndex = editor.viewportPickTriangles[idx];
  if (typeof triIndex !== "number" || triIndex < 0) {
    return null;
  }
  const triangle = editor.viewportModel.triangles[triIndex];
  if (!triangle) {
    return null;
  }
  return {
    triangle,
    u: editor.viewportPickU[idx],
    v: editor.viewportPickV[idx],
    pickIndex: idx
  };
}

function queueViewportRender() {
  if (!viewportCanvasEl || !editor.viewportCtx || state.view !== "editor") {
    return;
  }
  if (editor.viewportRenderQueued) {
    return;
  }
  editor.viewportRenderQueued = true;
  window.requestAnimationFrame(async () => {
    editor.viewportRenderQueued = false;
    if (editor.viewportRenderInFlight) {
      queueViewportRender();
      return;
    }
    editor.viewportRenderInFlight = true;
    try {
      await renderViewport();
    } finally {
      editor.viewportRenderInFlight = false;
    }
  });
}

async function ensureViewportModelForArmType(armType) {
  const normalizedArmType = normalizeArmType(armType);
  if (editor.viewportModel && editor.viewportArmType === normalizedArmType) {
    return true;
  }
  if (editor.viewportModelCache[normalizedArmType]) {
    editor.viewportModel = editor.viewportModelCache[normalizedArmType];
    editor.viewportArmType = normalizedArmType;
    return true;
  }

  const loaded = await loadViewportModelForArmType(normalizedArmType);
  if (!loaded) {
    return false;
  }
  editor.viewportModelCache[normalizedArmType] = loaded;
  editor.viewportModel = loaded;
  editor.viewportArmType = normalizedArmType;
  return true;
}

async function loadViewportModelForArmType(armType) {
  const normalizedArmType = normalizeArmType(armType);
  const sources = VIEWPORT_MODEL_SOURCES[normalizedArmType] ?? VIEWPORT_MODEL_SOURCES.classic;
  for (const source of sources) {
    try {
      const text = await fetchTextFromCandidates(source);
      if (!text) {
        continue;
      }
      const parsed = parseObjModel(text);
      if (parsed && parsed.triangles.length > 0) {
        return parsed;
      }
    } catch {
      // Try next source
    }
  }
  return null;
}

async function fetchTextFromCandidates(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${url}`);
  }
  return response.text();
}

function parseObjModel(objText) {
  const vertices = [];
  const uvs = [];
  const rawTriangles = [];
  let currentObjectName = "";
  const objectTriangleCounts = new Map();

  const lines = String(objText ?? "").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("o ")) {
      currentObjectName = line.slice(2).trim();
      if (!objectTriangleCounts.has(currentObjectName)) {
        objectTriangleCounts.set(currentObjectName, 0);
      }
      continue;
    }

    if (line.startsWith("v ")) {
      const parts = line.split(/\s+/);
      const x = Number(parts[1] ?? 0);
      const y = Number(parts[2] ?? 0);
      const z = Number(parts[3] ?? 0);
      vertices.push({ x, y, z });
      continue;
    }

    if (line.startsWith("vt ")) {
      const parts = line.split(/\s+/);
      const u = Number(parts[1] ?? 0);
      const v = Number(parts[2] ?? 0);
      uvs.push({ u, v });
      continue;
    }

    if (!line.startsWith("f ")) {
      continue;
    }

    const meta = mapModelObjectMeta(currentObjectName);
    if (!meta) {
      continue;
    }

    const refs = line
      .slice(2)
      .trim()
      .split(/\s+/)
      .map(parseObjFaceRef)
      .filter(Boolean);
    if (refs.length < 3) {
      continue;
    }

    for (let i = 1; i < refs.length - 1; i += 1) {
      const triRefs = [refs[0], refs[i], refs[i + 1]];
      const slot = objectTriangleCounts.get(currentObjectName) ?? 0;
      objectTriangleCounts.set(currentObjectName, slot + 1);
      rawTriangles.push({
        part: meta.part,
        surface: meta.surface,
        surfaceSlot: slot,
        refs: triRefs
      });
    }
  }

  if (!rawTriangles.length) {
    return {
      triangles: [],
      surfaceLookup: new Map()
    };
  }

  const usedVertices = [];
  for (const tri of rawTriangles) {
    for (const ref of tri.refs) {
      const vertex = vertices[ref.vertexIndex];
      if (vertex) {
        usedVertices.push(vertex);
      }
    }
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const vertex of usedVertices) {
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
    maxZ = Math.max(maxZ, vertex.z);
  }

  const center = {
    x: (minX + maxX) * 0.5,
    y: (minY + maxY) * 0.5,
    z: (minZ + maxZ) * 0.5
  };
  const maxDimension = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
  const normalizeScale = 1 / maxDimension;

  const triangles = [];
  const surfaceLookup = new Map();
  for (let triIndex = 0; triIndex < rawTriangles.length; triIndex += 1) {
    const rawTri = rawTriangles[triIndex];
    const v1 = vertices[rawTri.refs[0].vertexIndex];
    const v2 = vertices[rawTri.refs[1].vertexIndex];
    const v3 = vertices[rawTri.refs[2].vertexIndex];
    if (!v1 || !v2 || !v3) {
      continue;
    }
    const uv1 = uvs[rawTri.refs[0].uvIndex] ?? { u: 0, v: 0 };
    const uv2 = uvs[rawTri.refs[1].uvIndex] ?? { u: 0, v: 0 };
    const uv3 = uvs[rawTri.refs[2].uvIndex] ?? { u: 0, v: 0 };

    const p1 = {
      x: (v1.x - center.x) * normalizeScale,
      y: (v1.y - center.y) * normalizeScale,
      z: (v1.z - center.z) * normalizeScale
    };
    const p2 = {
      x: (v2.x - center.x) * normalizeScale,
      y: (v2.y - center.y) * normalizeScale,
      z: (v2.z - center.z) * normalizeScale
    };
    const p3 = {
      x: (v3.x - center.x) * normalizeScale,
      y: (v3.y - center.y) * normalizeScale,
      z: (v3.z - center.z) * normalizeScale
    };

    const edge1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
    const edge2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
    const normal = normalizeVec3(crossVec3(edge1, edge2));

    const triangle = {
      index: triangles.length,
      part: rawTri.part,
      partCode: PART_NAMES.indexOf(rawTri.part),
      surface: rawTri.surface,
      surfaceSlot: rawTri.surfaceSlot,
      p1,
      p2,
      p3,
      uv1,
      uv2,
      uv3,
      normal
    };
    triangles.push(triangle);
    surfaceLookup.set(`${triangle.part}:${triangle.surface}:${triangle.surfaceSlot}`, triangle.index);
  }

  return {
    triangles,
    surfaceLookup
  };
}

function parseObjFaceRef(token) {
  if (!token) {
    return null;
  }
  const [vertexRaw, uvRaw] = token.split("/");
  const vertexIndex = Number.parseInt(vertexRaw ?? "0", 10);
  const uvIndex = Number.parseInt(uvRaw ?? "0", 10);
  if (!Number.isFinite(vertexIndex) || vertexIndex <= 0) {
    return null;
  }
  return {
    vertexIndex: vertexIndex - 1,
    uvIndex: Number.isFinite(uvIndex) && uvIndex > 0 ? uvIndex - 1 : -1
  };
}

function mapModelObjectMeta(name) {
  if (!name) {
    return null;
  }
  const entries = Object.entries(VIEWPORT_OBJECT_TO_PART_SURFACE);
  const lower = String(name).trim().toLowerCase();
  for (const [key, value] of entries) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  return null;
}

function ensureViewportCanvasSize() {
  if (!viewportCanvasEl || !viewportCanvasWrapEl) {
    return { width: 0, height: 0 };
  }
  const rect = viewportCanvasWrapEl.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.floor(rect.width));
  const cssHeight = Math.max(1, Math.floor(rect.height));
  // Keep drawing/erasing stationary: only lower render scale while manipulating camera pose.
  const isViewManipulation = editor.viewportRotatePointerId !== null || editor.viewportPanPointerId !== null;
  const interactionQuality = isViewManipulation ? 0.72 : 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * interactionQuality;
  const width = Math.max(1, Math.floor(cssWidth * dpr));
  const height = Math.max(1, Math.floor(cssHeight * dpr));
  if (viewportCanvasEl.width !== width || viewportCanvasEl.height !== height) {
    viewportCanvasEl.width = width;
    viewportCanvasEl.height = height;
  }
  viewportCanvasEl.style.width = `${cssWidth}px`;
  viewportCanvasEl.style.height = `${cssHeight}px`;
  return { width, height };
}

async function renderViewport() {
  if (!viewportCanvasEl || !editor.viewportCtx || state.view !== "editor") {
    return;
  }

  const armType = normalizeArmType(state.activeProject?.armType);
  const loaded = await ensureViewportModelForArmType(armType);
  const { width, height } = ensureViewportCanvasSize();
  if (width <= 0 || height <= 0) {
    return;
  }

  const ctx = editor.viewportCtx;
  const imageData = ctx.createImageData(width, height);
  const frame = imageData.data;
  const pixelCount = width * height;
  const nearDepth = new Float32Array(pixelCount);
  const secondDepth = new Float32Array(pixelCount);
  nearDepth.fill(Number.POSITIVE_INFINITY);
  secondDepth.fill(Number.POSITIVE_INFINITY);
  const nearRgba = new Uint8ClampedArray(pixelCount * 4);
  const secondRgba = new Uint8ClampedArray(pixelCount * 4);
  const nearTri = new Int32Array(pixelCount);
  const secondTri = new Int32Array(pixelCount);
  nearTri.fill(-1);
  secondTri.fill(-1);
  const pickTri = new Int32Array(pixelCount);
  pickTri.fill(-1);
  const pickDepth = new Float32Array(pixelCount);
  pickDepth.fill(Number.POSITIVE_INFINITY);
  const pickU = new Float32Array(pixelCount);
  const pickV = new Float32Array(pixelCount);
  const pickBaseTri = new Int32Array(pixelCount);
  pickBaseTri.fill(-1);
  const pickBaseDepth = new Float32Array(pixelCount);
  pickBaseDepth.fill(Number.POSITIVE_INFINITY);
  const pickBaseU = new Float32Array(pixelCount);
  const pickBaseV = new Float32Array(pixelCount);
  const pickOuterTri = new Int32Array(pixelCount);
  pickOuterTri.fill(-1);
  const pickOuterDepth = new Float32Array(pixelCount);
  pickOuterDepth.fill(Number.POSITIVE_INFINITY);
  const pickOuterU = new Float32Array(pixelCount);
  const pickOuterV = new Float32Array(pixelCount);

  const texturePixels = composeVisibleLayersToPixelsForViewport();
  editor.viewportLastCompositePixels = texturePixels;

  if (!loaded || !editor.viewportModel || !editor.viewportModel.triangles.length) {
    drawViewportFallback(frame, width, height);
    ctx.putImageData(imageData, 0, 0);
    editor.viewportPickWidth = width;
    editor.viewportPickHeight = height;
    editor.viewportPickTriangles = pickTri;
    editor.viewportPickU = pickU;
    editor.viewportPickV = pickV;
    editor.viewportPickBaseTriangles = pickBaseTri;
    editor.viewportPickBaseU = pickBaseU;
    editor.viewportPickBaseV = pickBaseV;
    editor.viewportPickOuterTriangles = pickOuterTri;
    editor.viewportPickOuterU = pickOuterU;
    editor.viewportPickOuterV = pickOuterV;
    return;
  }

  const cameraDistance = 3.15;
  const focal = Math.min(width, height) * 0.92;
  const scale = 2.2 * editor.viewportZoom;
  const canvasRect = viewportCanvasEl.getBoundingClientRect();
  const cssToBufferX = canvasRect.width > 0 ? width / canvasRect.width : 1;
  const cssToBufferY = canvasRect.height > 0 ? height / canvasRect.height : 1;
  const centerX = width * 0.5 + editor.viewportOffsetX * cssToBufferX;
  const centerY = height * 0.5 + editor.viewportOffsetY * cssToBufferY;
  const lightDirection = normalizeVec3({ x: 0.08, y: 0.52, z: 0.85 });
  const useShading = editor.viewportLightingMode === "shadow-preview";

  for (const tri of editor.viewportModel.triangles) {
    const partState = getPartStateByName(tri.part);
    if (!partState) {
      continue;
    }
    if (tri.surface === "base" && !partState.baseVisibility) {
      continue;
    }
    if (tri.surface === "outer" && !partState.outerVisibility) {
      continue;
    }

    const p1 = rotatePointYawPitch(tri.p1, editor.viewportYaw, editor.viewportPitch);
    const p2 = rotatePointYawPitch(tri.p2, editor.viewportYaw, editor.viewportPitch);
    const p3 = rotatePointYawPitch(tri.p3, editor.viewportYaw, editor.viewportPitch);
    const n = normalizeVec3(rotatePointYawPitch(tri.normal, editor.viewportYaw, editor.viewportPitch));
    const center = {
      x: (p1.x + p2.x + p3.x) / 3,
      y: (p1.y + p2.y + p3.y) / 3,
      z: (p1.z + p2.z + p3.z) / 3
    };
    const viewVec = normalizeVec3({
      x: -center.x,
      y: -center.y,
      z: cameraDistance - center.z
    });
    if (dotVec3(n, viewVec) <= 1e-6) {
      continue;
    }
    const shade = useShading ? clamp(0.34 + Math.max(0, dotVec3(n, lightDirection)) * 0.66, 0.24, 1) : 1;

    const viewZ1 = cameraDistance - p1.z;
    const viewZ2 = cameraDistance - p2.z;
    const viewZ3 = cameraDistance - p3.z;
    if (viewZ1 <= 0.05 || viewZ2 <= 0.05 || viewZ3 <= 0.05) {
      continue;
    }

    const sx1 = centerX + (p1.x * scale * focal) / viewZ1;
    const sy1 = centerY - (p1.y * scale * focal) / viewZ1;
    const sx2 = centerX + (p2.x * scale * focal) / viewZ2;
    const sy2 = centerY - (p2.y * scale * focal) / viewZ2;
    const sx3 = centerX + (p3.x * scale * focal) / viewZ3;
    const sy3 = centerY - (p3.y * scale * focal) / viewZ3;

    const minX = clamp(Math.floor(Math.min(sx1, sx2, sx3)), 0, width - 1);
    const maxX = clamp(Math.ceil(Math.max(sx1, sx2, sx3)), 0, width - 1);
    const minY = clamp(Math.floor(Math.min(sy1, sy2, sy3)), 0, height - 1);
    const maxY = clamp(Math.ceil(Math.max(sy1, sy2, sy3)), 0, height - 1);
    if (maxX < minX || maxY < minY) {
      continue;
    }

    const denominator = (sy2 - sy3) * (sx1 - sx3) + (sx3 - sx2) * (sy1 - sy3);
    if (Math.abs(denominator) < 1e-9) {
      continue;
    }

    const invZ1 = 1 / viewZ1;
    const invZ2 = 1 / viewZ2;
    const invZ3 = 1 / viewZ3;

    for (let y = minY; y <= maxY; y += 1) {
      const py = y + 0.5;
      for (let x = minX; x <= maxX; x += 1) {
        const px = x + 0.5;
        const w1 = ((sy2 - sy3) * (px - sx3) + (sx3 - sx2) * (py - sy3)) / denominator;
        if (w1 < -1e-5 || w1 > 1.00001) {
          continue;
        }
        const w2 = ((sy3 - sy1) * (px - sx3) + (sx1 - sx3) * (py - sy3)) / denominator;
        if (w2 < -1e-5 || w2 > 1.00001) {
          continue;
        }
        const w3 = 1 - w1 - w2;
        if (w3 < -1e-5 || w3 > 1.00001) {
          continue;
        }

        const invZ = w1 * invZ1 + w2 * invZ2 + w3 * invZ3;
        if (invZ <= 0) {
          continue;
        }
        const depth = 1 / invZ;
        const depthForRender = depth + (tri.surface === "base" ? 0.00028 : 0);

        const u = (w1 * tri.uv1.u * invZ1 + w2 * tri.uv2.u * invZ2 + w3 * tri.uv3.u * invZ3) / invZ;
        const v = (w1 * tri.uv1.v * invZ1 + w2 * tri.uv2.v * invZ2 + w3 * tri.uv3.v * invZ3) / invZ;
        const texX = clamp(Math.floor(clamp(u, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
        const texY = clamp(Math.floor((1 - clamp(v, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
        const texIndex = (texY * TEXTURE_SIZE + texX) * 4;
        const srcA = texturePixels[texIndex + 3];
        const pixelIndex = y * width + x;
        const rgbaIndex = pixelIndex * 4;

        if (depthForRender < pickDepth[pixelIndex]) {
          pickDepth[pixelIndex] = depthForRender;
          pickTri[pixelIndex] = tri.index;
          pickU[pixelIndex] = u;
          pickV[pixelIndex] = v;
        }
        if (tri.surface === "base") {
          if (depth < pickBaseDepth[pixelIndex]) {
            pickBaseDepth[pixelIndex] = depth;
            pickBaseTri[pixelIndex] = tri.index;
            pickBaseU[pixelIndex] = u;
            pickBaseV[pixelIndex] = v;
          }
        } else if (tri.surface === "outer") {
          if (depth < pickOuterDepth[pixelIndex]) {
            pickOuterDepth[pixelIndex] = depth;
            pickOuterTri[pixelIndex] = tri.index;
            pickOuterU[pixelIndex] = u;
            pickOuterV[pixelIndex] = v;
          }
        }

        if (srcA <= 0) {
          continue;
        }

        const srcR = clampByte(Math.round(texturePixels[texIndex] * shade));
        const srcG = clampByte(Math.round(texturePixels[texIndex + 1] * shade));
        const srcB = clampByte(Math.round(texturePixels[texIndex + 2] * shade));

        if (depthForRender < nearDepth[pixelIndex]) {
          secondDepth[pixelIndex] = nearDepth[pixelIndex];
          secondTri[pixelIndex] = nearTri[pixelIndex];
          secondRgba[rgbaIndex] = nearRgba[rgbaIndex];
          secondRgba[rgbaIndex + 1] = nearRgba[rgbaIndex + 1];
          secondRgba[rgbaIndex + 2] = nearRgba[rgbaIndex + 2];
          secondRgba[rgbaIndex + 3] = nearRgba[rgbaIndex + 3];

          nearDepth[pixelIndex] = depthForRender;
          nearTri[pixelIndex] = tri.index;
          nearRgba[rgbaIndex] = srcR;
          nearRgba[rgbaIndex + 1] = srcG;
          nearRgba[rgbaIndex + 2] = srcB;
          nearRgba[rgbaIndex + 3] = srcA;
        } else if (depthForRender < secondDepth[pixelIndex]) {
          secondDepth[pixelIndex] = depthForRender;
          secondTri[pixelIndex] = tri.index;
          secondRgba[rgbaIndex] = srcR;
          secondRgba[rgbaIndex + 1] = srcG;
          secondRgba[rgbaIndex + 2] = srcB;
          secondRgba[rgbaIndex + 3] = srcA;
        }
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    const t = y / Math.max(1, height - 1);
    const bgRLine = Math.round(24 * (1 - t) + 13 * t);
    const bgGLine = Math.round(24 * (1 - t) + 14 * t);
    const bgBLine = Math.round(40 * (1 - t) + 26 * t);
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      const rgbaIndex = pixelIndex * 4;
      const checker = ((x >> 4) + (y >> 4)) & 1;
      let outR = bgRLine + (checker ? 4 : 0);
      let outG = bgGLine + (checker ? 4 : 0);
      let outB = bgBLine + (checker ? 5 : 0);

      const secondA = secondRgba[rgbaIndex + 3];
      const nearTriIndex = nearTri[pixelIndex];
      const secondTriIndex = secondTri[pixelIndex];
      const nearTriangle = nearTriIndex >= 0 ? editor.viewportModel.triangles[nearTriIndex] : null;
      const secondTriangle = secondTriIndex >= 0 ? editor.viewportModel.triangles[secondTriIndex] : null;
      let allowSecondLayer = secondA > 0;
      if (allowSecondLayer) {
        if (!nearTriangle || !secondTriangle) {
          allowSecondLayer = false;
        } else if (nearTriangle.surface === "outer") {
          allowSecondLayer =
            secondTriangle.surface === "base" && secondTriangle.part === nearTriangle.part;
        } else {
          allowSecondLayer = false;
        }
      }
      if (allowSecondLayer) {
        const blend = secondA / 255;
        outR = Math.round(secondRgba[rgbaIndex] * blend + outR * (1 - blend));
        outG = Math.round(secondRgba[rgbaIndex + 1] * blend + outG * (1 - blend));
        outB = Math.round(secondRgba[rgbaIndex + 2] * blend + outB * (1 - blend));
      }

      const nearA = nearRgba[rgbaIndex + 3];
      if (nearA > 0) {
        const blend = nearA / 255;
        outR = Math.round(nearRgba[rgbaIndex] * blend + outR * (1 - blend));
        outG = Math.round(nearRgba[rgbaIndex + 1] * blend + outG * (1 - blend));
        outB = Math.round(nearRgba[rgbaIndex + 2] * blend + outB * (1 - blend));
      }

      frame[rgbaIndex] = clampByte(outR);
      frame[rgbaIndex + 1] = clampByte(outG);
      frame[rgbaIndex + 2] = clampByte(outB);
      frame[rgbaIndex + 3] = 255;
    }
  }

  if (editor.viewportShowGrid) {
    drawViewportModelPixelGrid(
      frame,
      width,
      height,
      pickBaseTri,
      pickBaseU,
      pickBaseV,
      pickOuterTri,
      pickOuterU,
      pickOuterV
    );
  }
  drawViewportBrushOutlineFromPickMap(
    frame,
    width,
    height,
    pickBaseTri,
    pickBaseU,
    pickBaseV,
    pickOuterTri,
    pickOuterU,
    pickOuterV
  );

  ctx.putImageData(imageData, 0, 0);
  editor.viewportPickWidth = width;
  editor.viewportPickHeight = height;
  editor.viewportPickTriangles = pickTri;
  editor.viewportPickU = pickU;
  editor.viewportPickV = pickV;
  editor.viewportPickBaseTriangles = pickBaseTri;
  editor.viewportPickBaseU = pickBaseU;
  editor.viewportPickBaseV = pickBaseV;
  editor.viewportPickOuterTriangles = pickOuterTri;
  editor.viewportPickOuterU = pickOuterU;
  editor.viewportPickOuterV = pickOuterV;
}

async function buildLibraryModelPreviewPngBytes() {
  const canvas = await renderLibraryModelPreviewCanvas();
  if (!canvas) {
    return new Uint8Array(0);
  }

  if (typeof canvas.toBlob === "function") {
    const blob = await new Promise((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
    });
    if (blob instanceof Blob) {
      const buffer = await blob.arrayBuffer();
      return new Uint8Array(buffer);
    }
  }

  try {
    const dataUrl = canvas.toDataURL("image/png");
    const marker = "base64,";
    const markerIndex = dataUrl.indexOf(marker);
    if (markerIndex < 0) {
      return new Uint8Array(0);
    }
    const payload = dataUrl.slice(markerIndex + marker.length);
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch (error) {
    console.error(error);
    return new Uint8Array(0);
  }
}

async function renderLibraryModelPreviewCanvas() {
  const armType = normalizeArmType(state.activeProject?.armType);
  const loaded = await ensureViewportModelForArmType(armType);
  if (!loaded || !editor.viewportModel || !editor.viewportModel.triangles.length) {
    return null;
  }

  const width = 196;
  const height = 244;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }

  const imageData = ctx.createImageData(width, height);
  const frame = imageData.data;
  const pixelCount = width * height;
  const nearDepth = new Float32Array(pixelCount);
  const secondDepth = new Float32Array(pixelCount);
  nearDepth.fill(Number.POSITIVE_INFINITY);
  secondDepth.fill(Number.POSITIVE_INFINITY);
  const nearRgba = new Uint8ClampedArray(pixelCount * 4);
  const secondRgba = new Uint8ClampedArray(pixelCount * 4);
  const nearTri = new Int32Array(pixelCount);
  const secondTri = new Int32Array(pixelCount);
  nearTri.fill(-1);
  secondTri.fill(-1);

  const texturePixels = composePaintLayersToPixels(editor.layers);
  const cameraDistance = 3.15;
  const focal = Math.min(width, height) * 0.92;
  const previewZoom = 1.86;
  const scale = 2.2 * previewZoom;
  const centerX = width * 0.5;
  const centerY = height * 0.5 + 18;
  const previewYaw = Math.PI + 0.62;
  const previewPitch = 0.08;
  const lightDirection = normalizeVec3({ x: 0.08, y: 0.52, z: 0.85 });

  for (const tri of editor.viewportModel.triangles) {
    const partState = getPartStateByName(tri.part);
    if (!partState) {
      continue;
    }
    if (tri.surface === "base" && !partState.baseVisibility) {
      continue;
    }
    if (tri.surface === "outer" && !partState.outerVisibility) {
      continue;
    }

    const p1 = rotatePointYawPitch(tri.p1, previewYaw, previewPitch);
    const p2 = rotatePointYawPitch(tri.p2, previewYaw, previewPitch);
    const p3 = rotatePointYawPitch(tri.p3, previewYaw, previewPitch);
    const n = normalizeVec3(rotatePointYawPitch(tri.normal, previewYaw, previewPitch));
    const center = {
      x: (p1.x + p2.x + p3.x) / 3,
      y: (p1.y + p2.y + p3.y) / 3,
      z: (p1.z + p2.z + p3.z) / 3
    };
    const viewVec = normalizeVec3({
      x: -center.x,
      y: -center.y,
      z: cameraDistance - center.z
    });
    if (dotVec3(n, viewVec) <= 1e-6) {
      continue;
    }
    const shade = clamp(0.34 + Math.max(0, dotVec3(n, lightDirection)) * 0.66, 0.24, 1);

    const viewZ1 = cameraDistance - p1.z;
    const viewZ2 = cameraDistance - p2.z;
    const viewZ3 = cameraDistance - p3.z;
    if (viewZ1 <= 0.05 || viewZ2 <= 0.05 || viewZ3 <= 0.05) {
      continue;
    }

    const sx1 = centerX + (p1.x * scale * focal) / viewZ1;
    const sy1 = centerY - (p1.y * scale * focal) / viewZ1;
    const sx2 = centerX + (p2.x * scale * focal) / viewZ2;
    const sy2 = centerY - (p2.y * scale * focal) / viewZ2;
    const sx3 = centerX + (p3.x * scale * focal) / viewZ3;
    const sy3 = centerY - (p3.y * scale * focal) / viewZ3;

    const minX = clamp(Math.floor(Math.min(sx1, sx2, sx3)), 0, width - 1);
    const maxX = clamp(Math.ceil(Math.max(sx1, sx2, sx3)), 0, width - 1);
    const minY = clamp(Math.floor(Math.min(sy1, sy2, sy3)), 0, height - 1);
    const maxY = clamp(Math.ceil(Math.max(sy1, sy2, sy3)), 0, height - 1);
    if (maxX < minX || maxY < minY) {
      continue;
    }

    const denominator = (sy2 - sy3) * (sx1 - sx3) + (sx3 - sx2) * (sy1 - sy3);
    if (Math.abs(denominator) < 1e-9) {
      continue;
    }

    const invZ1 = 1 / viewZ1;
    const invZ2 = 1 / viewZ2;
    const invZ3 = 1 / viewZ3;

    for (let y = minY; y <= maxY; y += 1) {
      const py = y + 0.5;
      for (let x = minX; x <= maxX; x += 1) {
        const px = x + 0.5;
        const w1 = ((sy2 - sy3) * (px - sx3) + (sx3 - sx2) * (py - sy3)) / denominator;
        if (w1 < -1e-5 || w1 > 1.00001) {
          continue;
        }
        const w2 = ((sy3 - sy1) * (px - sx3) + (sx1 - sx3) * (py - sy3)) / denominator;
        if (w2 < -1e-5 || w2 > 1.00001) {
          continue;
        }
        const w3 = 1 - w1 - w2;
        if (w3 < -1e-5 || w3 > 1.00001) {
          continue;
        }

        const invZ = w1 * invZ1 + w2 * invZ2 + w3 * invZ3;
        if (invZ <= 0) {
          continue;
        }
        const depth = 1 / invZ;
        const depthForRender = depth + (tri.surface === "base" ? 0.00028 : 0);
        const u = (w1 * tri.uv1.u * invZ1 + w2 * tri.uv2.u * invZ2 + w3 * tri.uv3.u * invZ3) / invZ;
        const v = (w1 * tri.uv1.v * invZ1 + w2 * tri.uv2.v * invZ2 + w3 * tri.uv3.v * invZ3) / invZ;
        const texX = clamp(Math.floor(clamp(u, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
        const texY = clamp(Math.floor((1 - clamp(v, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
        const texIndex = (texY * TEXTURE_SIZE + texX) * 4;
        const srcA = texturePixels[texIndex + 3];
        if (srcA <= 0) {
          continue;
        }

        const srcR = clampByte(Math.round(texturePixels[texIndex] * shade));
        const srcG = clampByte(Math.round(texturePixels[texIndex + 1] * shade));
        const srcB = clampByte(Math.round(texturePixels[texIndex + 2] * shade));

        const pixelIndex = y * width + x;
        const rgbaIndex = pixelIndex * 4;
        if (depthForRender < nearDepth[pixelIndex]) {
          secondDepth[pixelIndex] = nearDepth[pixelIndex];
          secondTri[pixelIndex] = nearTri[pixelIndex];
          secondRgba[rgbaIndex] = nearRgba[rgbaIndex];
          secondRgba[rgbaIndex + 1] = nearRgba[rgbaIndex + 1];
          secondRgba[rgbaIndex + 2] = nearRgba[rgbaIndex + 2];
          secondRgba[rgbaIndex + 3] = nearRgba[rgbaIndex + 3];

          nearDepth[pixelIndex] = depthForRender;
          nearTri[pixelIndex] = tri.index;
          nearRgba[rgbaIndex] = srcR;
          nearRgba[rgbaIndex + 1] = srcG;
          nearRgba[rgbaIndex + 2] = srcB;
          nearRgba[rgbaIndex + 3] = srcA;
        } else if (depthForRender < secondDepth[pixelIndex]) {
          secondDepth[pixelIndex] = depthForRender;
          secondTri[pixelIndex] = tri.index;
          secondRgba[rgbaIndex] = srcR;
          secondRgba[rgbaIndex + 1] = srcG;
          secondRgba[rgbaIndex + 2] = srcB;
          secondRgba[rgbaIndex + 3] = srcA;
        }
      }
    }
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const rgbaIndex = pixelIndex * 4;
    const nearA = nearRgba[rgbaIndex + 3];
    const secondA = secondRgba[rgbaIndex + 3];
    const nearTriIndex = nearTri[pixelIndex];
    const secondTriIndex = secondTri[pixelIndex];
    const nearTriangle = nearTriIndex >= 0 ? editor.viewportModel.triangles[nearTriIndex] : null;
    const secondTriangle = secondTriIndex >= 0 ? editor.viewportModel.triangles[secondTriIndex] : null;

    let allowSecondLayer = secondA > 0;
    if (allowSecondLayer) {
      if (!nearTriangle || !secondTriangle) {
        allowSecondLayer = false;
      } else if (nearTriangle.surface === "outer") {
        allowSecondLayer =
          secondTriangle.surface === "base" && secondTriangle.part === nearTriangle.part;
      } else {
        allowSecondLayer = false;
      }
    }

    let outR = 0;
    let outG = 0;
    let outB = 0;
    let outA = 0;
    if (allowSecondLayer) {
      const blend = secondA / 255;
      outR = Math.round(secondRgba[rgbaIndex] * blend + outR * (1 - blend));
      outG = Math.round(secondRgba[rgbaIndex + 1] * blend + outG * (1 - blend));
      outB = Math.round(secondRgba[rgbaIndex + 2] * blend + outB * (1 - blend));
      outA = Math.round(secondA + outA * (1 - blend));
    }

    if (nearA > 0) {
      const blend = nearA / 255;
      outR = Math.round(nearRgba[rgbaIndex] * blend + outR * (1 - blend));
      outG = Math.round(nearRgba[rgbaIndex + 1] * blend + outG * (1 - blend));
      outB = Math.round(nearRgba[rgbaIndex + 2] * blend + outB * (1 - blend));
      outA = Math.round(nearA + outA * (1 - blend));
    }

    frame[rgbaIndex] = clampByte(outR);
    frame[rgbaIndex + 1] = clampByte(outG);
    frame[rgbaIndex + 2] = clampByte(outB);
    frame[rgbaIndex + 3] = clampByte(outA);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function drawViewportFallback(frame, width, height) {
  for (let y = 0; y < height; y += 1) {
    const t = y / Math.max(1, height - 1);
    const r = Math.round(24 * (1 - t) + 12 * t);
    const g = Math.round(22 * (1 - t) + 12 * t);
    const b = Math.round(38 * (1 - t) + 24 * t);
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      frame[idx] = r;
      frame[idx + 1] = g;
      frame[idx + 2] = b;
      frame[idx + 3] = 255;
    }
  }
}

function drawViewportModelPixelGrid(
  frame,
  width,
  height,
  pickBaseTriangles,
  pickBaseU,
  pickBaseV,
  pickOuterTriangles,
  pickOuterU,
  pickOuterV
) {
  // Draw base first (fainter), then outer (stronger) so both remain visible.
  drawViewportSurfacePixelGrid(frame, width, height, pickBaseTriangles, pickBaseU, pickBaseV, {
    blend: 0.22,
    gridColor: 160
  });
  drawViewportSurfacePixelGrid(frame, width, height, pickOuterTriangles, pickOuterU, pickOuterV, {
    blend: 0.42,
    gridColor: 202
  });
}

function drawViewportSurfacePixelGrid(frame, width, height, pickTriangles, pickU, pickV, options = {}) {
  const { blend = 0.42, gridColor = 196 } = options;
  const pixelCount = width * height;
  if (
    !pickTriangles ||
    !pickU ||
    !pickV ||
    pickTriangles.length < pixelCount ||
    pickU.length < pixelCount ||
    pickV.length < pixelCount
  ) {
    return;
  }

  const texXByPixel = new Int16Array(pixelCount);
  const texYByPixel = new Int16Array(pixelCount);
  const partCodeByPixel = new Int16Array(pixelCount);
  partCodeByPixel.fill(-1);
  const valid = new Uint8Array(pixelCount);
  const model = editor.viewportModel;
  if (!model?.triangles?.length) {
    return;
  }

  for (let i = 0; i < pixelCount; i += 1) {
    const triIndex = pickTriangles[i];
    if (triIndex < 0) {
      continue;
    }
    const triangle = model.triangles[triIndex];
    if (!triangle) {
      continue;
    }
    const u = pickU[i];
    const v = pickV[i];
    texXByPixel[i] = clamp(Math.floor(clamp(u, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
    texYByPixel[i] = clamp(Math.floor((1 - clamp(v, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
    partCodeByPixel[i] = triangle.partCode ?? -1;
    valid[i] = 1;
  }

  const gridR = clampByte(Math.round(gridColor));
  const gridG = clampByte(Math.round(gridColor));
  const gridB = clampByte(Math.round(gridColor));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (!valid[i]) {
        continue;
      }

      let isBoundary = false;
      if (x < width - 1) {
        const right = i + 1;
        if (!valid[right]) {
          isBoundary = true;
        } else if (
          partCodeByPixel[i] === partCodeByPixel[right] &&
          (texXByPixel[i] !== texXByPixel[right] || texYByPixel[i] !== texYByPixel[right])
        ) {
          isBoundary = true;
        }
      }
      if (!isBoundary && y < height - 1) {
        const down = i + width;
        if (!valid[down]) {
          isBoundary = true;
        } else if (
          partCodeByPixel[i] === partCodeByPixel[down] &&
          (texXByPixel[i] !== texXByPixel[down] || texYByPixel[i] !== texYByPixel[down])
        ) {
          isBoundary = true;
        }
      }

      if (!isBoundary) {
        continue;
      }

      const rgbaIndex = i * 4;
      frame[rgbaIndex] = clampByte(Math.round(frame[rgbaIndex] * (1 - blend) + gridR * blend));
      frame[rgbaIndex + 1] = clampByte(Math.round(frame[rgbaIndex + 1] * (1 - blend) + gridG * blend));
      frame[rgbaIndex + 2] = clampByte(Math.round(frame[rgbaIndex + 2] * (1 - blend) + gridB * blend));
      frame[rgbaIndex + 3] = 255;
    }
  }
}

function drawViewportBrushOutlineFromPickMap(
  frame,
  width,
  height,
  pickBaseTriangles,
  pickBaseU,
  pickBaseV,
  pickOuterTriangles,
  pickOuterU,
  pickOuterV
) {
  const tool = getEffectiveTool();
  if (!(tool === "pencil" || tool === "eraser")) {
    return;
  }
  const sample = editor.viewportHoverSample;
  if (!sample) {
    return;
  }
  const routing = resolve3dRoutingForSample(sample);
  if (!routing.allowed) {
    return;
  }
  const mapped = mapViewportSampleToSurface(sample, routing.targetSurface);
  if (!mapped) {
    return;
  }
  const targetSurface = routing.targetSurface;
  const hoverPartState = getPartStateByName(sample.triangle.part);
  const projectBaseThroughOuter =
    targetSurface === "base" &&
    hoverPartState?.outerVisibility !== false &&
    hoverPartState?.outerLock !== true;
  const model = editor.viewportModel;
  if (!model?.triangles?.length) {
    return;
  }

  const startX = mapped.x - Math.floor((editor.brushSize - 1) / 2);
  const startY = mapped.y - Math.floor((editor.brushSize - 1) / 2);
  const endX = startX + editor.brushSize - 1;
  const endY = startY + editor.brushSize - 1;
  if (endX < 0 || endY < 0 || startX > TEXTURE_SIZE - 1 || startY > TEXTURE_SIZE - 1) {
    return;
  }

  const drawPickTriangles =
    targetSurface === "outer" || projectBaseThroughOuter ? pickOuterTriangles : pickBaseTriangles;
  const drawPickU = targetSurface === "outer" || projectBaseThroughOuter ? pickOuterU : pickBaseU;
  const drawPickV = targetSurface === "outer" || projectBaseThroughOuter ? pickOuterV : pickBaseV;

  const pixelCount = width * height;
  if (
    !drawPickTriangles ||
    !drawPickU ||
    !drawPickV ||
    drawPickTriangles.length < pixelCount ||
    drawPickU.length < pixelCount ||
    drawPickV.length < pixelCount
  ) {
    return;
  }

  const mask = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i += 1) {
    const triIndex = drawPickTriangles[i];
    if (triIndex < 0) {
      continue;
    }
    const triangle = model.triangles[triIndex];
    if (!triangle) {
      continue;
    }

    let sampleU = drawPickU[i];
    let sampleV = drawPickV[i];

    if (targetSurface === "outer") {
      if (triangle.surface !== "outer") {
        continue;
      }
    } else if (targetSurface === "base") {
      if (projectBaseThroughOuter) {
        if (triangle.surface !== "outer") {
          continue;
        }
        const counterpart = getViewportTriangleByPartSurfaceSlot(
          triangle.part,
          "base",
          triangle.surfaceSlot
        );
        if (!counterpart) {
          continue;
        }
        const weights = barycentricOnUv(
          sampleU,
          sampleV,
          triangle.uv1.u,
          triangle.uv1.v,
          triangle.uv2.u,
          triangle.uv2.v,
          triangle.uv3.u,
          triangle.uv3.v
        );
        if (!weights) {
          continue;
        }
        sampleU =
          weights.w1 * counterpart.uv1.u + weights.w2 * counterpart.uv2.u + weights.w3 * counterpart.uv3.u;
        sampleV =
          weights.w1 * counterpart.uv1.v + weights.w2 * counterpart.uv2.v + weights.w3 * counterpart.uv3.v;
      } else if (triangle.surface !== "base") {
        continue;
      }
    } else {
      continue;
    }

    const texX = clamp(Math.floor(clamp(sampleU, 0, 1 - 1e-9) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
    const texY = clamp(Math.floor((1 - clamp(sampleV, 0, 1 - 1e-9)) * TEXTURE_SIZE), 0, TEXTURE_SIZE - 1);
    if (texX >= startX && texX <= endX && texY >= startY && texY <= endY) {
      mask[i] = 1;
    }
  }

  const outlineColor =
    tool === "eraser"
      ? { r: 255, g: 120, b: 140 }
      : { r: 102, g: 194, b: 255 };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (!mask[i]) {
        continue;
      }
      const left = x > 0 ? mask[i - 1] : 0;
      const right = x < width - 1 ? mask[i + 1] : 0;
      const up = y > 0 ? mask[i - width] : 0;
      const down = y < height - 1 ? mask[i + width] : 0;
      if (left && right && up && down) {
        continue;
      }
      const rgbaIndex = i * 4;
      frame[rgbaIndex] = outlineColor.r;
      frame[rgbaIndex + 1] = outlineColor.g;
      frame[rgbaIndex + 2] = outlineColor.b;
      frame[rgbaIndex + 3] = 255;
    }
  }
}

function rotatePointYawPitch(point, yaw, pitch) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const yawX = point.x * cosY - point.z * sinY;
  const yawZ = point.x * sinY + point.z * cosY;
  return {
    x: yawX,
    y: point.y * cosX - yawZ * sinX,
    z: point.y * sinX + yawZ * cosX
  };
}

function crossVec3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function dotVec3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalizeVec3(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length <= 1e-8) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function setDirty(flag) {
  state.dirty = flag;
  dirtyDotEl.classList.toggle("is-visible", flag);
  updateStatusBar();
}

function triggerLockFeedback(blockers) {
  const list = Array.isArray(blockers) ? blockers : [blockers];

  list.forEach((blocker) => {
    const control = document.querySelector(`[data-lock-control="${blocker.part}:${blocker.control}"]`);
    if (!control) {
      return;
    }

    control.classList.remove("is-blocked");
    // Force reflow so repeated clicks retrigger animation.
    void control.offsetWidth;
    control.classList.add("is-blocked");

    if (prefersReducedMotion) {
      control.style.animation = "lock-flash 250ms ease";
    }

    const partRow = control.closest(".part-row");
    const hint = partRow?.querySelector(".lock-hint");
    if (!hint) {
      return;
    }

    hint.textContent = blocker.message;
    hint.classList.add("is-visible");

    clearTimeout(Number(hint.dataset.hideTimer || "0"));
    const timer = window.setTimeout(() => {
      hint.classList.remove("is-visible");
    }, 1200);
    hint.dataset.hideTimer = String(timer);

    window.setTimeout(() => {
      control.classList.remove("is-blocked");
      control.style.animation = "";
    }, 360);
  });
}

function showToast(message, duration = 1400) {
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast.timerId);
  showToast.timerId = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, duration);
}

async function invokeBackend(command, args = {}) {
  if (!hasTauriBackend) {
    throw new Error("Tauri backend is not available in this runtime");
  }
  return tauriInvoke(command, args);
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

function normalizeHex(input) {
  const raw = String(input).trim().replace(/^#/, "").toUpperCase();

  if (/^[0-9A-F]{6}$/.test(raw)) {
    return `#${raw}FF`;
  }

  if (/^[0-9A-F]{8}$/.test(raw)) {
    return `#${raw}`;
  }

  return DEFAULT_HEX;
}

function parseHexRgba(hex) {
  const normalized = normalizeHex(hex).slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    Number.parseInt(normalized.slice(6, 8), 16)
  ];
}

function formatHexRgba(r, g, b, a) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

function toHex(value) {
  return clampByte(value).toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHsv(r, g, b) {
  const rn = clampByte(r) / 255;
  const gn = clampByte(g) / 255;
  const bn = clampByte(b) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rn) {
      hue = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      hue = 60 * ((bn - rn) / delta + 2);
    } else {
      hue = 60 * ((rn - gn) / delta + 4);
    }
  }
  if (hue < 0) {
    hue += 360;
  }

  const sat = max === 0 ? 0 : delta / max;
  const val = max;
  return [hue, sat, val];
}

function hsvToRgb(h, s, v) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 1);
  const val = clamp(Number(v), 0, 1);

  const chroma = val * sat;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const m = val - chroma;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (segment >= 0 && segment < 1) {
    rp = chroma;
    gp = x;
  } else if (segment >= 1 && segment < 2) {
    rp = x;
    gp = chroma;
  } else if (segment >= 2 && segment < 3) {
    gp = chroma;
    bp = x;
  } else if (segment >= 3 && segment < 4) {
    gp = x;
    bp = chroma;
  } else if (segment >= 4 && segment < 5) {
    rp = x;
    bp = chroma;
  } else {
    rp = chroma;
    bp = x;
  }

  return [
    clampByte(Math.round((rp + m) * 255)),
    clampByte(Math.round((gp + m) * 255)),
    clampByte(Math.round((bp + m) * 255))
  ];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value) {
  return clamp(value, 0, 255);
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

function isEditingText(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
