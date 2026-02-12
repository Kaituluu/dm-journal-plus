// scripts/prosemirror-style-tools.js
import { modifyMark, getPreserveFromSelection, mergeCssText } from "./pm-utils.js";

const MODULE_ID = "dm-journal-plus";

/**
 * Encuentra la view ProseMirror desde el HTML del sheet.
 */
function getEditorView(root) {
  const pm = root.querySelector("prose-mirror");
  if (!pm) return null;
  return pm.view || pm.editorView || pm.editor?.view || pm._editor?.view || pm._view || null;
}

/**
 * Encuentra el menu DOM del toolbar ProseMirror de forma robusta (themes friendly).
 */
function findMenu(root) {
  // intentos comunes
  return (
    root.querySelector(".prosemirror-menu") ||
    root.querySelector("menu.prosemirror") ||
    root.querySelector("menu") ||
    null
  );
}

/**
 * Inserta nuestros controles SIN eliminar los controles nativos.
 * Los colocamos después del dropdown de fuentes si existe, si no, al final.
 */
export function injectStyleTools(app, html) {
  const root = html?.[0];
  if (!root) return;

  // evitar duplicado
  if (root.querySelector(`[data-${MODULE_ID}-style="1"]`)) return;

  const menu = findMenu(root);
  if (!menu) return;

  const view = getEditorView(root);
  if (!view) return;

  const schema = view.state.schema;
  const markType = schema?.marks?.span;
  if (!markType) return;

  // Creamos contenedor <li class="text"> para encajar con Foundry
  const li = document.createElement("li");
  li.classList.add("text");
  li.dataset[`${MODULE_ID}Style`] = "1";
  li.setAttribute(`data-${MODULE_ID}-style`, "1");

  const wrap = document.createElement("div");
  wrap.className = "dmjp-style-wrap";

  // Text color
  const color = document.createElement("input");
  color.type = "color";
  color.className = "dmjp-color";
  color.title = "Text Color";

  // Background color (highlight)
  const bg = document.createElement("input");
  bg.type = "color";
  bg.className = "dmjp-bg";
  bg.title = "Text Background";

  // Presets (aplican varias props)
  const preset = document.createElement("select");
  preset.className = "dmjp-preset font-quill-select";
  preset.title = "Style Preset";
  preset.innerHTML = `
    <option value="">Preset</option>
    <option value="readaloud">Read Aloud</option>
    <option value="dmsecret">DM Secret</option>
    <option value="warning">Warning</option>
    <option value="lore">Lore</option>
    <option value="reset">Reset Style</option>
  `;

  wrap.append(color, bg, preset);
  li.append(wrap);

  // Insertar después del dropdown de fuentes si existe
  const fontLi =
    menu.querySelector("li.text button.pm-dropdown.fonts")?.closest("li.text") ||
    menu.querySelector("li.text") ||
    null;

  if (fontLi) fontLi.insertAdjacentElement("afterend", li);
  else menu.append(li);

  // listeners
  color.addEventListener("change", () => applyStyle(view, markType, { color: color.value }));
  bg.addEventListener("change", () => applyStyle(view, markType, { backgroundColor: bg.value }));

  preset.addEventListener("change", () => {
    const v = preset.value;
    if (!v) return;

    if (v === "reset") {
      applyStyle(view, markType, { reset: true });
      preset.value = "";
      return;
    }

    const presets = {
      readaloud: {
        backgroundColor: "#2b1d10",
        color: "#f2e6d8",
        fontStyle: "italic"
      },
      dmsecret: {
        backgroundColor: "#2a0000",
        color: "#ffe6e6",
        fontWeight: "700"
      },
      warning: {
        backgroundColor: "#332100",
        color: "#fff2cc",
        fontWeight: "700"
      },
      lore: {
        backgroundColor: "#0b1d2b",
        color: "#d6ecff",
        fontStyle: "italic"
      }
    };

    applyStyle(view, markType, presets[v]);
    preset.value = "";
  });

  // marcador para no duplicar
  const marker = document.createElement("div");
  marker.style.display = "none";
  marker.setAttribute(`data-${MODULE_ID}-style`, "1");
  root.append(marker);
}

function applyStyle(view, markType, patch) {
  const { state, dispatch } = view;
  const { selection } = state;

  const _preserve = getPreserveFromSelection(state, markType, selection);
  const existingStyle = _preserve?.style || "";

  const newCssText = mergeCssText(existingStyle, (style) => {
    if (patch.reset) {
      // borrar todo estilo (solo dentro del span preserve)
      style.cssText = "";
      return;
    }

    if (patch.color) style.setProperty("color", patch.color);
    if (patch.backgroundColor) style.setProperty("background-color", patch.backgroundColor);
    if (patch.fontWeight) style.setProperty("font-weight", patch.fontWeight);
    if (patch.fontStyle) style.setProperty("font-style", patch.fontStyle);
  });

  modifyMark(
    markType,
    state,
    dispatch,
    {
      _preserve: {
        ..._preserve,
        style: newCssText
      }
    },
    {
      includeWhitespace: false,
      modify: newCssText.length >= 1
    }
  );
}
