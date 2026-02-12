export function injectFontSize(toolbar, editor) {
  if (toolbar.querySelector(".dm-fontsize")) return;
    console.log("Injecting font size selector");    
  const li = document.createElement("li");
  li.className = "text";

  const select = document.createElement("select");
  select.className = "dm-fontsize";

  select.innerHTML = `
    <option value="">Size</option>
    <option value="12">12px</option>
    <option value="14">14px</option>
    <option value="16">16px</option>
    <option value="18">18px</option>
    <option value="22">22px</option>
    <option value="28">28px</option>
  `;

  select.addEventListener("change", e => {
    if (!e.target.value) return;

    applyFontSize(editor, e.target.value);
    select.value = "";
  });

  li.appendChild(select);
  toolbar.appendChild(li);
}

function applyFontSize(editor, px) {
  editor.focus();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  let node = selection.anchorNode;

  while (node && node.nodeName !== "P") {
    node = node.parentNode;
  }

  if (!node) return;

  const content = node.innerHTML;

  const styledHTML = `<p style="font-size:${px}px">${content}</p>`;

  // Replace paragraph via editor command (not DOM mutation)
  node.outerHTML = styledHTML;
}
