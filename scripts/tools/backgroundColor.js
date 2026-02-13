export function injectBackgroundColor(toolbar, editor) {
  if (toolbar.querySelector(".dm-bg-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-bg-btn";
  btn.textContent = "Highlight";

  btn.addEventListener("click", () => {
    openBGWindow(editor);
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}

function openBGWindow(editor) {
  const existing = document.querySelector(".dm-bg-window");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "dm-bg-window";
  container.style.position = "fixed";
  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";
  container.style.background = "#1e1e1e";
  container.style.border = "1px solid #444";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 8px 25px rgba(0,0,0,0.7)";
  container.style.zIndex = "10000";
  container.style.minWidth = "320px";
  container.style.color = "#e6e6e6";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.padding = "10px 14px";
  header.style.background = "#2a2a2a";
  header.style.borderBottom = "1px solid #444";
  header.style.cursor = "move";
  header.style.fontWeight = "600";
  header.textContent = "Highlight";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "#aaa";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => container.remove();

  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.style.padding = "14px";
  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.gap = "12px";

  const presets = ["#ff00ee", "#ffcc00", "#ff6666", "#66ff66", "#66ccff", "#ffffff", "#ff0000"];
  const presetWrap = document.createElement("div");
  presetWrap.style.display = "flex";
  presetWrap.style.gap = "6px";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ffff00";
  colorInput.style.height = "42px";
  colorInput.style.width = "100%";
  colorInput.style.border = "none";
  colorInput.style.cursor = "pointer";

  presets.forEach(hex => {
    const swatch = document.createElement("div");
    swatch.style.width = "22px";
    swatch.style.height = "22px";
    swatch.style.background = hex;
    swatch.style.borderRadius = "4px";
    swatch.style.cursor = "pointer";
    swatch.style.border = "1px solid #555";
    swatch.onclick = () => {
      colorInput.value = hex;
    };
    presetWrap.appendChild(swatch);
  });

  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply Highlight";
  applyBtn.style.padding = "6px";
  applyBtn.style.background = "#444";
  applyBtn.style.border = "1px solid #666";
  applyBtn.style.color = "#fff";
  applyBtn.style.cursor = "pointer";
  applyBtn.style.borderRadius = "4px";

  applyBtn.onclick = () => {
    editor.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("backColor", false, colorInput.value);
    container.remove();
  };

  body.appendChild(presetWrap);
  body.appendChild(colorInput);
  body.appendChild(applyBtn);

  container.appendChild(header);
  container.appendChild(body);
  document.body.appendChild(container);

  makeDraggable(container, header);
}

function makeDraggable(element, handle) {
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  handle.addEventListener("mousedown", e => {
    dragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.transform = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => dragging = false);
}
