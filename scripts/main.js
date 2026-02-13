import { detectEditor } from "./editor-detector.js";
import { initializeChecklist } from "./checklist.js";
import { injectChecklistButton } from "./checklistButton.js";

// Track active page globally
export let activePage = null;

// When the ProseMirror sheet renders
Hooks.on("renderJournalEntryPageProseMirrorSheet", (app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;

  // Store active page correctly
  activePage = app.document;
  //console.log("Checklist: Active page set:", activePage?.id);

  // Detect editor + toolbar
  detectEditor(root, app.editor, injectChecklistButton);
});

// Initialize checklist click handling once
Hooks.once("ready", () => {
  initializeChecklist(() => activePage);
});
