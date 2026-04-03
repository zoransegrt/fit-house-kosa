(() => {
  // =========================
  // Dropdowns (same as cenovnik/onama)
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

  // ✅ uklonjeno: lang-option listeners (jer nema jezika)

  // =========================
  // Header fade-in on load (same as cenovnik/onama)
  // =========================
  const header = document.getElementById("siteHeader");
  if (header) {
    header.classList.add("header-fade");
    requestAnimationFrame(() => header.classList.add("is-visible"));
  }

  // Hero fade-in (keep your page-fade)
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("page-fade");
    requestAnimationFrame(() => hero.classList.add("is-visible"));
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
        closeAll(); // close dropdowns when header hides
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
  // Fade-in reveal for sections
  // =========================
  const revealTargets = Array.from(
    document.querySelectorAll(
      ".about, .highlights, .trainings, .trainers, .memberships, .contact",
    ),
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
    { root: null, threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of revealTargets) observer.observe(el);

  // =========================
  // Video autoplay fallback (mobile/iOS edge cases)
  // =========================
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    const tryPlay = async () => {
      try {
        await heroVideo.play();
      } catch {
        // ignore
      }
    };

    tryPlay();

    const once = () => {
      tryPlay();
      window.removeEventListener("pointerdown", once);
      window.removeEventListener("touchstart", once);
      window.removeEventListener("scroll", once);
    };

    window.addEventListener("pointerdown", once, { passive: true });
    window.addEventListener("touchstart", once, { passive: true });
    window.addEventListener("scroll", once, { passive: true });
  }
})();
