/**
 * Location Intelligence PDF Export
 * - Dynamic page height per slide (no fixed 720)
 * - Margin/padding on every page
 * - Compressed output (JPEG ~5-10MB vs PNG 100MB+)
 * - Light mode forced during capture (fixes dark mode black backgrounds)
 * - Mobile viewport fix
 * - Color polyfill removed (html-to-image handles modern CSS natively)
 */

import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

// ─── constants ────────────────────────────────────────────────────

const SLIDE_CSS_W = 1280;
const CAPTURE_SCALE = 2;

/** Page margin in px (applied on all 4 sides) */
const MARGIN = 24;

// ─── helpers ──────────────────────────────────────────────────────

function safeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]+/g, "_").replace(/_+/g, "_").slice(0, 64);
}

export function waitForLocationIntelligencePaint(idleMs = 650): Promise<void> {
  return new Promise((r) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTimeout(r, idleMs)),
    ),
  );
}

function slideOrder(a: HTMLElement, b: HTMLElement): number {
  return (
    Number(a.getAttribute("data-li-pdf-slide")) -
    Number(b.getAttribute("data-li-pdf-slide"))
  );
}

// ─── core capture ─────────────────────────────────────────────────

/**
 * Captures one slide:
 * 1. Measures true scrollHeight → dynamic page height
 * 2. Clones into fixed off-screen wrapper at top:0 left:0 (zero offset = no chart shift)
 * 3. Forces light mode on clone so dark OS theme doesn't bleed in
 * 4. Renders as JPEG quality 0.82 (10x smaller than PNG)
 * 5. Adds a PDF page sized to (content + margins)
 */
async function captureSlide(
  el: HTMLElement,
  pdf: jsPDF,
  isFirstPage: boolean,
  scrollHost: HTMLElement | null,
): Promise<void> {
  // ── scroll into view & measure real content height ──────────────
  el.scrollIntoView({ block: "start", behavior: "instant" });
  await new Promise((r) => setTimeout(r, 300));

  const contentW = SLIDE_CSS_W;
  const contentH = Math.max(el.scrollHeight, el.offsetHeight);

  // page = content + margin on all 4 sides
  const pageW = contentW + MARGIN * 2;
  const pageH = contentH + MARGIN * 2;

  // ── clone into fixed off-screen wrapper ─────────────────────────
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${contentW}px;
    height: ${contentH}px;
    overflow: hidden;
    z-index: -99999;
    pointer-events: none;
    background: #ffffff;
    color-scheme: light;
  `;

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    width: ${contentW}px !important;
    min-height: ${contentH}px !important;
    max-width: ${contentW}px !important;
    overflow: visible !important;
    transform: none !important;
    margin: 0 !important;
    padding: 0 !important;
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    box-sizing: border-box !important;
    color-scheme: light !important;
  `;

  // hide interactive elements in clone
  clone
    .querySelectorAll<HTMLElement>(
      [
        "[data-html2canvas-ignore]",
        "[data-pdf-ignore]",
        "button:not([data-pdf-keep])",
        "select",
        "input",
        "[class*='pagination']",
        "[class*='Pagination']",
        "[class*='tooltip']",
        "[class*='Tooltip']",
        "[class*='export']",
        "[class*='Export']",
      ].join(","),
    )
    .forEach((node) => (node.style.display = "none"));

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // wait for charts to re-paint in new position
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 450));

  let dataUrl: string;
  try {
    // ── JPEG capture — ~10x smaller than PNG ─────────────────────
    dataUrl = await toJpeg(wrapper, {
      width: contentW,
      height: contentH,
      canvasWidth: contentW * CAPTURE_SCALE,
      canvasHeight: contentH * CAPTURE_SCALE,
      pixelRatio: CAPTURE_SCALE,
      quality: 0.82,
      backgroundColor: "#ffffff",
      skipFonts: false,
      style: {
        fontSize: "16px",       // prevent mobile font scaling
        colorScheme: "light",   // force light mode inside capture context
      },
      filter: (node) => {
        // filter broken image nodes
        if (node instanceof HTMLImageElement && !node.complete) return false;
        if (node instanceof HTMLImageElement && node.naturalWidth === 0) return false;

        if (
          node instanceof HTMLElement &&
          node !== wrapper &&
          !wrapper.contains(node)
        ) {
          if (window.getComputedStyle(node).position === "fixed") return false;
        }
        return true;
      },
    });
  } finally {
    document.body.removeChild(wrapper);
  }

  // ── add dynamic-sized page ────────────────────────────────────────
  if (!isFirstPage) {
    pdf.addPage(
      [pageW, pageH],
      pageW > pageH ? "landscape" : "portrait",
    );
  }

  // white background fill
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageW, pageH, "F");

  // draw image inset by MARGIN on all sides
  pdf.addImage(
    dataUrl,
    "JPEG",
    MARGIN,   // x
    MARGIN,   // y
    contentW, // width  (1px CSS = 1px PDF unit)
    contentH, // height (dynamic per slide)
    undefined,
    "FAST",
  );
}

// ─── public API ───────────────────────────────────────────────────

export async function captureLocationIntelligencePdf(
  root: HTMLElement,
  options?: { filename?: string; title?: string },
): Promise<void> {

  // ── mobile: force desktop viewport ───────────────────────────────
  const isMobile = window.innerWidth < 1280;
  const metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  const prevViewportContent = metaViewport?.content ?? "";
  const prevBodyWidth = document.body.style.width;
  const prevBodyMinWidth = document.body.style.minWidth;
  const prevBodyOverflow = document.body.style.overflow;
  const prevRootOverflow = root.style.overflow;

  if (isMobile) {
    if (metaViewport) metaViewport.content = "width=1280, initial-scale=1";
    document.body.style.width = "1280px";
    document.body.style.minWidth = "1280px";
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    await new Promise((r) => setTimeout(r, 600));
  }

  // ── force light mode for entire capture ──────────────────────────
  // Overrides OS dark mode (prefers-color-scheme: dark) which causes
  // black backgrounds on dark mode devices in production.
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const prevColorScheme = htmlEl.style.colorScheme;
  const prevBodyBg = bodyEl.style.backgroundColor;
  const prevBodyColor = bodyEl.style.color;

  htmlEl.style.colorScheme = "light";
  bodyEl.style.backgroundColor = "#ffffff";
  bodyEl.style.color = "#213547";

  // wait for browser to repaint in light mode before measuring/cloning
  await new Promise((r) => setTimeout(r, 600));

  const title = options?.title
    ? safeFilename(options.title)
    : "Location_Intelligence";
  const filename =
    options?.filename ??
    `${title}_${new Date().toISOString().slice(0, 10)}.pdf`;

  // shrink capture root to 1280px during export
  const pdfCaptureRoot = document.getElementById(
    "pdfCaptureRoot",
  ) as HTMLElement | null;
  if (pdfCaptureRoot) pdfCaptureRoot.style.maxWidth = `${SLIDE_CSS_W}px`;

  const slides = Array.from(
    root.querySelectorAll<HTMLElement>("[data-li-pdf-slide]"),
  ).sort(slideOrder);

  if (slides.length === 0) {
    throw new Error("No [data-li-pdf-slide] elements found.");
  }

  const scrollHost = root.closest("#scroll-container") as HTMLElement | null;
  const prevScrollTop = scrollHost ? scrollHost.scrollTop : window.scrollY;

  // reset scroll before capture so getBoundingClientRect is clean
  if (scrollHost) scrollHost.scrollTop = 0;
  else window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 150));

  // hide data-html2canvas-ignore elements globally
  const hiddenEls: { el: HTMLElement; prev: string }[] = [];
  root.querySelectorAll<HTMLElement>("[data-html2canvas-ignore]").forEach((el) => {
    hiddenEls.push({ el, prev: el.style.display });
    el.style.display = "none";
  });

  // ── measure first slide to init jsPDF with correct first-page size ──
  const firstSlide = slides[0];
  firstSlide.scrollIntoView({ block: "start", behavior: "instant" });
  await new Promise((r) => setTimeout(r, 200));

  const firstH = Math.max(firstSlide.scrollHeight, firstSlide.offsetHeight);
  const firstPageW = SLIDE_CSS_W + MARGIN * 2;
  const firstPageH = firstH + MARGIN * 2;

  const pdf = new jsPDF({
    unit: "px",
    format: [firstPageW, firstPageH],
    orientation: firstPageW > firstPageH ? "landscape" : "portrait",
    hotfixes: ["px_scaling"],
    compress: true,
  });

  let isFirstPage = true;

  try {
    for (const slide of slides) {
      const slideNum = slide.getAttribute("data-li-pdf-slide");
      try {
        console.log(`[PDF] Capturing slide ${slideNum}…`);
        await captureSlide(slide, pdf, isFirstPage, scrollHost);
        isFirstPage = false;
        console.log(`[PDF] Slide ${slideNum} ✓`);
      } catch (err) {
        console.error(`[PDF] Slide ${slideNum} failed:`, err);
      }
    }

    pdf.save(filename);
  } finally {
    // ── restore everything ────────────────────────────────────────

    // restore light mode overrides
    htmlEl.style.colorScheme = prevColorScheme;
    bodyEl.style.backgroundColor = prevBodyBg;
    bodyEl.style.color = prevBodyColor;

    // restore mobile viewport
    if (isMobile) {
      if (metaViewport) metaViewport.content = prevViewportContent;
      document.body.style.width = prevBodyWidth;
      document.body.style.minWidth = prevBodyMinWidth;
      document.body.style.overflow = prevBodyOverflow;
      root.style.overflow = prevRootOverflow;
    }

    // restore scroll
    if (scrollHost) scrollHost.scrollTop = prevScrollTop;
    else window.scrollTo(0, prevScrollTop);

    // restore capture root width
    if (pdfCaptureRoot) pdfCaptureRoot.style.maxWidth = "1920px";

    // restore hidden elements
    for (const { el, prev } of hiddenEls) {
      el.style.display = prev;
    }
  }
}