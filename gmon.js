(() => {
  const gmonEntries = Array.from(document.querySelectorAll(".evolution-card"));
  const search = document.getElementById("gmon-search");
  const filterToggle = document.getElementById("type-filter-toggle");
  const filterPopover = document.getElementById("type-filter-popover");
  const filterOptions = document.getElementById("type-filter-options");
  const filterCount = document.getElementById("filter-selected-count");
  const clearFiltersButton = document.getElementById("clear-type-filters");
  const resultCount = document.getElementById("gmon-result-count");
  const emptyState = document.getElementById("archive-empty");
  const statsGrid = document.getElementById("type-stats-grid");
  const entryCount = document.getElementById("gmon-entry-count");
  const types = window.GMON_TYPES;
  let customTypeNames = readSavedTypeNames();

  function readSavedTypeNames() {
    try {
      const saved = JSON.parse(localStorage.getItem(window.GMON_TYPE_NAME_KEY) || "null");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      const names = {};
      for (const type of window.GMON_TYPES) {
        const customName = saved[type.name];
        if (typeof customName === "string" && customName.trim()) {
          names[type.name] = customName.trim();
        }
      }
      return names;
    } catch (error) {
      console.warn("Could not load the saved custom type names.", error);
      return {};
    }
  }

  function displayTypeName(typeName) {
    return customTypeNames[typeName] || typeName;
  }

  function updateTypeLabels() {
    document.querySelectorAll("[data-type-name]").forEach((typeElement) => {
      const label = typeElement.matches(".type-label")
        ? typeElement
        : typeElement.querySelector(".type-label");
      if (label) label.textContent = displayTypeName(typeElement.dataset.typeName);
    });

    document.querySelectorAll(".evolution-types").forEach((typeList) => {
      const labels = Array.from(typeList.querySelectorAll("[data-type-name]"))
        .map((typeElement) => displayTypeName(typeElement.dataset.typeName));
      typeList.setAttribute("aria-label", `${labels.join(" and ")} types`);
    });
  }

  function renderTypeFilterOptions() {
    filterOptions.replaceChildren();
    types.forEach((type) => {
      const label = document.createElement("label");
      label.className = "type-filter-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = type.name;
      input.dataset.typeName = type.name;
      input.addEventListener("change", renderArchive);

      const symbolElement = document.createElement("span");
      symbolElement.className = `type-symbol type-${type.color}`;
      symbolElement.setAttribute("aria-hidden", "true");
      symbolElement.textContent = type.symbol;

      const nameElement = document.createElement("span");
      nameElement.className = "type-label";
      nameElement.textContent = displayTypeName(type.name);
      label.append(input, symbolElement, nameElement);
      filterOptions.append(label);
    });
  }

  function renderTypeStats() {
    statsGrid.replaceChildren();
    types.forEach((type) => {
      const count = gmonEntries.filter((entry) =>
        entry.dataset.types.split(",").includes(type.name)
      ).length;
      if (count === 0) return;
      const item = document.createElement("div");
      item.className = "type-stat-card";

      const symbolElement = document.createElement("span");
      symbolElement.className = `type-symbol type-${type.color}`;
      symbolElement.setAttribute("aria-hidden", "true");
      symbolElement.textContent = type.symbol;

      const nameElement = document.createElement("span");
      nameElement.className = "type-stat-name";
      nameElement.textContent = displayTypeName(type.name);

      const countElement = document.createElement("strong");
      countElement.textContent = String(count);
      countElement.setAttribute("aria-label", `${count} GMon`);

      item.append(symbolElement, nameElement, countElement);
      statsGrid.append(item);
    });
  }

  function renderArchive() {
    const query = search.value.trim().toLocaleLowerCase();
    const selectedTypes = new Set(
      Array.from(filterOptions.querySelectorAll("input:checked"), (input) => input.value)
    );
    let visibleCount = 0;

    gmonEntries.forEach((entry) => {
      const gmonName = entry.querySelector("h3").textContent.toLocaleLowerCase();
      const entryTypes = entry.dataset.types.split(",");
      const matchesName = !query || gmonName.includes(query);
      const matchesType = selectedTypes.size === 0 || entryTypes.some((type) => selectedTypes.has(type));
      const visible = matchesName && matchesType;
      entry.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    document.querySelectorAll(".evolution-line").forEach((line) => {
      const visibleCards = Array.from(line.querySelectorAll(".evolution-card"))
        .filter((entry) => !entry.hidden);
      line.dataset.visibleCount = String(visibleCards.length);
      line.closest(".first-gmon").hidden = visibleCards.length === 0;
    });

    filterCount.textContent = selectedTypes.size ? String(selectedTypes.size) : "";
    resultCount.textContent = `Showing ${visibleCount} of ${gmonEntries.length} GMon entries`;
    emptyState.hidden = visibleCount > 0;
  }

  filterToggle.addEventListener("click", () => {
    const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.setAttribute("aria-expanded", String(!isExpanded));
    filterPopover.hidden = isExpanded;
  });
  document.addEventListener("click", (event) => {
    if (!filterPopover.hidden && !filterToggle.parentElement.contains(event.target)) {
      filterPopover.hidden = true;
      filterToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !filterPopover.hidden) {
      filterPopover.hidden = true;
      filterToggle.setAttribute("aria-expanded", "false");
      filterToggle.focus();
    }
  });
  search.addEventListener("input", renderArchive);
  clearFiltersButton.addEventListener("click", () => {
    search.value = "";
    filterOptions.querySelectorAll("input:checked").forEach((input) => {
      input.checked = false;
    });
    renderArchive();
  });

  updateTypeLabels();
  renderTypeFilterOptions();
  renderTypeStats();
  entryCount.textContent = String(gmonEntries.length).padStart(2, "0");
  renderArchive();

  window.addEventListener("storage", (event) => {
    if (event.key !== window.GMON_TYPE_NAME_KEY) return;
    customTypeNames = readSavedTypeNames();
    updateTypeLabels();
    renderTypeFilterOptions();
    renderTypeStats();
    renderArchive();
  });
})();
