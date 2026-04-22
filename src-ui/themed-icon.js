const BRAND_ICON_FONT_FAMILY = "QueenSkin Icon";
const BRAND_ICON_FONT_PATH = "./assets/Jersey15-Regular.ttf";
const BRAND_ICON_TEXT = "QSE";
const BRAND_ICON_SIZE = 256;
const BRAND_ICON_RADIUS = 52;
const BRAND_ICON_STROKE_WIDTH = 14;

let fontLoadPromise = null;
const iconCache = new Map();
let dockIconQueue = Promise.resolve();

function normalizeColor(value, fallback) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getThemePalette() {
  const style = getComputedStyle(document.documentElement);
  const stroke = normalizeColor(style.getPropertyValue("--active-border"), "#7f75ba");
  const text = stroke;
  const fill = normalizeColor(style.getPropertyValue("--step-0"), "#090816");
  const inner = normalizeColor(style.getPropertyValue("--bg-2"), fill);
  return { stroke, text, fill, inner };
}

function iconCacheKey(theme, palette) {
  return `${String(theme || "default")}|${palette.stroke}|${palette.fill}|${palette.inner}`;
}

function createGradient(ctx, x0, y0, x1, y1, stops) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }
  return gradient;
}

function getThemeIconStyle(theme, palette) {
  const normalized = String(theme ?? "").trim().toLowerCase();
  if (normalized === "trans") {
    const transStops = [
      [0.0, "#5bc8f7"],
      [0.24, "#9cdfff"],
      [0.5, "#ffffff"],
      [0.76, "#f5a8c9"],
      [1.0, "#79d2f8"]
    ];
    return {
      fillColor: "#142a44",
      innerColor: "#1f3f64",
      strokeStops: transStops,
      textStops: transStops
    };
  }
  return {
    fillColor: palette.fill,
    innerColor: palette.inner,
    strokeColor: palette.stroke,
    textColor: palette.text
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function dataUrlToPngBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function createIconAsset(theme, palette) {
  const canvas = document.createElement("canvas");
  canvas.width = BRAND_ICON_SIZE;
  canvas.height = BRAND_ICON_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const inset = BRAND_ICON_STROKE_WIDTH / 2 + 6;
  const themeStyle = getThemeIconStyle(theme, palette);

  drawRoundedRect(
    ctx,
    inset,
    inset,
    BRAND_ICON_SIZE - inset * 2,
    BRAND_ICON_SIZE - inset * 2,
    BRAND_ICON_RADIUS
  );
  ctx.fillStyle = themeStyle.fillStops
    ? createGradient(ctx, 0, 0, BRAND_ICON_SIZE, BRAND_ICON_SIZE, themeStyle.fillStops)
    : themeStyle.fillColor;
  ctx.fill();

  ctx.strokeStyle = themeStyle.strokeStops
    ? createGradient(ctx, 0, BRAND_ICON_SIZE, BRAND_ICON_SIZE, 0, themeStyle.strokeStops)
    : themeStyle.strokeColor;
  ctx.lineWidth = BRAND_ICON_STROKE_WIDTH;
  ctx.stroke();

  ctx.save();
  drawRoundedRect(
    ctx,
    inset + BRAND_ICON_STROKE_WIDTH,
    inset + BRAND_ICON_STROKE_WIDTH,
    BRAND_ICON_SIZE - (inset + BRAND_ICON_STROKE_WIDTH) * 2,
    BRAND_ICON_SIZE - (inset + BRAND_ICON_STROKE_WIDTH) * 2,
    BRAND_ICON_RADIUS - 12
  );
  ctx.clip();
  ctx.fillStyle = themeStyle.innerStops
    ? createGradient(ctx, 0, 0, BRAND_ICON_SIZE, BRAND_ICON_SIZE, themeStyle.innerStops)
    : themeStyle.innerColor;
  ctx.globalAlpha = 0.45;
  ctx.fillRect(0, 0, BRAND_ICON_SIZE, BRAND_ICON_SIZE);
  ctx.restore();

  ctx.fillStyle = themeStyle.textStops
    ? createGradient(ctx, 0, 0, BRAND_ICON_SIZE, BRAND_ICON_SIZE, themeStyle.textStops)
    : themeStyle.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 118px "${BRAND_ICON_FONT_FAMILY}", ui-sans-serif, system-ui`;
  ctx.fillText(BRAND_ICON_TEXT, BRAND_ICON_SIZE / 2, BRAND_ICON_SIZE / 2 + 6);

  const dataUrl = canvas.toDataURL("image/png");
  return {
    theme: String(theme || "default"),
    dataUrl,
    bytes: dataUrlToPngBytes(dataUrl)
  };
}

function applyInAppBranding(dataUrl) {
  if (!dataUrl) {
    return;
  }
  document.querySelectorAll("img.brand-logo").forEach((logo) => {
    if (logo instanceof HTMLImageElement) {
      logo.src = dataUrl;
    }
  });
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
    if (link instanceof HTMLLinkElement) {
      link.href = dataUrl;
    }
  });
}

async function applyWindowIcon(bytes) {
  const tauriWindow = window.__TAURI__?.window;
  const tauriImage = window.__TAURI__?.image;
  if (!tauriWindow?.getCurrentWindow || !tauriImage?.Image?.fromBytes) {
    return;
  }
  const currentWindow = tauriWindow.getCurrentWindow();
  if (!currentWindow?.setIcon) {
    return;
  }
  try {
    const image = await tauriImage.Image.fromBytes(bytes);
    await currentWindow.setIcon(image);
  } catch (error) {
    console.debug("Unable to apply themed window icon.", error);
  }
}

async function applyMacDockIcon(bytes) {
  const tauriInvoke = window.__TAURI__?.core?.invoke;
  if (typeof tauriInvoke !== "function") {
    return;
  }
  try {
    await tauriInvoke("set_macos_dock_icon_png", { pngBytes: Array.from(bytes) });
  } catch (error) {
    console.debug("Unable to apply themed dock icon.", error);
  }
}

async function applyNativeIcons(bytes) {
  await Promise.allSettled([applyWindowIcon(bytes), applyMacDockIcon(bytes)]);
}

async function ensureIconFontLoaded() {
  if (!("FontFace" in window) || !document.fonts) {
    return;
  }
  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      try {
        const face = new FontFace(BRAND_ICON_FONT_FAMILY, `url("${BRAND_ICON_FONT_PATH}")`, {
          style: "normal",
          weight: "400"
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
        await document.fonts.ready;
      } catch (error) {
        console.debug("Icon font failed to load; using fallback.", error);
      }
    })();
  }
  await fontLoadPromise;
}

export async function applyThemedBrandIcon(theme) {
  await ensureIconFontLoaded();
  const palette = getThemePalette();
  const key = iconCacheKey(theme, palette);
  let iconAsset = iconCache.get(key);
  if (!iconAsset) {
    iconAsset = createIconAsset(theme, palette);
    if (iconAsset) {
      iconCache.set(key, iconAsset);
    }
  }
  if (!iconAsset) {
    return;
  }

  applyInAppBranding(iconAsset.dataUrl);

  dockIconQueue = dockIconQueue
    .catch(() => undefined)
    .then(() => applyNativeIcons(iconAsset.bytes));
  await dockIconQueue;
}
