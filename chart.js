(() => {
  const TYPES = window.GMON_TYPES;

  const RULES = {
    Normal: { strong: [], weak: ["Rock", "Steel"], immune: ["Ghost"], resists: [], weakTo: ["Fighting"] },
    Fire: { strong: ["Grass", "Ice", "Bug", "Steel"], weak: ["Fire", "Water", "Rock", "Dragon"], immune: [], resists: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"], weakTo: ["Water", "Ground", "Rock"] },
    Water: { strong: ["Fire", "Ground", "Rock"], weak: ["Water", "Grass", "Dragon"], immune: [], resists: ["Fire", "Water", "Ice", "Steel"], weakTo: ["Electric", "Grass"] },
    Electric: { strong: ["Water", "Flying"], weak: ["Electric", "Grass", "Dragon"], immune: ["Ground"], resists: ["Electric", "Flying", "Steel"], weakTo: ["Ground"] },
    Grass: { strong: ["Water", "Ground", "Rock"], weak: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"], immune: [], resists: ["Water", "Electric", "Grass", "Ground"], weakTo: ["Fire", "Ice", "Poison", "Flying", "Bug"] },
    Ice: { strong: ["Grass", "Ground", "Flying", "Dragon"], weak: ["Fire", "Water", "Ice", "Steel"], immune: [], resists: ["Ice"], weakTo: ["Fire", "Fighting", "Rock", "Steel"] },
    Fighting: { strong: ["Normal", "Ice", "Rock", "Dark", "Steel"], weak: ["Poison", "Flying", "Psychic", "Bug", "Fairy"], immune: ["Ghost"], resists: ["Bug", "Rock", "Dark"], weakTo: ["Flying", "Psychic", "Fairy"] },
    Poison: { strong: ["Grass", "Fairy"], weak: ["Poison", "Ground", "Rock", "Ghost"], immune: ["Steel"], resists: ["Grass", "Fighting", "Poison", "Bug", "Fairy"], weakTo: ["Ground", "Psychic"] },
    Ground: { strong: ["Fire", "Electric", "Poison", "Rock", "Steel"], weak: ["Grass", "Bug"], immune: ["Flying"], resists: ["Poison", "Rock"], weakTo: ["Water", "Grass", "Ice"] },
    Flying: { strong: ["Grass", "Fighting", "Bug"], weak: ["Electric", "Rock", "Steel"], immune: [], resists: ["Grass", "Fighting", "Bug"], weakTo: ["Electric", "Ice", "Rock"] },
    Psychic: { strong: ["Fighting", "Poison"], weak: ["Psychic", "Steel"], immune: ["Dark"], resists: ["Fighting", "Psychic"], weakTo: ["Bug", "Ghost", "Dark"] },
    Bug: { strong: ["Grass", "Psychic", "Dark"], weak: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"], immune: [], resists: ["Grass", "Fighting", "Ground"], weakTo: ["Fire", "Flying", "Rock"] },
    Rock: { strong: ["Fire", "Ice", "Flying", "Bug"], weak: ["Fighting", "Ground", "Steel"], immune: [], resists: ["Normal", "Fire", "Poison", "Flying"], weakTo: ["Water", "Grass", "Fighting", "Ground", "Steel"] },
    Ghost: { strong: ["Psychic", "Ghost"], weak: ["Dark"], immune: ["Normal"], resists: ["Poison", "Bug"], weakTo: ["Ghost", "Dark"] },
    Dragon: { strong: ["Dragon"], weak: ["Steel"], immune: ["Fairy"], resists: ["Fire", "Water", "Electric", "Grass"], weakTo: ["Ice", "Dragon", "Fairy"] },
    Dark: { strong: ["Psychic", "Ghost"], weak: ["Fighting", "Dark", "Fairy"], immune: [], resists: ["Ghost", "Dark"], weakTo: ["Fighting", "Bug", "Fairy"] },
    Steel: { strong: ["Ice", "Rock", "Fairy"], weak: ["Fire", "Water", "Electric", "Steel"], immune: [], resists: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"], weakTo: ["Fire", "Fighting", "Ground"] },
    Fairy: { strong: ["Fighting", "Dragon", "Dark"], weak: ["Fire", "Poison", "Steel"], immune: [], resists: ["Fighting", "Bug", "Dark"], weakTo: ["Poison", "Steel"] },
    Sound: { strong: ["Water", "Flying", "Psychic"], weak: ["Rock", "Steel"], immune: [], resists: ["Sound"], weakTo: ["Ground"] },
    Light: { strong: ["Dark", "Ghost"], weak: ["Rock", "Steel"], immune: [], resists: ["Dark", "Ghost", "Light"], weakTo: ["Rock", "Steel"] }
  };

  const CHART_KEY = "gmon.typeChart.v1";
  const TYPE_NAME_KEY = window.GMON_TYPE_NAME_KEY;
  const SOUND_KEY = "gmon.soundEnabled";
  const VALUES = ["1", "1.5", "0.67", "0.33", "0"];
  const MULTIPLIERS = { neutral: "1", super: "1.5", resisted: "0.67", double: "0.33", immune: "0" };

  const head = document.getElementById("chart-head");
  const body = document.getElementById("chart-body");
  const editToggle = document.getElementById("edit-toggle");
  const editLabel = document.getElementById("edit-label");
  const editHint = document.getElementById("edit-hint");
  const resetButton = document.getElementById("reset-chart");
  const soundToggle = document.getElementById("sound-toggle");
  const soundLabel = document.getElementById("sound-label");
  const toast = document.getElementById("toast");
  const renameTypesButton = document.getElementById("rename-types");
  const renameModal = document.getElementById("type-name-modal");
  const closeRenameModalButton = document.getElementById("close-type-name-modal");
  const renameGrid = document.getElementById("type-name-grid");
  const saveRenameButton = document.getElementById("save-type-names");
  const resetRenameButton = document.getElementById("restore-type-names");
  let editing = false;
  let soundEnabled = false;
  let savedChart = readSavedChart();
  let toastTimer;
  let audioContext;

  function readSavedTypeNames() {
    try {
      const saved = JSON.parse(localStorage.getItem(TYPE_NAME_KEY) || "null");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      const names = {};
      for (const type of TYPES) {
        const customName = saved[type.name];
        if (typeof customName === "string" && customName.trim()) names[type.name] = customName.trim();
      }
      return names;
    } catch (error) {
      console.warn("Could not load the saved custom type names.", error);
      return {};
    }
  }

  const customTypeNames = readSavedTypeNames();

  function getTypeDisplayName(typeName) {
    const customName = customTypeNames[typeName];
    return customName && customName.trim() ? customName.trim() : typeName;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function defaultValue(attacker, defender) {
    const rules = RULES[attacker];
    const defense = RULES[defender];
    if (rules.immune.includes(defender)) return MULTIPLIERS.immune;
    if (rules.strong.includes(defender)) return MULTIPLIERS.super;
    if (rules.weak.includes(defender)) return MULTIPLIERS.resisted;
    if (defense.weakTo.includes(attacker)) return MULTIPLIERS.super;
    if (defense.resists.includes(attacker)) return MULTIPLIERS.resisted;
    return MULTIPLIERS.neutral;
  }

  function readSavedChart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CHART_KEY) || "null");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      const valid = {};
      for (const attacker of TYPES) {
        const row = saved[attacker.name];
        if (!row || typeof row !== "object" || Array.isArray(row)) continue;
        const validRow = {};
        for (const defender of TYPES) {
          if (VALUES.includes(String(row[defender.name]))) {
            validRow[defender.name] = String(row[defender.name]);
          }
        }
        if (Object.keys(validRow).length) valid[attacker.name] = validRow;
      }
      return valid;
    } catch (error) {
      console.warn("Could not load the saved type chart.", error);
      return {};
    }
  }

  function getValue(attacker, defender) {
    return savedChart[attacker]?.[defender] ?? defaultValue(attacker, defender);
  }

  function effectFor(value) {
    if (value === "0") return "immune";
    if (value === "0.33") return "double";
    if (value === "0.67") return "resisted";
    if (value === "1.5") return "super";
    return "neutral";
  }

  function typeLabel(type) {
    const label = getTypeDisplayName(type.name);
    return `<span class="type-symbol type-${type.color}" aria-hidden="true">${type.symbol}</span><span>${escapeHtml(label)}</span>`;
  }

  function renderChart() {
    head.innerHTML = `<tr><th class="corner-cell" scope="col"><span class="corner-label">ATK ↓<br>DEF →</span></th>${TYPES.map((type) => `<th class="column-type" scope="col" title="Defending type: ${type.name}">${typeLabel(type)}</th>`).join("")}</tr>`;
    body.innerHTML = TYPES.map((attacker) => {
      const cells = TYPES.map((defender) => {
        const value = getValue(attacker.name, defender.name);
        const effect = effectFor(value);
        const label = value === "1" ? "×1" : `×${value}`;
        const accessibleName = `${attacker.name} attacks ${defender.name}: ${label}`;
        if (!editing) {
          return `<td class="matchup-cell effect-${effect}"><span class="matchup-value" aria-label="${accessibleName}">${label}</span></td>`;
        }
        return `<td class="matchup-cell effect-${effect}"><button class="matchup-edit" type="button" data-attacker="${attacker.name}" data-defender="${defender.name}" aria-label="Edit ${accessibleName}">${label}</button></td>`;
      }).join("");
      return `<tr><th class="row-type" scope="row">${typeLabel(attacker)}</th>${cells}</tr>`;
    }).join("");
  }

  function renderTypeNameEditor() {
    renameGrid.innerHTML = TYPES.map((type) => {
      const currentName = getTypeDisplayName(type.name);
      return `
        <label class="type-name-field">
          <span class="type-name-label">
            <span class="type-symbol type-${type.color}" aria-hidden="true">${type.symbol}</span>
            <span>${escapeHtml(type.name)}</span>
          </span>
          <input type="text" data-type-name="${escapeHtml(type.name)}" value="${escapeHtml(currentName)}" maxlength="22" aria-label="Name for ${escapeHtml(type.name)}">
        </label>
      `;
    }).join("");
  }

  function persistTypeNames() {
    try {
      localStorage.setItem(TYPE_NAME_KEY, JSON.stringify(customTypeNames));
      showToast("Type names saved in this browser");
    } catch (error) {
      console.error("Could not save the custom type names.", error);
      showToast("Could not save type names. Check browser storage settings.");
    }
  }

  function openRenameModal() {
    renderTypeNameEditor();
    renameModal.hidden = false;
  }

  function closeRenameModal() {
    renameModal.hidden = true;
  }

  function persistChart() {
    try {
      localStorage.setItem(CHART_KEY, JSON.stringify(savedChart));
      showToast("Matchup saved in this browser");
    } catch (error) {
      console.error("Could not save the type chart.", error);
      showToast("Could not save changes. Check browser storage settings.");
    }
  }

  function setCell(attacker, defender, value) {
    if (!VALUES.includes(value)) return;
    savedChart[attacker] ||= {};
    if (value === defaultValue(attacker, defender)) {
      delete savedChart[attacker][defender];
      if (Object.keys(savedChart[attacker]).length === 0) delete savedChart[attacker];
    } else {
      savedChart[attacker][defender] = value;
    }
    persistChart();
    playTone();
    renderChart();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function playTone() {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioContext ||= new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.08);
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.14);
    } catch (error) {
      console.warn("Could not play the interface sound.", error);
    }
  }

  editToggle.addEventListener("click", () => {
    editing = !editing;
    editToggle.setAttribute("aria-pressed", String(editing));
    editLabel.textContent = editing ? "Done editing" : "Edit chart";
    editHint.textContent = editing ? "Select any cell to change its effectiveness" : "Attacking types down · defending types across";
    renderChart();
    playTone();
  });

  renameTypesButton.addEventListener("click", () => {
    openRenameModal();
    playTone();
  });

  closeRenameModalButton.addEventListener("click", closeRenameModal);
  renameModal.addEventListener("click", (event) => {
    if (event.target === renameModal) closeRenameModal();
  });

  saveRenameButton.addEventListener("click", () => {
    const nextNames = {};
    renameGrid.querySelectorAll("input[data-type-name]").forEach((input) => {
      const typeName = input.dataset.typeName;
      const value = input.value.trim();
      if (value) nextNames[typeName] = value;
    });

    for (const typeName of Object.keys(customTypeNames)) {
      delete customTypeNames[typeName];
    }
    Object.assign(customTypeNames, nextNames);
    persistTypeNames();
    renderChart();
    closeRenameModal();
  });

  resetRenameButton.addEventListener("click", () => {
    for (const typeName of Object.keys(customTypeNames)) {
      delete customTypeNames[typeName];
    }
    try {
      localStorage.removeItem(TYPE_NAME_KEY);
    } catch (error) {
      console.warn("Could not clear the saved custom type names.", error);
    }
    renderTypeNameEditor();
    renderChart();
    showToast("Type names reset to defaults");
    playTone();
  });

  body.addEventListener("click", (event) => {
    const button = event.target.closest(".matchup-edit");
    if (!button || !editing) return;
    const select = document.createElement("select");
    select.className = "matchup-select";
    select.setAttribute("aria-label", `Effectiveness: ${button.dataset.attacker} against ${button.dataset.defender}`);
    select.innerHTML = VALUES.map((value) => `<option value="${value}">${value === "1" ? "×1" : `×${value}`}</option>`).join("");
    select.value = getValue(button.dataset.attacker, button.dataset.defender);
    button.replaceWith(select);
    select.focus();
    select.addEventListener("change", () => setCell(button.dataset.attacker, button.dataset.defender, select.value), { once: true });
    select.addEventListener("blur", () => {
      if (select.isConnected) renderChart();
    }, { once: true });
  });

  resetButton.addEventListener("click", () => {
    if (!window.confirm("Reset every matchup to the built-in GMon type chart?")) return;
    try {
      localStorage.removeItem(CHART_KEY);
      savedChart = {};
      renderChart();
      showToast("Type chart reset to defaults");
      playTone();
    } catch (error) {
      console.error("Could not reset the type chart.", error);
      showToast("Could not reset the chart. Check browser storage settings.");
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== TYPE_NAME_KEY) return;
    for (const typeName of Object.keys(customTypeNames)) {
      delete customTypeNames[typeName];
    }
    Object.assign(customTypeNames, readSavedTypeNames());
    renderTypeNameEditor();
    renderChart();
  });

  try {
    soundEnabled = localStorage.getItem(SOUND_KEY) === "true";
  } catch (error) {
    console.warn("Could not load the sound preference.", error);
  }
  function updateSoundButton() {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "Sound on" : "Sound off";
  }
  updateSoundButton();
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch (error) {
      console.warn("Could not save the sound preference.", error);
    }
    updateSoundButton();
    playTone();
  });

  renderChart();
})();
