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

function validateLeadForm(form) {
  const nameEl = $("#name", form);
  const phoneEl = $("#phone", form);
  const businessTypeEl = $("#businessType", form);
  const submitBtn = $("button[type='submit']", form);

  const phoneRaw = (phoneEl?.value || "").trim();
  const phoneDigits = phoneRaw.replace(/[^\d]/g, "");
  const phoneOk = phoneDigits.length >= 10;

  const requiredOk = Boolean(nameEl?.value?.trim()) && Boolean(phoneRaw) && Boolean(businessTypeEl?.value);

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
  if (!businessTypeEl?.value) {
    businessTypeEl.classList.add("invalid");
    businessTypeEl.setAttribute("aria-invalid", "true");
  }

  if (!requiredOk || !phoneOk) {
    if (submitBtn) submitBtn.disabled = false;
    return false;
  }
  return true;
}

function initLeadForm() {
  const form = $("#leadForm");
  if (!form) return;

  const submitBtn = $("button[type='submit']", form);
  const onSubmit = (e) => {
    e.preventDefault();

    const ok = validateLeadForm(form);
    if (!ok) {
      // Native validation is suppressed by novalidate; use minimal custom feedback
      alert("Please fill all required fields correctly.");
      return;
    }

    // Demo behavior requested by the user
    alert("We will contact you soon!");

    // Optional: reset form for a clean flow
    form.reset();

    if (submitBtn) {
      submitBtn.disabled = false;
    }
  };

  form.addEventListener("submit", onSubmit);
}

function init() {
  initYear();
  initMobileNav();
  initFadeInOnScroll();
  initLeadForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

