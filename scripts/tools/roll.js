export function injectRoll(toolbar, editor) {
  if (toolbar.querySelector(".dm-roll-btn")) return;

  const li = document.createElement("li");
  li.className = "text";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dm-roll-btn";
  btn.textContent = "Roll ▾";

  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openRollDropdown(btn, editor);
  });

  li.appendChild(btn);
  toolbar.appendChild(li);
}

/* -------------------------------------------- */

function openRollDropdown(button, editor) {
  let dropdown = document.getElementById("prosemirror-dropdown");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "prosemirror-dropdown";
    dropdown.className = "themed theme-light";
    document.body.appendChild(dropdown);
  }

  dropdown.innerHTML = "";
  dropdown.appendChild(buildRollMenu(editor));

  positionDropdown(button, dropdown);
}

/* -------------------------------------------- */

function buildRollMenu(editor) {
  const root = document.createElement("ul");

  // SKILLS
  root.appendChild(
    buildSubmenu("Skills", [
      { label: "Strength", code: "[[/check Strength dc 10]]{Flavor}" },
      { label: "Dexterity", code: "[[/check Dexterity dc 10]]{Flavor}" },
      { label: "Constitution", code: "[[/check Constitution dc 10]]{Flavor}" },
      { label: "Intelligence", code: "[[/check Intelligence dc 10]]{Flavor}" },
      { label: "Wisdom", code: "[[/check Wisdom dc 10]]{Flavor}" },
      { label: "Charisma", code: "[[/check Charisma dc 10]]{Flavor}" } 
      



    ], editor)
  );
  //skills (simple checks)
 root.appendChild(
    buildSubmenu("Skills", [
      { label: "Acrobatics", code: "[[/check skill=acrobatics dc 10]]{Flavor}" },
      { label: "Animal Handling", code: "[[/check skill=animal-handling dc 10]]{Flavor}" },
      { label: "Arcana", code: "[[/check skill=arcana dc 10]]{Flavor}" },
      { label: "Athletics", code: "[[/check skill=athletics dc 10]]{Flavor}" },
      { label: "Deception", code: "[[/check skill=deception dc 10]]{Flavor}" },
      { label: "History", code: "[[/check skill=history dc 10]]{Flavor}" },
      { label: "Insight", code: "[[/check skill=insight dc 10]]{Flavor}" },
      { label: "Intimidation", code: "[[/check skill=intimidation dc 10]]{Flavor}" },
      { label: "Investigation", code: "[[/check skill=investigation dc 10]]{Flavor}" },
      { label: "Medicine", code: "[[/check skill=medicine dc 10]]{Flavor}" },
      { label: "Nature", code: "[[/check skill=nature dc 10]]{Flavor}" },
      { label: "Perception", code: "[[/check skill=perception dc 10]]{Flavor}" },
      { label: "Performance", code: "[[/check skill=performance dc 10]]{Flavor}" },
      { label: "Persuasion", code: "[[/check skill=persuasion dc 10]]{Flavor}" },
      { label: "Religion", code: "[[/check skill=religion dc 10]]{Flavor}" },
      { label: "Sleight of Hand", code: "[[/check skill=sleight-of-hand dc 10]]{Flavor}" },
      { label: "Stealth", code: "[[/check skill=stealth dc 10]]{Flavor}" },
      { label: "Survival", code: "[[/check skill=survival dc 10]]{Flavor}" }  



    ], editor)
  );
  // SAVES (no DCs anymore)
  root.appendChild(
    buildSubmenu("Saves", [
      { label: "STR Save", code: "[[/save Strength DC 10]]{Flavor}" },
      { label: "DEX Save", code: "[[/save Dexterity DC 10]]{Flavor}" },
      { label: "CON Save", code: "[[/save Constitution DC 10]]{Flavor}" },
      { label: "INT Save", code: "[[/save Intelligence DC 10]]{Flavor}" },
      { label: "WIS Save", code: "[[/save Wisdom DC 10]]{Flavor}" },
      { label: "CHA Save", code: "[[/save Charisma DC 10]]{Flavor}" }

    ], editor)
  );

  // DAMAGE (simple dice rolls)
  root.appendChild(
    buildSubmenu("Damage", [
      { label: "1d4", code: "[[/r 1d4]]" },
      { label: "1d6", code: "[[/r 1d6]]" },
      { label: "1d8", code: "[[/r 1d8]]" },
      { label: "1d10", code: "[[/r 1d10]]" },
      { label: "1d12", code: "[[/r 1d12]]" },
      { label: "2d6", code: "[[/r 2d6]]" }
    ], editor)
  );
  root.appendChild(
    buildSubmenu("Others", [
      { label: "Heal", code: "[[/heal 2d4 + 2]]" },
      { label: "Damage", code: "[[/damage 2d8 + 2]]" },
      { label: "Temp HP", code: "[[/heal 10 temp]]" }

    ], editor)
  );
  return root;
}

/* -------------------------------------------- */

function buildSubmenu(title, items, editor) {
  const li = document.createElement("li");
  li.dataset.action = title.toLowerCase();

  const span = document.createElement("span");
  span.textContent = title;

  const icon = document.createElement("i");
  icon.className = "fa-solid fa-chevron-right";

  li.appendChild(span);
  li.appendChild(icon);

  const subUl = document.createElement("ul");

  for (const item of items) {
    subUl.appendChild(buildItem(item.label, item.code, editor));
  }

  li.appendChild(subUl);

  return li;
}

/* -------------------------------------------- */

function buildItem(label, code, editor) {
  const li = document.createElement("li");
  li.textContent = label;

  li.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    editor.focus();
    document.execCommand("insertText", false, code);

    const dropdown = document.getElementById("prosemirror-dropdown");
    if (dropdown) dropdown.remove();
  });

  return li;
}

/* -------------------------------------------- */

function positionDropdown(button, dropdown) {
  const rect = button.getBoundingClientRect();

  dropdown.style.position = "fixed";
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.top = `${rect.bottom + 4}px`;
  dropdown.style.zIndex = 10000;
}
