// scripts/enricher-dialog.js
const { api } = foundry.applications;

export class EnricherDialog extends api.HandlebarsApplicationMixin(api.Application) {
  static DEFAULT_OPTIONS = {
    window: { title: "D&D5e Enricher Builder" },
    position: { width: 560, height: "auto" },
    actions: {
      insert: EnricherDialog.#insert
    }
  };

  static PARTS = {
    main: {
      id: "main",
      template: "modules/dm-journal-plus/templates/enricher-dialog.hbs"
    }
  };

  async _prepareContext() {
    const skills = Object.entries(CONFIG.DND5E.skills || {})
      .map(([k, v]) => ({ key: k, label: v?.label ?? k }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const abilities = Object.entries(CONFIG.DND5E.abilities || {})
      .map(([k, v]) => ({ key: k, label: typeof v === "string" ? v : (v?.label ?? k) }));

    const damageTypes = Object.entries(CONFIG.DND5E.damageTypes || {})
      .map(([k, v]) => ({ key: k, label: typeof v === "string" ? v : (v?.label ?? k) }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const conditions = Object.entries(CONFIG.DND5E.conditionTypes || {})
      .map(([k, v]) => ({ key: k, label: typeof v === "string" ? v : (v?.label ?? k) }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { skills, abilities, damageTypes, conditions };
  }

  static async #insert() {
    const el = this.element;
    const pageUuid = this.options.pageUuid;
    const page = await fromUuid(pageUuid);
    const sheet = page?.sheet;
    if (!sheet) return;

    // v13 JournalTextPageSheet expone un editor (TextEditor) accesible vía sheet.getEditor()
    const editor = sheet.getEditor?.();
    if (!editor) {
      ui.notifications.warn("No editor found on this sheet. Make sure the page is in edit mode.");
      return;
    }

    const type = el.querySelector("#dmjp-type")?.value;

    const dc = el.querySelector("#dmjp-dc")?.value?.trim();
    const dice = el.querySelector("#dmjp-dice")?.value?.trim();
    const flavor = el.querySelector("#dmjp-flavor")?.value?.trim();

    const skill = el.querySelector("#dmjp-skill")?.value;
    const ability = el.querySelector("#dmjp-ability")?.value;
    const dmgType = el.querySelector("#dmjp-dmgtype")?.value;
    const condition = el.querySelector("#dmjp-condition")?.value;

    let out = "";

    switch (type) {
      case "skill":
        out = `@Check[${skill}${dc ? ` dc:${dc}` : ""}]`;
        break;

      case "ability":
        out = `@Check[${ability}${dc ? ` dc:${dc}` : ""}]`;
        break;

      case "save":
        out = `@Save[${ability}${dc ? ` dc:${dc}` : ""}]`;
        break;

      case "damage":
        out = `@Damage[${dice || "1d6"} ${dmgType || "fire"}]`;
        break;

      case "condition":
        out = `@Condition[${condition || "poisoned"}]`;
        break;

      case "dice":
        // tú pediste el formato exacto:
        out = `[[/br ${dice || "1d20"}]]${flavor ? `{${flavor}}` : ""}`;
        break;

      default:
        return;
    }

    editor.insertContent(out);
  }
}
