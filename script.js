/* ================================
   Maison Portfolio — Plain JavaScript
   Theme, navigation, reveal motion, forms
================================ */

(function () {
  const doc = document.documentElement;
  const header = document.querySelector("[data-header]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const yearEl = document.querySelector("[data-current-year]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storageKey = "maison-portfolio-theme";
  const savedTheme = localStorage.getItem(storageKey);
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  function setTheme(theme) {
    doc.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);

    if (themeLabel) 
    {
      themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
    }

    if (themeToggle) 
    {
      themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    }
  }

  setTheme(savedTheme || (systemPrefersLight ? "light" : "dark"));

  function closeMobileMenu() {
    if (!navToggle || !navMenu) return;

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    navMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  function toggleMobileMenu() {
    if (!navToggle || !navMenu) return;

    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function getHeaderOffset() {
    const height = header ? header.getBoundingClientRect().height : 0;
    return height + 18;
  }

  function scrollToTarget(target) {
    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = doc.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      closeMobileMenu();
      scrollToTarget(target);
      history.pushState(null, "", href);
    });
  });

  document.querySelectorAll('a[href="#home"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector("#home");
      if (!target) return;

      event.preventDefault();
      closeMobileMenu();
      scrollToTarget(target);
      history.pushState(null, "", "#home");
    });
  });

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeMobileMenu();
    }
  });

  // Active section highlighting
  const sectionIds = ["about", "work", "skills", "find-me", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;

      const activeId = visibleEntries[0].target.id;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", isActive);
      });
    },
    {
      root: null,
      rootMargin: "-34% 0px -50% 0px",
      threshold: [0.08, 0.18, 0.32, 0.48, 0.64]
    }
  );

  sections.forEach((section) => activeObserver.observe(section));

  // Scroll reveal animations
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  revealItems.forEach((item) => {
    const delay = item.getAttribute("data-reveal-delay");
    if (delay) {
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    }
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Cursor spotlight
  if (!reduceMotion) {
    let rafId = null;

    window.addEventListener(
      "pointermove",
      (event) => {
        if (rafId) return;

        rafId = window.requestAnimationFrame(() => {
          doc.style.setProperty("--cursor-x", `${event.clientX}px`);
          doc.style.setProperty("--cursor-y", `${event.clientY}px`);
          rafId = null;
        });
      },
      { passive: true }
    );
  }

  // Gentle card tilt
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tiltItems = Array.from(document.querySelectorAll("[data-tilt]"));

    tiltItems.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateX = y * -5.5;
        const rotateY = x * 5.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Magnetic button micro-interaction
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const magneticItems = Array.from(document.querySelectorAll(".magnetic"));

    magneticItems.forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;

        item.style.transform = `translate(${x}px, ${y}px)`;
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
      });
    });
  }

  // Contact form mock submission
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector("button[type='submit']");
      const name = new FormData(contactForm).get("name")?.toString().trim() || "there";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.querySelector("span").textContent = "Sending...";
      }

      window.setTimeout(() => {
        formStatus.textContent = `Thank you, ${name}. Your message has been received — this is a polished mock submission.`;
        formStatus.classList.remove("is-visible");
        void formStatus.offsetWidth;
        formStatus.classList.add("is-visible");

        contactForm.reset();

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.querySelector("span").textContent = "Send Message";
        }
      }, reduceMotion ? 0 : 700);
    });
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
