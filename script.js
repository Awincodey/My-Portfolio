(() => {
  "use strict";

  const body = document.body;
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const navLinks = [...document.querySelectorAll(".primary-nav a[href^='#']")];
  const revealItems = document.querySelectorAll(".reveal");
  const progressBar = document.querySelector(".scroll-progress span");
  const profileCard = document.querySelector(".hero-profile");
  const toast = document.querySelector(".toast");
  const year = document.querySelector("#current-year");
  const pendingLinks = document.querySelectorAll(".pending-link");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const imagePopup = document.querySelector("#imagePopup");
  const imagePopupContent = document.querySelector("#imagePopupContent");
  const imagePopupClose = document.querySelector("#imagePopupClose");
  const imagePopupTriggers = document.querySelectorAll(".js-image-popup");

  const startupScreen = document.querySelector("#startupScreen");
  let startupFallbackTimer;

  let toastTimer;
  let popupClearTimer;
  let lastImageTrigger = null;

  const removeStartupScreen = () => {
    if (!startupScreen) return;

    window.clearTimeout(startupFallbackTimer);
    body.classList.remove("startup-lock");
    startupScreen.remove();
  };

  const startStartupAnimation = () => {
    if (!startupScreen) return;

    body.classList.add("startup-lock");

    window.requestAnimationFrame(() => {
      startupScreen.classList.add("is-running");
    });

    startupFallbackTimer = window.setTimeout(() => {
      removeStartupScreen();
    }, 3800);
  };

  if (startupScreen) {
    startupScreen.addEventListener("animationend", (event) => {
      if (
        event.target === startupScreen &&
        event.animationName === "startupScreenExit"
      ) {
        removeStartupScreen();
      }
    });

    if (document.readyState === "complete") {
      startStartupAnimation();
    } else {
      window.addEventListener("load", startStartupAnimation, { once: true });
    }
  }

  const closeNavigation = () => {
    if (!navToggle || !primaryNav) return;

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("open");
    body.classList.remove("nav-open");
  };

  const openNavigation = () => {
    if (!navToggle || !primaryNav) return;

    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
    primaryNav.classList.add("open");
    body.classList.add("nav-open");
  };

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      isExpanded ? closeNavigation() : openNavigation();
    });

    primaryNav.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (link) closeNavigation();
    });
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.14,
      rootMargin: "0px 0px -40px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sections = [...document.querySelectorAll("main section[id]")];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const target = link.getAttribute("href").slice(1);
          link.classList.toggle("active", target === entry.target.id);
        });
      });
    },
    {
      rootMargin: "-38% 0px -52%",
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const updateScrollProgress = () => {
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const percentage =
      scrollable > 0
        ? Math.min((scrollTop / scrollable) * 100, 100)
        : 0;

    progressBar.style.width = `${percentage}%`;
  };

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true,
  });

  updateScrollProgress();

  const resetProfileTilt = () => {
    if (!profileCard) return;

    profileCard.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  if (profileCard && !prefersReducedMotion.matches) {
    profileCard.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const bounds = profileCard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 7;

      profileCard.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) ` +
        `rotateY(${rotateY}deg)`;

      profileCard.style.setProperty("--shine-x", `${x * 100}%`);
      profileCard.style.setProperty("--shine-y", `${y * 100}%`);
    });

    profileCard.addEventListener("pointerleave", resetProfileTilt);
  }

  const showToast = (message) => {
    if (!toast) return;

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  };

  pendingLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const linkName = button.dataset.linkName || "Link";

      showToast(
        `${linkName} URL is ready to be connected. ` +
          "Update it in index.html before publishing."
      );
    });
  });

  const openImagePopup = (trigger) => {
    if (!imagePopup || !imagePopupContent || !imagePopupClose) return;

    const imageSource = trigger.dataset.image;
    const imageAlt = trigger.dataset.alt || "Image preview";

    if (!imageSource) return;

    clearTimeout(popupClearTimer);
    lastImageTrigger = trigger;

    closeNavigation();

    imagePopupContent.src = imageSource;
    imagePopupContent.alt = imageAlt;

    imagePopup.classList.add("open");
    imagePopup.setAttribute("aria-hidden", "false");
    body.classList.add("image-popup-open");

    imagePopupClose.focus();
  };

  const closeImagePopup = () => {
    if (!imagePopup || !imagePopupContent) return;
    if (!imagePopup.classList.contains("open")) return;

    imagePopup.classList.remove("open");
    imagePopup.setAttribute("aria-hidden", "true");
    body.classList.remove("image-popup-open");

    popupClearTimer = window.setTimeout(() => {
      imagePopupContent.src = "";
      imagePopupContent.alt = "";
    }, 260);

    if (lastImageTrigger) {
      lastImageTrigger.focus();
    }
  };

  imagePopupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openImagePopup(trigger);
    });
  });

  if (imagePopupClose) {
    imagePopupClose.addEventListener("click", closeImagePopup);
  }

  if (imagePopup) {
    imagePopup.addEventListener("click", (event) => {
      if (event.target === imagePopup) {
        closeImagePopup();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (imagePopup?.classList.contains("open")) {
      closeImagePopup();
      return;
    }

    closeNavigation();
  });

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNavigation();
    }

    resetProfileTilt();
  });
})();
