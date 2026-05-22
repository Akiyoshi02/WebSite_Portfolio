/**
 * Site-wide client behaviors. Re-runs on every Astro page navigation
 * (View Transitions). Each setup function is idempotent: it queries
 * the current DOM, so it's safe to call on initial load and after each
 * `astro:page-load` event.
 */

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;

function showToast(message: string): void {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 4300);
}

function setupPreloader(): void {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  if (prefersReducedMotion() || sessionStorage.getItem("portfolioBooted") === "true") {
    root.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    preloader.remove();
    return;
  }
  root.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
  const lines = [
    "> initializing portfolio.exe...",
    "> loading modules: [██████████] 100%",
    "> compiling dreams...",
    "> launching site",
  ];
  let lineIndex = 0;
  let charIndex = 0;
  function typeNext() {
    const el = document.getElementById(`boot-line-${lineIndex}`);
    if (!el) return;
    el.textContent = lines[lineIndex].slice(0, charIndex);
    charIndex++;
    if (charIndex <= lines[lineIndex].length) {
      setTimeout(typeNext, 18);
    } else {
      lineIndex++;
      charIndex = 0;
      if (lineIndex < lines.length) {
        setTimeout(typeNext, 120);
      } else {
        setTimeout(() => {
          sessionStorage.setItem("portfolioBooted", "true");
          preloader!.classList.add("is-hidden");
          root.classList.remove("no-scroll");
          document.body.classList.remove("no-scroll");
          setTimeout(() => preloader!.remove(), 1050);
        }, 520);
      }
    }
  }
  typeNext();
}

function getOrderedHomepageSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("section[id], .hero[id]")).sort(
    (a, b) => a.offsetTop - b.offsetTop,
  );
}

/** Maps a nav href to the homepage section id used for scroll highlighting. */
function getNavSectionIdForLink(link: HTMLAnchorElement): string | null {
  const href = link.getAttribute("href") ?? "";
  if (href.includes("#")) {
    return href.split("#").pop() || null;
  }

  try {
    const path = new URL(href, window.location.origin).pathname.replace(/\/$/, "") || "/";
    // Writing nav points to /blog, but the homepage preview lives in #writing
    if (path === "/blog" && document.getElementById("writing")) {
      return "writing";
    }
  } catch {
    return null;
  }

  return null;
}

/** Highlights the nav link for the current in-page section while scrolling. */
function updateActiveNavLink(header: HTMLElement): void {
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-link"));
  if (!navLinks.length) return;

  const scrollPos = window.scrollY + header.offsetHeight + 32;
  const sections = getOrderedHomepageSections();

  const navIds = new Set(
    navLinks
      .map(getNavSectionIdForLink)
      .filter((id): id is string => Boolean(id)),
  );

  let activeId = "";
  for (const section of sections) {
    if (section.offsetTop <= scrollPos && navIds.has(section.id)) {
      activeId = section.id;
    }
  }

  navLinks.forEach((link) => {
    const id = getNavSectionIdForLink(link);
    link.classList.toggle("is-active", Boolean(id && id === activeId));
  });
}

function setupHeaderAndScroll(): void {
  const header = document.getElementById("site-header");
  const progress = document.querySelector<HTMLElement>(".scroll-progress");
  const backToTop = document.getElementById("back-to-top");
  if (!header || !progress || !backToTop) return;

  const update = (): void => {
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    progress.style.width = `${pct}%`;
    header.classList.toggle("is-scrolled", scrollTop > 24);
    backToTop.classList.toggle("is-visible", scrollTop > 700);
    root.style.setProperty("--parallax-a", `${scrollTop * -0.035}px`);
    root.style.setProperty("--parallax-b", `${scrollTop * 0.025}px`);
    updateActiveNavLink(header);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

let mobileMenuAbort: AbortController | null = null;

function setupMobileMenu(): void {
  mobileMenuAbort?.abort();
  mobileMenuAbort = new AbortController();
  const { signal } = mobileMenuAbort;

  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;
  const toggleButton = toggle;
  const menuPanel = menu;

  function setOpen(open: boolean): void {
    menuPanel.classList.toggle("is-open", open);
    menuPanel.setAttribute("aria-hidden", String(!open));
    toggleButton.setAttribute("aria-expanded", String(open));
    toggleButton.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
    document.body.classList.toggle("mobile-menu-open", open);
    root.classList.toggle("no-scroll", open);
    document.body.classList.toggle("no-scroll", open);
  }

  toggle.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!menuPanel.classList.contains("is-open"));
    },
    { signal },
  );

  menuPanel.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setOpen(false), { signal }),
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") setOpen(false);
    },
    { signal },
  );
}

function setupTheme(): void {
  const button = document.getElementById("theme-toggle") as HTMLButtonElement | null;
  if (!button) return;

  const syncThemeButton = (): void => {
    const isLight = document.documentElement.dataset.theme === "light";
    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  };

  syncThemeButton();
  button.onclick = () => {
    const next =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("portfolioTheme", next);
    syncThemeButton();
    showToast(`${next === "light" ? "Light" : "Dark"} theme enabled`);
  };
}

function setupObservers(): void {
  const animatedSections = document.querySelectorAll<HTMLElement>("[data-animate]");
  animatedSections.forEach((section) => {
    Array.from(section.children).forEach((child, index) =>
      (child as HTMLElement).style.setProperty("--stagger", String(index)),
    );
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  animatedSections.forEach((section) => revealObserver.observe(section));

  const heatmapPanel = document.getElementById("heatmap-panel");
  if (heatmapPanel) {
    const heatmapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            heatmapObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    heatmapObserver.observe(heatmapPanel);
  }

  const statsGrid = document.getElementById("stats-grid");
  if (statsGrid) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    statsObserver.observe(statsGrid);
  }
}

function animateCounters(): void {
  document.querySelectorAll<HTMLElement>(".stat-number").forEach((el) => {
    const target = Number(el.dataset.count);
    const duration = 1100;
    const start = performance.now();
    function tick(now: number): void {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.floor(eased * target)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function setupProjectFilters(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".filter-btn");
  const cards = document.querySelectorAll<HTMLElement>(".project-card");
  if (!buttons.length || !cards.length) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter ?? "all";
      cards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

function setupTestimonials(): void {
  const shell = document.getElementById("testimonial-shell");
  const dots = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-testimonial-dot]"),
  );
  const next = document.getElementById("testimonial-next");
  const prev = document.getElementById("testimonial-prev");
  if (!shell || !next || !prev || dots.length === 0) return;

  const total = dots.length;
  let index = 0;
  let paused = false;

  function update(nextIndex: number): void {
    index = (nextIndex + total) % total;
    shell!.style.setProperty("--testimonial-index", String(index));
    dots.forEach((dot, dotIndex) =>
      dot.classList.toggle("is-active", dotIndex === index),
    );
  }

  next.addEventListener("click", () => update(index + 1));
  prev.addEventListener("click", () => update(index - 1));
  dots.forEach((dot) =>
    dot.addEventListener("click", () =>
      update(Number(dot.dataset.testimonialDot)),
    ),
  );
  shell.addEventListener("mouseenter", () => {
    paused = true;
  });
  shell.addEventListener("mouseleave", () => {
    paused = false;
  });

  const interval = window.setInterval(() => {
    if (!paused && !prefersReducedMotion()) update(index + 1);
  }, 3600);

  document.addEventListener(
    "astro:before-swap",
    () => window.clearInterval(interval),
    { once: true },
  );
}

let formAbort: AbortController | null = null;

function getFormspreeFormId(): string {
  return import.meta.env.PUBLIC_FORMSPREE_FORM_ID?.trim() ?? "";
}

async function submitToFormspree(form: HTMLFormElement): Promise<void> {
  const formId = getFormspreeFormId();
  if (!formId) {
    throw new Error("PUBLIC_FORMSPREE_FORM_ID is not configured");
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(`https://formspree.io/f/${formId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      _subject: `Portfolio: ${data.subject}`,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Formspree submission failed (${response.status})`);
  }
}

function getCustomSelectOptionValue(option: HTMLLIElement): string {
  if (option.hasAttribute("data-placeholder")) return "";
  return option.getAttribute("data-value") ?? "";
}

function setupCustomSelects(): void {
  document.querySelectorAll<HTMLElement>("[data-custom-select]").forEach((root) => {
    const select = root.querySelector<HTMLSelectElement>(".custom-select-native");
    const trigger = root.querySelector<HTMLButtonElement>(".custom-select-trigger");
    const valueEl = root.querySelector<HTMLElement>("[data-custom-select-value]");
    const list = root.querySelector<HTMLUListElement>(".custom-select-options");
    if (!select || !trigger || !valueEl || !list) return;
    const nativeSelect = select;
    const triggerButton = trigger;
    const valueDisplay = valueEl;
    const optionsList = list;

    const options = Array.from(
      optionsList.querySelectorAll<HTMLLIElement>(".custom-select-option"),
    );

    function syncFromSelect(): void {
      const selected = nativeSelect.options[nativeSelect.selectedIndex];
      const label = selected?.textContent?.trim() ?? "";
      valueDisplay.textContent = label;
      valueDisplay.classList.toggle("is-placeholder", !nativeSelect.value);
      options.forEach((option) => {
        const isSelected = getCustomSelectOptionValue(option) === nativeSelect.value;
        option.setAttribute("aria-selected", isSelected ? "true" : "false");
      });
    }

    function setValue(value: string): void {
      nativeSelect.value = value;
      syncFromSelect();
      nativeSelect.dispatchEvent(new Event("input", { bubbles: true }));
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function open(): void {
      root.classList.add("is-open");
      triggerButton.setAttribute("aria-expanded", "true");
      optionsList.hidden = false;
    }

    function close(): void {
      root.classList.remove("is-open");
      triggerButton.setAttribute("aria-expanded", "false");
      optionsList.hidden = true;
    }

    const signal = formAbort?.signal;
    if (!signal) return;

    triggerButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (root.classList.contains("is-open")) close();
        else open();
      },
      { signal },
    );

    options.forEach((option) => {
      option.addEventListener(
        "mousedown",
        (event) => {
          event.preventDefault();
          setValue(getCustomSelectOptionValue(option));
          close();
          triggerButton.focus();
        },
        { signal },
      );
    });

    document.addEventListener(
      "click",
      (event) => {
        if (!root.classList.contains("is-open")) return;
        if (!root.contains(event.target as Node)) close();
      },
      { signal },
    );

    triggerButton.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") close();
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!root.classList.contains("is-open")) open();
        }
      },
      { signal },
    );

    nativeSelect.form?.addEventListener(
      "reset",
      () => {
        queueMicrotask(() => {
          syncFromSelect();
          root.classList.remove("is-invalid");
          triggerButton.removeAttribute("aria-invalid");
        });
      },
      { signal },
    );

    syncFromSelect();
  });
}

function setupForm(): void {
  formAbort?.abort();
  formAbort = new AbortController();
  const { signal } = formAbort;

  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  if (!form) return;
  const submit = document.getElementById("submit-btn") as HTMLButtonElement | null;
  if (!submit) return;
  const label = submit.querySelector<HTMLSpanElement>(".submit-label");
  if (!label) return;
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input:not([type='hidden']), select, textarea",
    ),
  );
  const messages: Record<string, string> = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    subject: "Please choose a subject.",
    message: "Message must be at least 12 characters.",
  };

  function updateSubjectUi(field: HTMLSelectElement, valid: boolean): void {
    const root = field.closest<HTMLElement>("[data-custom-select]");
    const trigger = root?.querySelector<HTMLButtonElement>(".custom-select-trigger");
    if (!root || !trigger) return;
    root.classList.toggle("is-invalid", !valid);
    trigger.setAttribute("aria-invalid", valid ? "false" : "true");
  }

  function validateField(
    field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  ): boolean {
    const error = form!.querySelector<HTMLElement>(
      `[data-error-for="${field.name}"]`,
    );
    let valid = field.checkValidity();
    if (field.name === "email" && field.value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    }
    if (field.name === "subject") updateSubjectUi(field as HTMLSelectElement, valid);
    if (error) error.textContent = valid ? "" : messages[field.name] ?? "";
    return valid;
  }

  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field), { signal });
    if (field.name !== "subject") {
      field.addEventListener("blur", () => validateField(field), { signal });
    }
  });

  const subject = form.querySelector<HTMLSelectElement>("#subject");
  if (subject) {
    subject.addEventListener(
      "change",
      () => validateField(subject),
      { signal },
    );
  }

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      const valid = fields.every((field) => validateField(field));
      if (!valid) {
        showToast("Please fix the highlighted fields.");
        return;
      }

      if (!getFormspreeFormId()) {
        showToast("Contact form is not configured. Please use the email link.");
        return;
      }

      submit.classList.add("is-loading");
      submit.disabled = true;
      label.textContent = "Sending";

      try {
        await submitToFormspree(form);
        submit.classList.remove("is-loading");
        submit.classList.add("is-success");
        label.textContent = "Sent";
        showToast("Message sent successfully.");
        form.reset();
        setTimeout(() => {
          submit.classList.remove("is-success");
          submit.disabled = false;
          label.textContent = "Send Message";
        }, 1600);
      } catch {
        submit.classList.remove("is-loading");
        submit.disabled = false;
        label.textContent = "Send Message";
        showToast("Could not send. Please email me directly.");
      }
    },
    { signal },
  );
}

function setupCopy(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy ?? "";
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard");
      } catch {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand("copy");
        } catch {
          /* ignore */
        }
        input.remove();
        showToast("Copied to clipboard");
      }
    });
  });
}

function setupTypewriter(): void {
  if (prefersReducedMotion()) return;
  const el = document.getElementById("typed-role");
  if (!el) return;

  let roles: string[] = ["Full-Stack Developer", "Problem Solver"];
  const raw = el.dataset.typewriterRoles;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((r) => typeof r === "string") && parsed.length > 0) {
        roles = parsed;
      }
    } catch {
      /* fall back to defaults */
    }
  }

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;
  let timer: number | undefined;

  function tick(): void {
    const role = roles[roleIndex];
    const visibleChars = Math.max(0, charIndex);
    el!.textContent = role.slice(0, visibleChars);
    if (deleting) {
      charIndex--;
      if (charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
        el!.textContent = "";
      }
    } else {
      charIndex++;
      if (charIndex > roles[roleIndex].length) {
        deleting = true;
        timer = window.setTimeout(tick, 1200);
        return;
      }
    }
    timer = window.setTimeout(tick, deleting ? 45 : 72);
  }
  timer = window.setTimeout(tick, 1400);

  document.addEventListener(
    "astro:before-swap",
    () => {
      if (timer) window.clearTimeout(timer);
    },
    { once: true },
  );
}

function setupPointer(): void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const dot = document.querySelector<HTMLElement>(".cursor-dot");
  const ring = document.querySelector<HTMLElement>(".cursor-ring");
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let running = true;

  function onMove(event: MouseEvent): void {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot!.style.left = `${mouseX}px`;
    dot!.style.top = `${mouseY}px`;
  }
  window.addEventListener("mousemove", onMove, { passive: true });

  function animate(): void {
    if (!running) return;
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring!.style.left = `${ringX}px`;
    ring!.style.top = `${ringY}px`;
    requestAnimationFrame(animate);
  }
  animate();

  function onOver(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (target?.closest(".interactive")) ring!.classList.add("is-click");
    if (target?.closest(".image-hover, .project-media")) ring!.classList.add("is-view");
  }
  function onOut(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (target?.closest(".interactive")) ring!.classList.remove("is-click");
    if (target?.closest(".image-hover, .project-media")) ring!.classList.remove("is-view");
  }
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);

  document.addEventListener(
    "astro:before-swap",
    () => {
      running = false;
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    },
    { once: true },
  );
}

function setupKonami(): void {
  const sequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let index = 0;
  function onKey(event: KeyboardEvent): void {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === sequence[index]) {
      index++;
      if (index === sequence.length) {
        index = 0;
        fireConfetti();
        showToast("You found the easter egg.");
      }
    } else {
      index = key === sequence[0] ? 1 : 0;
    }
  }
  window.addEventListener("keydown", onKey);
  document.addEventListener(
    "astro:before-swap",
    () => window.removeEventListener("keydown", onKey),
    { once: true },
  );
}

function fireConfetti(): void {
  const colors = ["#00f5d4", "#7b2fff", "#ff4ecd", "#ffc857", "#20e080"];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 300}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3300);
  }
}

function setupParticles(): void {
  const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
  let width = 0;
  let height = 0;
  let running = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize(): void {
    width = canvas!.clientWidth;
    height = canvas!.clientHeight;
    canvas!.width = Math.floor(width * dpr);
    canvas!.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.length = 0;
    const count = window.innerWidth < 700 ? 90 : 220;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.5 + 0.4,
      });
    }
  }

  function draw(): void {
    if (!running) return;
    ctx!.clearRect(0, 0, width, height);
    ctx!.fillStyle = "rgba(0,245,212,0.7)";
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx!.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx!.strokeStyle = `rgba(0,245,212,${(1 - dist / 110) * 0.16})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }
    if (!prefersReducedMotion()) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  document.addEventListener(
    "astro:before-swap",
    () => {
      running = false;
      window.removeEventListener("resize", resize);
    },
    { once: true },
  );
}

function bootAll(): void {
  setupPreloader();
  setupHeaderAndScroll();
  setupMobileMenu();
  setupTheme();
  setupObservers();
  setupProjectFilters();
  setupTestimonials();
  setupForm();
  setupCustomSelects();
  setupCopy();
  setupTypewriter();
  setupPointer();
  setupKonami();
  setupParticles();
}

let hasAstroPageLoad = false;

document.addEventListener("astro:page-load", () => {
  hasAstroPageLoad = true;
  bootAll();
});

// Fallback when ClientRouter has not fired yet (avoids double init once page-load runs).
document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (!hasAstroPageLoad) bootAll();
  },
  { once: true },
);
