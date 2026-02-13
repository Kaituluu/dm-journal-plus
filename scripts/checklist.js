let activePage = null;

export function initializeChecklist() {

  // Store current page when ProseMirror sheet renders
  Hooks.on("renderJournalEntryPageProseMirrorSheet", (app) => {
    activePage = app.document;
    console.log("Checklist: Active page set:", activePage?.id);
  });

  // Handle checklist click
  document.addEventListener("click", async (event) => {

    const item = event.target.closest(".dm-check-item");
    if (!item) return;

    if (!activePage) {
      console.warn("Checklist: No active page.");
      return;
    }

    console.log("Clicked checklist item");

    // Toggle state
    const isChecked = item.dataset.checked === "true";
    const newState = (!isChecked).toString();
    item.dataset.checked = newState;

    console.log("New state:", newState);

    // Get ONLY the journal content section
    const contentSection = document.querySelector(
      ".journal-page-content"
    );

    if (!contentSection) {
      console.warn("Checklist: No content section found.");
      return;
    }

    const newHTML = contentSection.innerHTML;

    // Persist to document
    await activePage.update({
      "text.content": newHTML
    });

    console.log("Checklist: Page updated.");
  });
}
