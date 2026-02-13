import { injectRoll } from "./tools/roll.js";
import { injectFontSize } from "./tools/fontSize.js";
import { injectTextColor } from "./tools/textColor.js";
import { injectBackgroundColor } from "./tools/backgroundColor.js";
import { injectChecklistButton } from "./checklistButton.js";
export function detectEditor(root) {
  const observer = new MutationObserver(() => {
    const editor = root.querySelector(".ProseMirror");
    const toolbar = root.querySelector("menu.editor-menu");

    if (!editor || !toolbar) return;

    injectRoll(toolbar, editor);
    injectFontSize(toolbar, editor);
    injectTextColor(toolbar, editor);
    injectBackgroundColor(toolbar, editor);
    injectChecklistButton(toolbar, editor);
  });

  observer.observe(root, { childList: true, subtree: true });
}
