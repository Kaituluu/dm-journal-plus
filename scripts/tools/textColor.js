export function injectTextColor(toolbar, editor) {
  if (toolbar.querySelector(".dm-color-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-color-btn";
  btn.textContent = "Text Color";

  btn.addEventListener("click", () => {
    openColorWindow(editor);
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}

function openColorWindow(editor) {
  const existing = document.querySelector(".dm-color-window");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "dm-color-window";
  container.style.position = "fixed";
  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";
  container.style.background = "var(--color-bg-alt)";
  container.style.border = "1px solid var(--color-border-light)";
  container.style.borderRadius = "6px";
  container.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)";
  container.style.zIndex = "10000";
  container.style.minWidth = "320px";
  container.style.fontFamily = "var(--font-primary)";
  container.style.color = "var(--color-text-light)";

  // Header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.padding = "8px 12px";
  header.style.background = "var(--color-bg)";
  header.style.borderBottom = "1px solid var(--color-border-light)";
  header.style.cursor = "move";
  header.style.fontWeight = "600";
  header.textContent = "Text Color";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "inherit";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "14px";
  closeBtn.addEventListener("click", () => container.remove());

  header.appendChild(closeBtn);

  // Body
  const body = document.createElement("div");
  body.style.padding = "16px";
  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.gap = "10px";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ff0000";
  colorInput.style.height = "50px";
  colorInput.style.width = "100%";
  colorInput.style.cursor = "pointer";

  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply Color";
  applyBtn.style.padding = "6px";
  applyBtn.style.cursor = "pointer";

  applyBtn.addEventListener("click", () => {
    editor.focus();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, colorInput.value);
    container.remove();
  });

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
  let isDragging = false;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.transform = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
