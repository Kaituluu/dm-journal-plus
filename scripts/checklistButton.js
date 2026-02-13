export function injectChecklistButton(toolbar, editor) {
  if (!toolbar || toolbar.querySelector(".dm-checklist-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-checklist-btn";
  btn.textContent = "Checklist";

  // IMPORTANT: mousedown, not click (matches roll.js behavior)
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    insertChecklist(editor);
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}

function insertChecklist(editor) {
  if (!editor) return;

  editor.focus();

  const checklistHTML =
`<ul class="dm-checklist">
  <li class="dm-check-item" data-checked="false">New task</li>
</ul>`;

  // Try HTML insert first
  const ok = document.execCommand("insertHTML", false, checklistHTML);

  // Fallback: if insertHTML blocked, insert as text (still usable)
  if (!ok) {
    document.execCommand("insertText", false, checklistHTML);
  }
}
