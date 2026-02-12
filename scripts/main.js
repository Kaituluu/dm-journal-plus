// ===============================
// DM Journal Plus — Dropdown Test
// Foundry VTT v13
// ===============================

console.log("DM Journal Plus loaded");

Hooks.on("renderJournalEntryPageSheet", (app, html) => {
  if (!app.isEditable) return;

  const root = html instanceof HTMLElement ? html : html[0];
  if (!(root instanceof HTMLElement)) return;

  waitForEditor(root);
});

// ======================================
// Wait for ProseMirror + Editor Menu
// ======================================

function waitForEditor(root) {
  const observer = new MutationObserver(() => {
    const editor = root.querySelector(".ProseMirror");
    const toolbar = root.querySelector(".editor-menu");

    if (!editor || !toolbar) return;

    ensureDropdown(toolbar, editor);
    ensureDropdown(toolbar, editor);
    ensureFontSizeControl(toolbar, editor); 
    ensureColorControl(toolbar, editor);
  });

  observer.observe(root, { childList: true, subtree: true });
}


// ======================================
// Inject Dropdown Control
// ======================================

function ensureDropdown(toolbar, editor) {
  if (toolbar.querySelector(".custom-roll-dropdown")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "editor-control custom-roll-dropdown";

  const select = document.createElement("select");
  select.className = "journal-roll-select";

  select.innerHTML = `
    <option value="">Insert Roll</option>
    <option value="[[1d20]]">1d20</option>
    <option value="[[1d20+5]]">1d20+5</option>
    <option value="[[/r 2d6]]">2d6</option>
  `;

  select.addEventListener("change", (event) => {
    const value = event.target.value;
    if (!value) return;

    insertAtCursor(editor, value);
    select.value = "";
  });

  wrapper.appendChild(select);
  toolbar.appendChild(wrapper);

  console.log("Dropdown ensured in toolbar");
}

// ======================================
// Insert Text at Cursor (Safe v13)
// ======================================

function insertAtCursor(editor, text) {
  editor.focus();

  // Still safe for now in Chromium
  document.execCommand("insertText", false, text);
}
function ensureFontSizeControl(toolbar, editor) {
  if (toolbar.querySelector(".custom-fontsize-dropdown")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "editor-control custom-fontsize-dropdown";

  const select = document.createElement("select");
  select.className = "journal-fontsize-select";

  select.innerHTML = `
    <option value="">Font Size</option>
    <option value="12">12px</option>
    <option value="14">14px</option>
    <option value="16">16px</option>
    <option value="18">18px</option>
    <option value="22">22px</option>
    <option value="28">28px</option>
  `;

  select.addEventListener("change", (event) => {
    const size = event.target.value;
    if (!size) return;

    applyFontSize(editor, size);
    select.value = "";
  });

  wrapper.appendChild(select);
  toolbar.appendChild(wrapper);

  console.log("Font size control ensured");
}
function applyFontSize(editor, size) {
  editor.focus();

  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText.length > 0) {
    const span = `<span style="font-size:${size}px">${selectedText}</span>`;
    document.execCommand("insertHTML", false, span);
  } else {
    const span = `<span style="font-size:${size}px">Text</span>`;
    document.execCommand("insertHTML", false, span);
  }
}
function ensureColorControl(toolbar, editor) {
  if (toolbar.querySelector(".custom-color-button")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "editor-control custom-color-button";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = "🎨";
  btn.title = "Text Color";

  btn.addEventListener("click", () => {
    openColorPicker(editor, btn);
  });

  wrapper.appendChild(btn);
  toolbar.appendChild(wrapper);

  console.log("Color control ensured");
}

function openColorPicker(editor, anchorButton) {
  // Remove existing picker if any
  const existing = document.querySelector(".journal-color-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.className = "journal-color-popup";
  popup.style.position = "absolute";
  popup.style.background = "#2b2b2b";
  popup.style.padding = "10px";
  popup.style.border = "1px solid #555";
  popup.style.borderRadius = "6px";
  popup.style.zIndex = "1000";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";

  const rect = anchorButton.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ffffff";

  const hexInput = document.createElement("input");
  hexInput.type = "text";
  hexInput.value = "#ffffff";
  hexInput.style.marginLeft = "6px";
  hexInput.style.width = "80px";

  colorInput.addEventListener("input", () => {
    hexInput.value = colorInput.value;
  });

  hexInput.addEventListener("input", () => {
    colorInput.value = hexInput.value;
  });

  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply";
  applyBtn.style.marginLeft = "6px";

  applyBtn.addEventListener("click", () => {
    applyTextColor(editor, colorInput.value);
    popup.remove();
  });

  popup.appendChild(colorInput);
  popup.appendChild(hexInput);
  popup.appendChild(applyBtn);

  document.body.appendChild(popup);

  // Close if clicked outside
  setTimeout(() => {
    document.addEventListener("click", function closePopup(e) {
      if (!popup.contains(e.target) && e.target !== anchorButton) {
        popup.remove();
        document.removeEventListener("click", closePopup);
      }
    });
  }, 0);
}
function applyTextColor(editor, color) {
  editor.focus();

  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText.length > 0) {
    const span = `<span style="color:${color}">${selectedText}</span>`;
    document.execCommand("insertHTML", false, span);
  } else {
    const span = `<span style="color:${color}">Text</span>`;
    document.execCommand("insertHTML", false, span);
  }
}
