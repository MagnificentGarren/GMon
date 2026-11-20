(() => {
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

  let customTypeNames = readSavedTypeNames();

  function applyTypeNames() {
    document.querySelectorAll("[data-type-name]").forEach((typeElement) => {
      const label = typeElement.matches(".type-label")
        ? typeElement
        : typeElement.querySelector(".type-label");
      if (label) label.textContent = customTypeNames[typeElement.dataset.typeName] || typeElement.dataset.typeName;
    });

    document.querySelectorAll(".timeline-type[data-type-names]").forEach((typeElement) => {
      typeElement.textContent = typeElement.dataset.typeNames
        .split(",")
        .map((name) => customTypeNames[name] || name)
        .join(" · ")
        .toLocaleUpperCase();
    });

    document.querySelectorAll(".evolution-types").forEach((typeList) => {
      const names = Array.from(typeList.querySelectorAll("[data-type-name]"))
        .map((typeElement) => customTypeNames[typeElement.dataset.typeName] || typeElement.dataset.typeName);
      typeList.setAttribute("aria-label", `${names.join(" and ")} types`);
    });
  }

  const profiles = Array.from(document.querySelectorAll(".dex-profile"));
  const stages = profiles.map((profile) => profile.dataset.stage);
  const queryStage = new URLSearchParams(window.location.search).get("stage");
  const selectedStage = stages.includes(queryStage) ? queryStage : stages[0];
  const selectedProfile = profiles.find((profile) => profile.dataset.stage === selectedStage);
  const selectedName = selectedProfile.querySelector("h2").textContent.trim();
  document.body.dataset.stage = selectedStage;

  profiles.forEach((profile) => {
    profile.hidden = profile.dataset.stage !== selectedStage;
  });
  document.querySelectorAll("[data-evolution-line]").forEach((line) => {
    line.hidden = line.dataset.evolutionLine !== selectedProfile.dataset.line;
  });
  document.querySelectorAll(".dex-artwork").forEach((artwork) => {
    artwork.hidden = artwork.dataset.stageArtwork !== selectedStage;
  });
  document.querySelectorAll("[data-stage-mega]").forEach((section) => {
    section.hidden = section.dataset.stageMega !== selectedStage;
  });
  const archiveAnchors = {
    wyrmlit: "first-gmon",
    frostsprout: "frostsprout-line",
    frostnib: "frostnib-line",
    paddlet: "paddlet-line",
    cloakwing: "cloakwing-line",
    noxling: "noxling-line",
    oresaur: "oresaur-line",
    sirpot: "sirpot-line",
    purrvolt: "purrvolt-line",
    purrserg: "purrvolt-line",
    roarserg: "purrvolt-line",
    springlet: "springlet-line",
    cubolt: "cubolt-line",
    protebud: "protebud-line",
    glacite: "glacite-line",
    gleerkat: "gleerkat-line",
    pitapop: "pitapop-line",
    finlux: "finlux-line",
    mothlight: "mothlight-line",
    glimmercraw: "glimmercraw-line",
    twinklet: "twinklet-line",
    astravult: "twinklet-line",
    astroraptor: "twinklet-line",
    champup: "champup-line",
    bramblete: "champup-line",
    scorchlete: "champup-line",
    marilete: "champup-line",
    strikelete: "champup-line",
    grapplete: "champup-line",
    blizlete: "champup-line",
    granilete: "champup-line",
    archlete: "champup-line",
    mossling: "mossling-line",
    terraling: "mossling-line",
    ferntomb: "mossling-line",
    fuseling: "fuseling-line",
    cinderling: "fuseling-line",
    assasinder: "fuseling-line",
    prismolith: "prismolith-line",
    seraphlux: "prismolith-line",
    spectragon: "prismolith-line",
    squirken: "squirken-line",
    tentacloak: "squirken-line",
    shadowken: "squirken-line",
    pandojo: "pandojo-line",
    bambootai: "pandojo-line",
    shinobear: "pandojo-line",
    aeropuff: "aeropuff-line",
    crunite: "crunite-line",
    termivolt: "termivolt-line",
    claymoo: "claymoo-line",
    tubull: "claymoo-line",
    gritgem: "gritgem-line",
    phantrot: "phantrot-line",
    samoosling: "samoosling-line",
    pyrocrust: "samoosling-line",
    slaboo: "slaboo-line",
    tortafel: "slaboo-line",
    wispore: "wispore-line",
    wyrmpyre: "wispore-line",
    cagember: "cagember-line",
    driftgeist: "driftgeist-line",
    shroudlet: "shroudlet-line",
    phantalon: "shroudlet-line",
    phantape: "phantape-line",
    phantone: "phantape-line",
    phantmaestro: "phantape-line",
    bellva: "bellva-line",
    toloon: "bellva-line",
    tymbalion: "bellva-line",
    strumkey: "strumkey-line",
    pianutang: "strumkey-line",
    audillo: "audillo-line",
    shredolin: "audillo-line",
    sonacalf: "sonacalf-line",
    sonabyss: "sonacalf-line",
    ribbeat: "ribbeat-line",
    canvask: "canvask-line",
    prismtail: "canvask-line",
    soottail: "canvask-line",
    claytail: "canvask-line",
    jacktail: "canvask-line",
    nebulight: "nebulight-line",
    nullix: "nebulight-line",
    novari: "nebulight-line",
  };
  const archiveAnchor = archiveAnchors[selectedProfile.dataset.line];
  document.querySelectorAll("[data-archive-link]").forEach((link) => {
    link.href = `gmon.html#${archiveAnchor}`;
  });
  document.querySelector("#selected-stage-name").textContent = `${selectedName}.`;
  document.querySelector("#dex-entry-number").textContent = selectedProfile.dataset.entryNumber;
  const classification = document.querySelector(".dex-classification");
  classification.replaceChildren();
  selectedProfile.dataset.types.split(",").forEach((type, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = "classification-separator";
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "×";
      classification.append(separator);
    }

    const typeLabel = document.createElement("span");
    typeLabel.className = "classification-type type-label";
    typeLabel.dataset.typeName = type;
    typeLabel.textContent = type;
    classification.append(typeLabel);
  });
  document.title = `${selectedName} · GMon Dex`;

  document.querySelectorAll("[data-stage-link]").forEach((link) => {
    if (link.dataset.stageLink === selectedStage) {
      link.setAttribute("aria-current", "step");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  applyTypeNames();
  window.addEventListener("storage", (event) => {
    if (event.key !== window.GMON_TYPE_NAME_KEY) return;
    customTypeNames = readSavedTypeNames();
    applyTypeNames();
  });

  const namespace = "http://www.w3.org/2000/svg";
  const maximum = 150;
  const center = { x: 130, y: 112 };
  const radius = 70;
  const angles = [-90, -30, 30, 90, 150, 210];

  function createSvgElement(tagName, attributes = {}) {
    const element = document.createElementNS(namespace, tagName);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    return element;
  }

  function initializeStatChart(profile) {
    const chart = profile.querySelector(".stat-radar");
    const list = profile.querySelector(".stat-list");
    const readout = profile.querySelector(".stat-readout");
    if (!chart || !list || !readout) return;
    const controls = Array.from(list.querySelectorAll(".stat-select"));
    const entries = controls.map((control) => {
      const label = control.closest("div").querySelector("dt").textContent.trim();
      const value = Number(control.textContent.trim());
      control.setAttribute("aria-label", `${label}: ${value}`);
      return { label, value, control };
    });

    const pointAt = (distance, index) => {
      const radians = (angles[index] * Math.PI) / 180;
      return {
        x: center.x + Math.cos(radians) * distance,
        y: center.y + Math.sin(radians) * distance,
      };
    };
    const gridPoints = (distance) =>
      angles.map((_, index) => {
        const point = pointAt(distance, index);
        return `${point.x},${point.y}`;
      }).join(" ");

    for (let level = 1; level <= 3; level += 1) {
      chart.append(createSvgElement("polygon", {
        class: "stat-grid",
        points: gridPoints((radius * level) / 3),
      }));
    }

    entries.forEach((entry, index) => {
      const axis = pointAt(radius, index);
      const label = pointAt(101, index);
      const text = createSvgElement("text", {
        class: "stat-axis-label",
        x: label.x,
        y: label.y,
        "text-anchor": index === 0 || index === 3 ? "middle" : index < 3 ? "start" : "end",
      });
      text.textContent = entry.label;
      chart.append(
        createSvgElement("line", {
          class: "stat-axis",
          x1: center.x,
          y1: center.y,
          x2: axis.x,
          y2: axis.y,
        }),
        text,
      );
    });

    chart.append(createSvgElement("polygon", {
      class: "stat-shape",
      points: entries.map((entry, index) => {
        const point = pointAt((Math.min(entry.value, maximum) / maximum) * radius, index);
        return `${point.x},${point.y}`;
      }).join(" "),
    }));

    entries.forEach((entry, index) => {
      const point = pointAt((Math.min(entry.value, maximum) / maximum) * radius, index);
      chart.append(createSvgElement("circle", {
        class: "stat-point",
        cx: point.x,
        cy: point.y,
        r: 3.5,
        "data-stat-index": index,
      }));
    });

    function selectStat(index) {
      const entry = entries[index];
      readout.querySelector("strong").textContent = entry.label;
      readout.querySelector("span").textContent = String(entry.value);
      chart.dataset.activeStat = String(index);
      entries.forEach((item, itemIndex) => {
        item.control.classList.toggle("is-active", itemIndex === index);
        chart.querySelector(`[data-stat-index="${itemIndex}"]`).classList.toggle("is-active", itemIndex === index);
      });
    }

    entries.forEach((entry, index) => {
      entry.control.addEventListener("focus", () => selectStat(index));
      entry.control.addEventListener("pointerenter", () => {
        if (!list.contains(document.activeElement)) selectStat(index);
      });
      entry.control.addEventListener("click", () => selectStat(index));
    });

    profile.addEventListener("pointerleave", (event) => {
      if (!profile.contains(event.relatedTarget) && !list.contains(document.activeElement)) {
        selectStat(0);
      }
    });
    selectStat(0);
  }

  document.querySelectorAll(".dex-profile").forEach(initializeStatChart);

})();
