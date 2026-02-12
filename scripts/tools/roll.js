export function injectRoll(toolbar, editor) {
  if (toolbar.querySelector(".dm-roll-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-roll-btn";
  btn.textContent = "Roll";

  btn.addEventListener("click", () => {
    editor.focus();
    document.execCommand("insertText", false, "[[1d20]]");
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}
