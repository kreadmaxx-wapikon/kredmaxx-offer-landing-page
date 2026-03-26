/* global document, window */

// Small helper for query selection
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function initYear() {
  const yearEl = $("#year");
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
}

function initMobileNav() {
  const header = document.querySelector(".site-header");
  const toggleBtn = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (!header || !toggleBtn || !mobileNav) return;

  const setExpanded = (expanded) => {
    toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    header.classList.toggle("is-open", expanded);
  };

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    setExpanded(!expanded);
  });

  // Close menu when a link is clicked
  $$(".mobile-nav a").forEach((a) => {
    a.addEventListener("click", () => setExpanded(false));
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    const isInside = header.contains(e.target);
    if (!isInside) setExpanded(false);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setExpanded(false);
  });
}

function initFadeInOnScroll() {
  const items = $$(".fade-in");
  if (!items.length) return;

  // Use IntersectionObserver for performant scroll animations
  const supportsIO = "IntersectionObserver" in window;
  if (!supportsIO) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

function formatCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function setAnnouncementHeightVar() {
  const bar = $("#announcementBar");
  const h = bar ? bar.offsetHeight : 0;
  document.documentElement.style.setProperty("--annH", `${h}px`);
}

function initAnnouncementBar() {
  const bar = $("#announcementBar");
  const closeBtn = $("#announcementClose");
  if (!bar) {
    setAnnouncementHeightVar();
    return;
  }

  setAnnouncementHeightVar();
  window.addEventListener("resize", setAnnouncementHeightVar);

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      bar.style.display = "none";
      setAnnouncementHeightVar();
    });
  }
}

function initAnnouncementCountdown() {
  const el = $("#annCountdown");
  if (!el) return;

  // 6-hour timer (resets on reload)
  const totalSeconds = 6 * 60 * 60;
  const startedAt = Date.now();

  const tick = () => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsed);
    el.textContent = formatCountdown(remaining);
    if (remaining <= 0) window.clearInterval(timerId);
  };

  tick();
  const timerId = window.setInterval(tick, 1000);
}

function initHeroLead() {
  const heroForm = $("#heroLead");
  const heroPhone = $("#heroPhone");
  const heroErr = $("#heroLeadError");
  const mainPhone = $("#phone");
  if (!heroForm || !heroPhone) return;

  heroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const phoneRaw = (heroPhone.value || "").trim();
    const digits = phoneRaw.replace(/[^\d]/g, "");
    const ok = digits.length >= 10;
    if (!ok) {
      heroPhone.classList.add("invalid");
      heroPhone.setAttribute("aria-invalid", "true");
      if (heroErr) {
        heroErr.hidden = false;
        heroErr.textContent = "Please enter a valid 10-digit phone number.";
      }
      return;
    }

    heroPhone.classList.remove("invalid");
    heroPhone.setAttribute("aria-invalid", "false");
    if (heroErr) {
      heroErr.hidden = true;
      heroErr.textContent = "";
    }

    // Prefill the main form and scroll there for higher completion
    if (mainPhone) mainPhone.value = digits;
    const leadSection = $("#lead-form");
    if (leadSection) leadSection.scrollIntoView({ behavior: "smooth", block: "start" });
    if (mainPhone) mainPhone.focus({ preventScroll: true });
  });
}

function validateLeadForm(form) {
  const nameEl = $("#name", form);
  const phoneEl = $("#phone", form);
  const businessTypeEl = $("#businessType", form);
  const submitBtn = $("button[type='submit']", form);

  const phoneRaw = (phoneEl?.value || "").trim();
  const phoneDigits = phoneRaw.replace(/[^\d]/g, "");
  const phoneOk = phoneDigits.length >= 10;

  // Business type is optional (reduced friction)
  const requiredOk = Boolean(nameEl?.value?.trim()) && Boolean(phoneRaw);

  // Mark invalid fields (simple UX)
  [nameEl, phoneEl, businessTypeEl].forEach((el) => {
    if (!el) return;
    el.classList.remove("invalid");
    el.setAttribute("aria-invalid", "false");
  });

  if (!nameEl?.value?.trim()) {
    nameEl.classList.add("invalid");
    nameEl.setAttribute("aria-invalid", "true");
  }
  if (!phoneRaw || !phoneOk) {
    phoneEl.classList.add("invalid");
    phoneEl.setAttribute("aria-invalid", "true");
  }

  if (!requiredOk || !phoneOk) {
    if (submitBtn) submitBtn.disabled = false;
    return false;
  }
  return true;
}

function buildWhatsAppUrl({ name, phone, businessType }) {
  // CRO: keep message short to reduce drop-off
  const text = encodeURIComponent("Hi, I want a website in 4 hours");
  return `https://wa.me/917719959988?text=${text}`;
}

function initLeadForm() {
  const form = $("#leadForm");
  if (!form) return;

  const submitBtn = $("button[type='submit']", form);
  const successEl = $("#formSuccess");
  const errorEl = $("#formError");
  const formToast = (msg) => {
    if (successEl) {
      successEl.hidden = false;
      successEl.innerHTML = `<strong>Success!</strong> ${msg}`;
    }
  };
  const formError = (msg) => {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = msg;
    }
  };
  const clearFormMessages = () => {
    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
  };
  const onSubmit = (e) => {
    e.preventDefault();

    clearFormMessages();

    const ok = validateLeadForm(form);
    if (!ok) {
      // No alerts: show a modern inline message (fields are already highlighted)
      formError("Please enter your name and a valid 10-digit phone number.");
      return;
    }

    // Inline success message UI (no alert)
    formToast("Redirecting you to WhatsApp…");

    // Auto-open WhatsApp with a pre-filled message
    const waUrl = buildWhatsAppUrl({});
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Reset after a moment (lets user see confirmation)
    window.setTimeout(() => {
      form.reset();
      clearFormMessages();
      if (submitBtn) submitBtn.disabled = false;
    }, 1200);
  };

  form.addEventListener("submit", onSubmit);
}

function initExitIntentModal() {
  const modal = $("#exitModal");
  if (!modal) return;

  const storageKey = "exit_intent_shown";
  const isDesktop = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
  if (!isDesktop) return;

  const open = () => {
    if (sessionStorage.getItem(storageKey) === "1") return;
    sessionStorage.setItem(storageKey, "1");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  // Close handlers
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-modal-close") === "true") close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Exit intent: cursor leaves viewport at top
  document.addEventListener("mouseleave", (e) => {
    if (e.clientY <= 0) open();
  });
}

function init() {
  initYear();
  initMobileNav();
  initFadeInOnScroll();
  initAnnouncementBar();
  initAnnouncementCountdown();
  initHeroLead();
  initLeadForm();
  initExitIntentModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

