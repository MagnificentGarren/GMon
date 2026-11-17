(() => {
  const profiles = Array.from(document.querySelectorAll("[data-mega-form]"));
  const requestedForm = new URLSearchParams(window.location.search).get("form");
  const selectedProfile = profiles.find((profile) => profile.dataset.megaForm === requestedForm) || profiles[0];
  const selectedForm = selectedProfile.dataset.megaForm;
  const selectedName = selectedProfile.querySelector(".mega-form-heading h2").textContent.trim().replace(/\s+/g, " ");

  profiles.forEach((profile) => {
    profile.hidden = profile !== selectedProfile;
  });

  document.body.dataset.megaForm = selectedForm;
  document.querySelector("#mega-detail-title").textContent = selectedName;
  document.querySelector("#mega-detail-kicker").textContent =
    selectedProfile.querySelector(".mega-form-heading .mega-kicker").textContent;
  document.title = `${selectedName} · Mega Archive — GMon`;

  document.querySelectorAll("[data-form-link]").forEach((link) => {
    if (link.dataset.formLink === selectedForm) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();
