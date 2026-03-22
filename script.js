(() => {
  // =========================
  // Dropdowns
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

  const langButtons = Array.from(
    document.querySelectorAll(".lang-option[data-lang]")
  );
  for (const btn of langButtons) {
    btn.addEventListener("click", () => closeAll());
  }

  // =========================
  // Fade-in on load: header + hero
  // =========================
  const header = document.getElementById("siteHeader");
  const hero = document.querySelector(".hero");

  if (header) header.classList.add("page-fade");
  if (hero) hero.classList.add("page-fade");

  requestAnimationFrame(() => {
    if (header) header.classList.add("is-visible");
    if (hero) hero.classList.add("is-visible");
  });

  // =========================
  // Header hide/show:
  // - skrol dole => sakrij odmah
  // - ostaje sakriven dok se ne vratiš do header zone (blizu vrha)
  // - na vrhu uvek prikazan
  // =========================
  if (header) {
    const headerHeight = header.offsetHeight || 296;

    let lastY = window.scrollY;
    let ticking = false;
    let isHidden = false;

    const DELTA = 8;

    function setHidden(nextHidden) {
      if (nextHidden === isHidden) return;
      isHidden = nextHidden;
      header.classList.toggle("is-hidden", isHidden);
    }

    function updateHeader() {
      ticking = false;

      const y = window.scrollY;
      const dy = y - lastY;

      if (y <= 2) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (y <= headerHeight + 4) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (Math.abs(dy) < DELTA) return;

      if (dy > 0) setHidden(true);

      lastY = y;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateHeader);
        }
      },
      { passive: true }
    );
  }

  // =========================
  // Fade-in reveal for sections
  // =========================
  const revealTargets = Array.from(
    document.querySelectorAll(".about, .highlights, .trainings, .memberships, .contact")
  );

  for (const el of revealTargets) el.classList.add("reveal");

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
    {
      root: null,
      threshold: 0.14,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  for (const el of revealTargets) observer.observe(el);
})();