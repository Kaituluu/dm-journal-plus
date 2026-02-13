// imageScale.js
// Foundry VTT v13+ — Journal editor image scaler (persists by updating editor HTML via Foundry APIs)

console.log("DM Journal Plus | Image Scale Tool Loaded");

const ImageScaleTool = (() => {
  const PANEL_ID = "fvtt-image-scale-panel";
  const MIN_PCT = 5;
  const MAX_PCT = 400;

  let panel = null;
  let current = null; // { imgEl, editorEl, app }

  const naturalCache = new WeakMap();

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function getRootElement(html) {
    if (!html) return null;
    if (html instanceof HTMLElement) return html;
    if (html[0] instanceof HTMLElement) return html[0];
    return null;
  }

  async function getNaturalDims(imgEl) {
    if (naturalCache.has(imgEl)) return naturalCache.get(imgEl);

    if (imgEl.naturalWidth && imgEl.naturalHeight) {
      const dims = { w: imgEl.naturalWidth, h: imgEl.naturalHeight };
      naturalCache.set(imgEl, dims);
      return dims;
    }

    const src = imgEl.getAttribute("src");
    if (!src) return null;

    const dims = await new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => resolve(null);
      im.src = src;
    });

    if (dims) naturalCache.set(imgEl, dims);
    return dims;
  }

  function createPanel() {
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "fvtt-image-scale-panel";
    panel.style.display = "none";

    panel.innerHTML = `
      <div class="fvtt-image-scale-row">
        <label class="fvtt-image-scale-label">Image Scale</label>
        <div class="fvtt-image-scale-lock" title="Aspect ratio preserved">🔒</div>
      </div>

      <div class="fvtt-image-scale-row fvtt-image-scale-controls">
        <input class="fvtt-image-scale-input" type="number" min="${MIN_PCT}" max="${MAX_PCT}" step="1" value="100" />
        <div class="fvtt-image-scale-suffix">%</div>
        <button type="button" class="fvtt-image-scale-fit">Fit</button>
      </div>

      <div class="fvtt-image-scale-row fvtt-image-scale-presets">
        <button type="button" data-pct="25">25%</button>
        <button type="button" data-pct="50">50%</button>
        <button type="button" data-pct="75">75%</button>
        <button type="button" data-pct="100">100%</button>
        <button type="button" data-pct="150">150%</button>
      </div>

      <div class="fvtt-image-scale-row fvtt-image-scale-meta">
        <div class="fvtt-image-scale-dims">
          <span class="fvtt-image-scale-natural">—</span>
          <span class="fvtt-image-scale-current">—</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Do not close when interacting with panel
    panel.addEventListener("mousedown", (ev) => ev.stopPropagation());
    panel.addEventListener("click", (ev) => ev.stopPropagation());

    // Click outside closes
    document.addEventListener("mousedown", (ev) => {
      if (!panel || panel.style.display === "none") return;
      if (!current) return;

      const insidePanel = panel.contains(ev.target);
      const onImage = current.imgEl?.contains?.(ev.target);

      if (!insidePanel && !onImage) hidePanel();
    });

    // Input scaling
    const input = panel.querySelector(".fvtt-image-scale-input");
    input.addEventListener("input", async () => {
      if (!current) return;
      const pct = clamp(parseInt(input.value || "100", 10), MIN_PCT, MAX_PCT);
      input.value = String(pct);
      await applyScalePercent(pct);
    });

    // Presets
    panel.querySelector(".fvtt-image-scale-presets").addEventListener("click", async (ev) => {
      const btn = ev.target.closest("button[data-pct]");
      if (!btn || !current) return;
      const pct = clamp(parseInt(btn.dataset.pct, 10), MIN_PCT, MAX_PCT);
      input.value = String(pct);
      await applyScalePercent(pct);
    });

    // Fit
    panel.querySelector(".fvtt-image-scale-fit").addEventListener("click", async () => {
      if (!current) return;
      const dims = await getNaturalDims(current.imgEl);
      if (!dims) return;

      const container = current.editorEl.closest(".window-content") || current.editorEl;
      const width = Math.max(50, container.getBoundingClientRect().width - 60);
      const pct = clamp(Math.round((width / dims.w) * 100), MIN_PCT, MAX_PCT);

      input.value = String(pct);
      await applyScalePercent(pct);
      positionPanelNear(current.imgEl);
    });

    // Reposition helpers
    window.addEventListener("resize", () => current?.imgEl && positionPanelNear(current.imgEl));
    window.addEventListener("scroll", () => current?.imgEl && positionPanelNear(current.imgEl), true);

    return panel;
  }

  function showPanel(imgEl, editorEl, app) {
    createPanel();
    current = { imgEl, editorEl, app };
    panel.style.display = "block";
    positionPanelNear(imgEl);
    refreshMeta(imgEl);
  }

  function hidePanel() {
    if (!panel) return;
    panel.style.display = "none";
    current = null;
  }

  function positionPanelNear(imgEl) {
    if (!panel) return;
    const rect = imgEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    let top = rect.top + window.scrollY - panelRect.height - 8;
    let left = rect.right + window.scrollX - panelRect.width;

    if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;

    const minLeft = window.scrollX + 8;
    const maxLeft = window.scrollX + window.innerWidth - panelRect.width - 8;
    left = clamp(left, minLeft, maxLeft);

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  async function refreshMeta(imgEl) {
    const dims = await getNaturalDims(imgEl);
    if (!dims || !panel) return;

    const rect = imgEl.getBoundingClientRect();
    panel.querySelector(".fvtt-image-scale-natural").textContent = `Original: ${dims.w}×${dims.h}`;
    panel.querySelector(".fvtt-image-scale-current").textContent =
      `Now: ${Math.round(rect.width)}×${Math.round(rect.height)}`;
  }

  // Key: persist by updating editor HTML through Foundry
  async function applyScalePercent(pct) {
    const { imgEl, editorEl, app } = current || {};
    if (!imgEl || !editorEl || !app) return;

    const dims = await getNaturalDims(imgEl);
    if (!dims) return;

    const newW = Math.max(1, Math.round(dims.w * (pct / 100)));

    // 1) Read current HTML (source of truth for Foundry’s editor manager)
    // ProseMirror renders into editorEl; innerHTML is the content we can rewrite.
    const html = editorEl.innerHTML;

    // 2) Identify the exact image by src (and optionally by current width) and rewrite its width only.
    // We remove height to preserve aspect ratio.
    const src = imgEl.getAttribute("src")?.replace(/"/g, "&quot;") ?? "";
    if (!src) return;

    // Replace FIRST matching <img ... src="..."> tag's width/height attributes.
    // This is robust enough for journal usage; if multiple identical src exist, it will hit the first.
    const updated = html.replace(
      new RegExp(`<img([^>]*?)\\s+src=["']${escapeRegExp(src)}["']([^>]*?)>`, "i"),
      (m, a, b) => {
        // Remove existing width/height attrs in the matched tag
        let tag = `<img${a} src="${src}"${b}>`;
        tag = tag
          .replace(/\swidth=["'][^"']*["']/gi, "")
          .replace(/\sheight=["'][^"']*["']/gi, "");

        // Insert width attribute near the start (after <img)
        tag = tag.replace(/^<img/i, `<img width="${newW}"`);
        return tag;
      }
    );

    if (updated === html) return;

    // 3) Push updated content back into the editor DOM
    // This ensures the editor’s internal state sees a change.
    editorEl.innerHTML = updated;

    // 4) Let Foundry know content changed so it saves
    // Many sheets listen to input events for dirty state.
    editorEl.dispatchEvent(new Event("input", { bubbles: true }));

    // Refresh references (because we replaced DOM)
    // Find the new img element matching src:
    const newImg = editorEl.querySelector(`img[src="${CSS.escape(imgEl.getAttribute("src"))}"]`);
    if (newImg) current.imgEl = newImg;

    refreshMeta(current.imgEl);
    positionPanelNear(current.imgEl);
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Detect editor like your existing detectEditor() pattern
  function attach(app, html) {
    const root = getRootElement(html);
    if (!root) return;

    const observer = new MutationObserver(() => {
      const editor = root.querySelector(".ProseMirror");
      const toolbar = root.querySelector("menu.editor-menu");

      // Only bind in edit mode (toolbar exists)
      if (!editor || !toolbar) return;

      if (editor.dataset.imageScaleBound === "true") return;
      editor.dataset.imageScaleBound = "true";

      editor.addEventListener("mousedown", (ev) => {
        const img = ev.target?.closest?.("img");
        if (!img) return;

        ev.stopPropagation();
        showPanel(img, editor, app);
      });
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function init() {
    Hooks.on("renderJournalEntryPageSheet", attach);
    Hooks.on("renderJournalEntrySheet", attach);
    Hooks.on("renderJournalSheet", attach);
  }

  return { init };
})();

Hooks.once("init", () => {
  ImageScaleTool.init();
});
