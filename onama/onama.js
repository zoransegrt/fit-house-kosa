(() => {
  // =========================
  // Dropdowns (HEADER ONLY)
  // =========================
  const menus = Array.from(document.querySelectorAll(".menu[data-dropdown]"));

  function closeAll(exceptMenu = null) {
    for (const menu of menus) {
      if (exceptMenu && menu === exceptMenu) continue;
      menu.classList.remove("is-open");

      const type = menu.getAttribute("data-dropdown");
      const trigger = menu.querySelector(`[data-dropdown-trigger="${type}"]`);
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
  }

  function toggleMenu(menu) {
    const isOpen = menu.classList.contains("is-open");
    closeAll(menu);

    menu.classList.toggle("is-open", !isOpen);

    const type = menu.getAttribute("data-dropdown");
    const trigger = menu.querySelector(`[data-dropdown-trigger="${type}"]`);
    if (trigger) trigger.setAttribute("aria-expanded", String(!isOpen));
  }

  for (const menu of menus) {
    const type = menu.getAttribute("data-dropdown");
    const trigger = menu.querySelector(`[data-dropdown-trigger="${type}"]`);
    if (!trigger) continue;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(menu);
    });
  }

  document.addEventListener("click", () => closeAll());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // ✅ close dropdown when any nav link is clicked
  const navLinks = Array.from(
    document.querySelectorAll('[data-dropdown-panel="nav"] a'),
  );
  for (const a of navLinks) a.addEventListener("click", () => closeAll());

  // =========================
  // Header fade-in on load
  // =========================
  const header = document.getElementById("siteHeader");
  if (header) {
    header.classList.add("header-fade");
    requestAnimationFrame(() => header.classList.add("is-visible"));
  }

  // =========================
  // Header visibility ONLY in top zone
  // =========================
  if (header) {
    function getShowZone() {
      return (header.offsetHeight || 296) + 8;
    }

    function updateHeaderVisibility() {
      const y = window.scrollY;
      const zone = getShowZone();

      if (y > zone) {
        header.classList.add("is-hidden");
        closeAll();
      } else {
        header.classList.remove("is-hidden");
      }
    }

    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateHeaderVisibility);
  }

  // =========================
  // Reveal
  // =========================
  const revealTargets = Array.from(document.querySelectorAll(".reveal"));
  if (!revealTargets.length) return;

  if (!("IntersectionObserver" in window)) {
    for (const el of revealTargets) el.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of revealTargets) observer.observe(el);
})();
