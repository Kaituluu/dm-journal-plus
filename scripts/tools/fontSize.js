export function injectFontSize(toolbar, editor) {
  if (toolbar.querySelector(".dm-fontsize-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-fontsize-btn";
  btn.textContent = "Size ▾";

  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    editor.view?.focus();
    openFontSizeDropdown(btn, editor);
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}

/* -------------------------------------------- */

function openFontSizeDropdown(button, editor) {
  let dropdown = document.getElementById("prosemirror-dropdown");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "prosemirror-dropdown";
    dropdown.className = "themed";
  }

  dropdown.innerHTML = "";
  dropdown.appendChild(buildFontSizeMenu(editor));

  document.body.appendChild(dropdown);

  positionDropdown(button, dropdown);

  document.addEventListener("mousedown", closeDropdownOnce, { once: true });
}


/* -------------------------------------------- */

function buildFontSizeMenu(editor) {
  const root = document.createElement("ul");

  const sizes = [12, 14, 16, 18, 22, 28, 30, 32, 36, 40, 48];

  for (const size of sizes) {
    const li = document.createElement("li");
    li.textContent = `${size}px`;

    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      applyFontSize(editor, size);

      const dropdown = document.getElementById("prosemirror-dropdown");
      if (dropdown) dropdown.remove();
    });

    root.appendChild(li);
  }

  return root;
}

/* -------------------------------------------- */

function applyFontSize(editor, px) {
  const root = editor; // editor IS the .editor-content div

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  let el = sel.anchorNode;
  if (!el) return;

  if (el.nodeType !== 1) {
    el = el.parentElement;
  }

  const paragraph = el.closest("p");
  if (!paragraph) return;

  const currentHTML = root.innerHTML;

  // Get exact outerHTML of paragraph
  const oldParagraphHTML = paragraph.outerHTML;

  // Extract current style attribute
  const styleMatch = oldParagraphHTML.match(/style="([^"]*)"/);
  let styleString = styleMatch ? styleMatch[1] : "";

  // Remove existing font-size rule
  styleString = styleString
    .split(";")
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("font-size"))
    .join("; ");

  // Add new font-size
  const newStyle = styleString
    ? `${styleString}; font-size: ${px}px`
    : `font-size: ${px}px`;

  // Build new paragraph HTML safely
  let newParagraphHTML;

  if (styleMatch) {
    newParagraphHTML = oldParagraphHTML.replace(
      /style="[^"]*"/,
      `style="${newStyle}"`
    );
  } else {
    newParagraphHTML = oldParagraphHTML.replace(
      "<p",
      `<p style="${newStyle}"`
    );
  }

  // Replace entire paragraph in content
  const updatedHTML = currentHTML.replace(oldParagraphHTML, newParagraphHTML);

  // Apply updated HTML
  root.innerHTML = updatedHTML;

  // Restore focus
  root.focus();
}




/* -------------------------------------------- */

function positionDropdown(button, dropdown) {
  const rect = button.getBoundingClientRect();

  dropdown.style.position = "fixed";
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.top = `${rect.bottom + 4}px`;
  dropdown.style.zIndex = 10000;
}


/* -------------------------------------------- */

function closeDropdownOnce(e) {
  const dropdown = document.getElementById("prosemirror-dropdown");
  if (!dropdown) return;

  if (!dropdown.contains(e.target)) {
    dropdown.remove();
  }
}
