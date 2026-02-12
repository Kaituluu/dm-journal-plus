import { detectEditor } from "./editor-detector.js";

Hooks.on("renderJournalEntryPageSheet", (app, html) => {
  if (!app.isEditable) return;

  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;

  detectEditor(root);
});