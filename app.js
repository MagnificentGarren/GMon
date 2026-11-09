(() => {
  const THEME_KEY = "gmon.theme";
  const themes = ["light", "dark", "alternate"];

  function applyTheme(theme) {
    const selected = themes.includes(theme) ? theme : "light";
    document.documentElement.dataset.theme = selected;
    try {
      localStorage.setItem(THEME_KEY, selected);
    } catch (error) {
      console.warn("Could not save the selected theme.", error);
    }

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const active = button.dataset.themeChoice === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "light";
  } catch (error) {
    console.warn("Could not load the saved theme.", error);
  }
  applyTheme(savedTheme);

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });

  document.querySelectorAll("[data-page-transition]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) return;

      event.preventDefault();
      document.body.classList.add("is-transitioning-out");
      window.setTimeout(() => {
        window.location.assign(link.href);
      }, 160);
    });
  });
})();
