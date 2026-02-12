// scripts/pm-utils.js

/**
 * Modifica un mark (span) sobre la selección actual en ProseMirror,
 * removiéndolo y re-aplicándolo con nuevos attrs si corresponde.
 */
export function modifyMark(markType, state, dispatch, attrs = null, options = {}) {
  const dropSpace = !options.includeWhitespace;
  const { ranges } = state.selection;

  if (!dispatch) return true;

  let tr = state.tr;

  for (const { $from, $to } of ranges) {
    let from = $from.pos, to = $to.pos;
    const start = $from.nodeAfter, end = $to.nodeBefore;

    const spaceStart = dropSpace && start?.isText ? /^\s*/.exec(start.text)[0].length : 0;
    const spaceEnd = dropSpace && end?.isText ? /\s*$/.exec(end.text)[0].length : 0;

    if (from + spaceStart < to) {
      from += spaceStart;
      to -= spaceEnd;
    }

    tr = tr.removeMark(from, to, markType);

    if (options.modify) {
      tr = tr.addMark(from, to, markType.create(attrs));
    }
  }

  dispatch(tr.scrollIntoView());
  return true;
}

/**
 * Busca _preserve actual (attrs) dentro de la selección para mantener estilos existentes.
 */
export function getPreserveFromSelection(state, markType, selection) {
  let _preserve = {};
  state.doc.nodesBetween(selection.from, selection.to, (node) => {
    const mark = node.marks?.find((m) => m.type.name === markType.name && m.attrs?._preserve);
    if (mark) {
      _preserve = mark.attrs._preserve;
      return false;
    }
  });
  return _preserve;
}

/**
 * Combina estilos CSS manteniendo los existentes y ajustando una propiedad.
 */
export function mergeCssText(existingCssText, patchFn) {
  const spanStyle = Object.assign(document.createElement("span"), { style: existingCssText || "" }).style;
  patchFn(spanStyle);
  return spanStyle.cssText;
}
