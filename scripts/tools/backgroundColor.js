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

  container.innerHTML = `
    <div class="dm-window-header">
      <span>Highlight</span>
      <button class="dm-close-btn">✕</button>
    </div>
    <div class="dm-window-body">
      <input type="color" class="dm-color-input" value="#ffff00"/>
      <button class="dm-apply-btn">Apply Highlight</button>
    </div>
  `;

  document.body.appendChild(container);

  const closeBtn = container.querySelector(".dm-close-btn");
  closeBtn.addEventListener("click", () => container.remove());

  const applyBtn = container.querySelector(".dm-apply-btn");
  const colorInput = container.querySelector(".dm-color-input");

  applyBtn.addEventListener("click", () => {
    editor.focus();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    let node = selection.anchorNode;

    while (node && node.nodeType === 1) {
      if (node.style && node.style.backgroundColor) {
        node.style.backgroundColor = colorInput.value;
        container.remove();
        return;
      }
      node = node.parentElement;
    }

    document.execCommand("styleWithCSS", false, true);
    document.execCommand("backColor", false, colorInput.value);

    container.remove();
  });

  makeDraggable(container, container.querySelector(".dm-window-header"));
}


function makeDraggable(element, handle) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientX ? (e.clientY - element.offsetTop) : 0;
    element.style.transform = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - (e.clientY - element.offsetTop - (e.clientY - element.offsetTop))}px`;
    // simpler: fix below (see note)
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
function removeBackgroundStyles(fragment) {
    console.log("Removing background  styles from selection");
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.style && node.style.backgroundColor) {
      node.style.backgroundColor = "transparent";
    }
  }
}
