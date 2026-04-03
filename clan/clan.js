(() => {
  // =========================
  // Dropdowns (header)
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
  // Header fade-in + top-zone hide
  // =========================
  const header = document.getElementById("siteHeader");
  if (header) {
    header.classList.add("header-fade");
    requestAnimationFrame(() => header.classList.add("is-visible"));

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
  // Wizard logic
  // =========================
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3"); // trainers (conditional)
  const step4 = document.getElementById("step4"); // summary
  const step5 = document.getElementById("step5"); // success

  const form = document.getElementById("memberForm");

  const step1Error = document.getElementById("step1Error");
  const step2Error = document.getElementById("step2Error");
  const step3Error = document.getElementById("step3Error");

  const toStep2Btn = document.getElementById("toStep2");
  const backTo1Btn = document.getElementById("backTo1");

  const serviceGrid = document.getElementById("serviceGrid");
  const toNextAfterService = document.getElementById("toNextAfterService");

  const trainerGrid = document.getElementById("trainerGrid");
  const toSummaryBtn = document.getElementById("toSummary");

  const backTo2Btn = document.getElementById("backTo2");
  const backFromSummaryBtn = document.getElementById("backFromSummary");

  const confirmBtn = document.getElementById("confirmBtn");

  const sumName = document.getElementById("sumName");
  const sumPhone = document.getElementById("sumPhone");
  const sumEmail = document.getElementById("sumEmail");
  const sumService = document.getElementById("sumService");

  const sumTrainerRow = document.getElementById("sumTrainerRow");
  const sumTrainer = document.getElementById("sumTrainer");

  let selectedService = "";
  let selectedTrainer = "";

  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg || "";
  }

  function showStep(stepEl) {
    const steps = [step1, step2, step3, step4, step5].filter(Boolean);
    for (const s of steps) s.classList.remove("is-active");

    if (stepEl) {
      stepEl.classList.remove("is-active");
      void stepEl.offsetWidth; // restart animation
      stepEl.classList.add("is-active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getFormData() {
    const fd = new FormData(form);
    return {
      fullName: String(fd.get("fullName") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
    };
  }

  function validateStep1() {
    const data = getFormData();
    if (!data.fullName) return "Unesite ime i prezime.";
    if (!data.phone) return "Unesite broj telefona.";
    return "";
  }

  function validateService() {
    if (!selectedService) return "Izaberite jednu opciju (program/uslugu).";
    return "";
  }

  function serviceNeedsTrainer(service) {
    return service === "Personalni trening" || service === "Vođeni trening";
  }

  function validateTrainerIfNeeded() {
    if (!serviceNeedsTrainer(selectedService)) return "";
    if (!selectedTrainer) return "Izaberite trenera da nastavimo dalje.";
    return "";
  }

  function fillSummary() {
    const data = getFormData();
    if (sumName) sumName.textContent = data.fullName || "—";
    if (sumPhone) sumPhone.textContent = data.phone || "—";
    if (sumEmail) sumEmail.textContent = data.email || "—";
    if (sumService) sumService.textContent = selectedService || "—";

    const needs = serviceNeedsTrainer(selectedService);
    if (sumTrainerRow) sumTrainerRow.style.display = needs ? "" : "none";
    if (sumTrainer)
      sumTrainer.textContent = needs ? selectedTrainer || "—" : "—";
  }

  // Step 1 -> Step 2
  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", () => {
      const err = validateStep1();
      setError(step1Error, err);
      if (err) return;

      showStep(step2);
    });
  }

  // Step 2 back -> Step 1
  if (backTo1Btn) {
    backTo1Btn.addEventListener("click", () => {
      setError(step2Error, "");
      showStep(step1);
    });
  }

  // pick service
  function updateServiceSelectionUI(selectedBtn) {
    const cards = Array.from(serviceGrid.querySelectorAll(".pick-card"));
    for (const c of cards) c.classList.toggle("is-selected", c === selectedBtn);
  }

  if (serviceGrid) {
    serviceGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".pick-card");
      if (!btn) return;

      selectedService = btn.getAttribute("data-service") || "";

      // if service changes away from training -> clear trainer
      if (!serviceNeedsTrainer(selectedService)) {
        selectedTrainer = "";
        if (toSummaryBtn) toSummaryBtn.disabled = true;
        if (trainerGrid) {
          const all = Array.from(trainerGrid.querySelectorAll(".trainer-card"));
          for (const el of all) el.classList.remove("is-selected");
        }
      }

      updateServiceSelectionUI(btn);

      if (toNextAfterService) toNextAfterService.disabled = !selectedService;
      setError(step2Error, "");
    });
  }

  // Step 2 -> next (conditional)
  if (toNextAfterService) {
    toNextAfterService.addEventListener("click", () => {
      const err = validateService();
      setError(step2Error, err);
      if (err) return;

      if (serviceNeedsTrainer(selectedService)) {
        showStep(step3);
      } else {
        fillSummary();
        showStep(step4);
      }
    });
  }

  // Trainer selection
  function updateTrainerSelectionUI(selectedBtn) {
    const cards = Array.from(trainerGrid.querySelectorAll(".trainer-card"));
    for (const c of cards) c.classList.toggle("is-selected", c === selectedBtn);
  }

  if (trainerGrid) {
    trainerGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".trainer-card");
      if (!btn) return;

      selectedTrainer = btn.getAttribute("data-trainer") || "";
      updateTrainerSelectionUI(btn);

      btn.classList.remove("is-pulse");
      void btn.offsetWidth;
      btn.classList.add("is-pulse");

      if (toSummaryBtn) toSummaryBtn.disabled = !selectedTrainer;
      setError(step3Error, "");
    });
  }

  // Step 3 back -> Step 2
  if (backTo2Btn) {
    backTo2Btn.addEventListener("click", () => {
      setError(step3Error, "");
      showStep(step2);
    });
  }

  // Step 3 -> Summary
  if (toSummaryBtn) {
    toSummaryBtn.addEventListener("click", () => {
      const err = validateTrainerIfNeeded();
      setError(step3Error, err);
      if (err) return;

      fillSummary();
      showStep(step4);
    });
  }

  // Summary back
  if (backFromSummaryBtn) {
    backFromSummaryBtn.addEventListener("click", () => {
      if (serviceNeedsTrainer(selectedService)) showStep(step3);
      else showStep(step2);
    });
  }

  // Confirm -> success
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const err1 = validateStep1();
      const err2 = validateService();
      const err3 = validateTrainerIfNeeded();

      if (err1) {
        showStep(step1);
        setError(step1Error, err1);
        return;
      }
      if (err2) {
        showStep(step2);
        setError(step2Error, err2);
        return;
      }
      if (err3) {
        showStep(step3);
        setError(step3Error, err3);
        return;
      }

      fillSummary();

      confirmBtn.disabled = true;
      const oldText = confirmBtn.textContent;
      confirmBtn.textContent = "ŠALJEMO...";

      window.setTimeout(() => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = oldText;
        showStep(step5);
      }, 900);
    });
  }

  // Start
  showStep(step1);
})();
