/* Developer Academy Pin Generator - Apple-style Edition */

const state = {
  year: 2024,
  includeGrid: true,
  pinBorder: false,
};

const $ = (sel) => document.querySelector(sel);

// Canvas elements
const heroCanvas = $("#heroCanvas");
const cardCanvas = $("#cardCanvas");
const pinCanvas = $("#pinCanvas");

// Controls
const yearInput = $("#yearInput");
const gridToggle = $("#gridToggle");
const borderToggle = $("#borderToggle");

// Buttons
const downloadCardBtn = $("#downloadCardBtn");
const downloadPinBtn = $("#downloadPinBtn");
const copyTextBtn = $("#copyTextBtn");
const shareXBtn = $("#shareXBtn");
const shareLinkedInBtn = $("#shareLinkedInBtn");

// Assets
const assets = {
  faceId: null,
  hat: null,
  grid: null,
};

// Utilities
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function yyFromYear(year) {
  const yy = year % 100;
  return pad2(yy);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadAssets() {
  assets.faceId = await loadImage("./assets/faceid.png").catch(() => null);
  assets.hat = await loadImage("./assets/hat.svg");
  assets.grid = await loadImage("./assets/grid.svg");
}

function setupHiDPI(canvas, cssWidth, cssHeight) {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fillBackground(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.18,
    10,
    w * 0.5,
    h * 0.55,
    Math.max(w, h)
  );
  g.addColorStop(0, "#181c27");
  g.addColorStop(0.55, "#0b0c10");
  g.addColorStop(1, "#06070a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (state.includeGrid) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    const pattern = ctx.createPattern(assets.grid, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(-100, h * 0.35);
    ctx.lineTo(w + 100, h * 0.85);
    ctx.moveTo(w + 100, h * 0.3);
    ctx.lineTo(-100, h * 0.8);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHatAndTitle(ctx, w, h) {
  const topY = 110;
  const hatSize = 48;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(assets.hat, w / 2 - hatSize / 2, topY, hatSize, hatSize);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font =
    "650 38px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("You did it!", w / 2, topY + hatSize + 16);
  ctx.restore();
}

function drawTextOnArc(ctx, text, cx, cy, radius, startAngle, endAngle, font, fillStyle) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);

  const angleRange = endAngle - startAngle;
  const pxPerRad = total / Math.abs(angleRange);
  const angles = widths.map((w) => w / pxPerRad);

  let angle = startAngle;
  for (let i = 0; i < chars.length; i++) {
    angle += angles[i] / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    angle += angles[i] / 2;
  }
  ctx.restore();
}

function drawPin(ctx, w, h, { transparentBackground = false } = {}) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.46;

  if (!transparentBackground) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(255,255,255,0.06)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.save();
  ctx.globalAlpha = transparentBackground ? 0 : 0.28;
  ctx.filter = "blur(12px)";
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.06, r * 0.96, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(
    cx,
    cy - r * 0.35,
    r * 0.1,
    cx,
    cy,
    r * 1.1
  );
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.6, "#F2F3F6");
  g.addColorStop(1, "#E4E7EE");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  if (state.includeGrid) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    const pattern = ctx.createPattern(assets.grid, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.97, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();

  if (state.pinBorder) {
    ctx.save();
    ctx.lineWidth = Math.max(10, r * 0.06);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const dotR = Math.max(3.5, r * 0.03);
  const dotOffset = r * 0.82;
  ctx.save();
  ctx.fillStyle = "#0B0C10";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(cx - dotOffset, cy, dotR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + dotOffset, cy, dotR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const topText = "DEVELOPER ACADEMY";
  const bottomText = "CLASS OF '" + yyFromYear(state.year);

  const textRadius = r * 0.8;

  drawTextOnArc(
    ctx,
    topText,
    cx,
    cy,
    textRadius,
    Math.PI * 1.12,
    Math.PI * 1.88,
    "650 " +
      Math.round(r * 0.16) +
      "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
    "#0B0C10"
  );

  drawTextOnArc(
    ctx,
    bottomText,
    cx,
    cy,
    textRadius,
    Math.PI * 0.12,
    Math.PI * 0.88,
    "750 " +
      Math.round(r * 0.17) +
      "px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
    "#0B0C10"
  );

  if (assets.faceId) {
    const iconSize = r * 0.7;
    ctx.drawImage(
      assets.faceId,
      cx - iconSize / 2,
      cy - iconSize / 2 + r * 0.02,
      iconSize,
      iconSize
    );
  } else {
    ctx.save();
    ctx.strokeStyle = "#0066FF";
    ctx.lineWidth = Math.max(6, r * 0.06);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.23, 0, Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHeroPin() {
  const s = 600;
  const ctx = setupHiDPI(heroCanvas, s, s);
  drawPin(ctx, s, s, { transparentBackground: true });
}

function drawCard() {
  const w = 1200,
    h = 1600;
  const ctx = setupHiDPI(cardCanvas, w, h);

  fillBackground(ctx, w, h);
  drawHatAndTitle(ctx, w, h);

  const pinSize = 820;
  const pinX = (w - pinSize) / 2;
  const pinY = 520;

  const off = document.createElement("canvas");
  const offCtx = setupHiDPI(off, pinSize, pinSize);

  drawPin(offCtx, pinSize, pinSize, { transparentBackground: true });

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.filter = "blur(18px)";
  ctx.drawImage(off, pinX + 10, pinY + 30, pinSize, pinSize);
  ctx.restore();

  ctx.save();
  ctx.drawImage(off, pinX, pinY, pinSize, pinSize);
  ctx.restore();

  ctx.save();
  ctx.font = "650 22px ui-sans-serif, system-ui, -apple-system";
  ctx.fillStyle = "rgba(233,238,247,0.70)";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    "Congratulations on your graduation, we're proud of your journey.",
    w / 2,
    h - 92
  );
  ctx.restore();
}

function drawPinPreview() {
  const s = 900;
  const ctx = setupHiDPI(pinCanvas, s, s);
  drawPin(ctx, s, s, { transparentBackground: false });
}

function renderAll() {
  drawHeroPin();
  drawCard();
  drawPinPreview();
  $("#yyHint").textContent = yyFromYear(state.year);
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }, "image/png");
}

function downloadPinOnlyTransparent() {
  const size = 2048;
  const c = document.createElement("canvas");
  const ctx = setupHiDPI(c, size, size);
  drawPin(ctx, size, size, { transparentBackground: true });
  downloadCanvas(c, `developer-academy-pin-${state.year}.png`);
}

function downloadCard() {
  const w = 2048,
    h = 2731;
  const c = document.createElement("canvas");
  const ctx = setupHiDPI(c, w, h);

  fillBackground(ctx, w, h);
  drawHatAndTitle(ctx, w, h);

  const pinSize = Math.round(w * 0.68);
  const pinX = (w - pinSize) / 2;
  const pinY = Math.round(h * 0.33);

  const off = document.createElement("canvas");
  const offCtx = setupHiDPI(off, pinSize, pinSize);
  drawPin(offCtx, pinSize, pinSize, { transparentBackground: true });

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.filter = "blur(22px)";
  ctx.drawImage(off, pinX + 14, pinY + 40, pinSize, pinSize);
  ctx.restore();

  ctx.drawImage(off, pinX, pinY, pinSize, pinSize);

  ctx.save();
  ctx.font = "650 30px ui-sans-serif, system-ui, -apple-system";
  ctx.fillStyle = "rgba(233,238,247,0.72)";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    "Congratulations on your graduation, we're proud of your journey.",
    w / 2,
    h - 150
  );
  ctx.restore();

  downloadCanvas(c, `developer-academy-card-${state.year}.png`);
}

function shareText() {
  return `Developer Academy — Class of '${yyFromYear(state.year)}. Generated badge + pin.`;
}

function setupEvents() {
  yearInput.addEventListener("input", () => {
    const y = clamp(parseInt(yearInput.value || "2024", 10), 1990, 2099);
    state.year = y;
    $("#yyHint").textContent = yyFromYear(y);
    renderAll();
  });

  gridToggle.addEventListener("change", () => {
    state.includeGrid = !!gridToggle.checked;
    renderAll();
  });

  borderToggle.addEventListener("change", () => {
    state.pinBorder = !!borderToggle.checked;
    renderAll();
  });

  downloadCardBtn.addEventListener("click", downloadCard);
  downloadPinBtn.addEventListener("click", downloadPinOnlyTransparent);

  copyTextBtn.addEventListener("click", async () => {
    const txt = shareText();
    try {
      await navigator.clipboard.writeText(txt);
      const originalHTML = copyTextBtn.innerHTML;
      copyTextBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Copied!
      `;
      setTimeout(() => (copyTextBtn.innerHTML = originalHTML), 1500);
    } catch {
      alert(txt);
    }
  });

  shareXBtn.addEventListener("click", () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareText());
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  shareLinkedInBtn.addEventListener("click", () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

(async function main() {
  yearInput.value = String(state.year);
  gridToggle.checked = state.includeGrid;
  borderToggle.checked = state.pinBorder;
  $("#yyHint").textContent = yyFromYear(state.year);

  await loadAssets();
  setupEvents();
  renderAll();
})();
