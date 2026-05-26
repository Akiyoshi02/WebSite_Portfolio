/**
 * Site-wide client behaviors. Re-runs on every Astro page navigation
 * (View Transitions). Each setup function is idempotent: it queries
 * the current DOM, so it's safe to call on initial load and after each
 * `astro:page-load` event.
 */

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;

interface PortfolioCliProject {
  title: string;
  tagline?: string;
  description: string;
  category: string;
  stack: string[];
  year: number;
  href: string;
  links: {
    live?: string;
    repo?: string;
    caseStudy?: string;
  };
  isAi: boolean;
}

interface PortfolioCliData {
  site: {
    name: string;
    shortName: string;
    role: string;
    email: string;
    location: string;
    timeZoneLabel: string;
    cvPath: string;
    socials: Record<string, string | null>;
  };
  projects: PortfolioCliProject[];
  stack: Array<{
    title: string;
    items: string[];
  }>;
}

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
    "> loading modules: [##########] 100%",
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
let cliAbort: AbortController | null = null;
let typewriterCleanup: (() => void) | null = null;

document.addEventListener("astro:before-swap", () => {
  typewriterCleanup?.();
  typewriterCleanup = null;
});

/** SMTP contact handler (Netlify Function). Also aliased as /api/contact in netlify.toml. */
const CONTACT_ENDPOINT = "/api/contact";

function isLocalDevWithoutFunctions(): boolean {
  const host = window.location.hostname;
  return (host === "localhost" || host === "127.0.0.1") && window.location.port !== "8888";
}

async function submitContactForm(form: HTMLFormElement): Promise<void> {
  if (isLocalDevWithoutFunctions()) {
    throw new Error("local-dev");
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const response = await fetch(CONTACT_ENDPOINT, {
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
      company: data.company ?? "",
    }),
  });

  const payload = (await response.json().catch(() => null)) as { error?: string; ok?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? `Contact submission failed (${response.status})`);
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

      submit.classList.add("is-loading");
      submit.disabled = true;
      label.textContent = "Sending";

      try {
        await submitContactForm(form);
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
      } catch (err) {
        submit.classList.remove("is-loading");
        submit.disabled = false;
        label.textContent = "Send Message";
        if (err instanceof Error && err.message === "local-dev") {
          showToast("Form delivery works after deploy or with netlify dev.");
        } else if (err instanceof Error && err.message) {
          showToast(err.message);
        } else {
          showToast("Could not send. Please email me directly.");
        }
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

function setupPortfolioCli(): void {
  cliAbort?.abort();
  cliAbort = new AbortController();
  const { signal } = cliAbort;

  const shell = document.getElementById("portfolio-cli");
  const output = document.getElementById("portfolio-cli-output");
  const form = document.getElementById("portfolio-cli-form") as HTMLFormElement | null;
  const input = document.getElementById("portfolio-cli-input") as HTMLInputElement | null;
  const data = getPortfolioCliData();

  if (!shell || !output || !form || !input || !data) return;
  const cliShell = shell;
  const cliOutput = output;
  const cliForm = form;
  const cliInput = input;
  const cliData = data;

  const commandNames = [
    "help",
    "projects --ai",
    "why-hire-me",
    "contact",
    "stack",
    "download-cv",
    "clear",
    "exit",
  ];
  const prompt = `${cliData.site.shortName.toLowerCase()}@portfolio:~$`;
  let isOpen = false;
  let hasWelcomed = false;
  let previousFocus: HTMLElement | null = null;
  const history: string[] = [];
  let historyIndex = 0;

  function scrollOutput(): void {
    cliOutput.scrollTop = cliOutput.scrollHeight;
  }

  function syncOpenButtons(open: boolean): void {
    document.querySelectorAll<HTMLElement>("[data-cli-open]").forEach((button) => {
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function closeMobileMenuIfOpen(): void {
    const menu = document.getElementById("mobile-menu");
    const toggle = document.getElementById("menu-toggle");
    if (!menu?.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("mobile-menu-open", "no-scroll");
    root.classList.remove("no-scroll");
  }

  function openTerminal(prefill = ""): void {
    closeMobileMenuIfOpen();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isOpen = true;
    cliShell.classList.add("is-open");
    cliShell.setAttribute("aria-hidden", "false");
    root.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    syncOpenButtons(true);
    if (!hasWelcomed) {
      appendWelcome();
      hasWelcomed = true;
    }
    cliInput.value = prefill;
    window.setTimeout(() => cliInput.focus(), 0);
  }

  function closeTerminal(): void {
    if (!isOpen) return;
    isOpen = false;
    cliShell.classList.remove("is-open");
    cliShell.setAttribute("aria-hidden", "true");
    root.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    syncOpenButtons(false);
    previousFocus?.focus();
  }

  function createEntry(kind: string): HTMLDivElement {
    const entry = document.createElement("div");
    entry.className = `cli-entry cli-entry-${kind}`;
    cliOutput.appendChild(entry);
    return entry;
  }

  function appendText(parent: HTMLElement, text: string, className = "cli-text"): HTMLParagraphElement {
    const line = document.createElement("p");
    line.className = className;
    line.textContent = text;
    parent.appendChild(line);
    return line;
  }

  function appendCommand(command: string): void {
    const entry = createEntry("command");
    const promptEl = document.createElement("span");
    promptEl.className = "cli-command-prompt";
    promptEl.textContent = prompt;
    const commandEl = document.createElement("span");
    commandEl.className = "cli-command-value";
    commandEl.textContent = command;
    entry.append(promptEl, commandEl);
  }

  function createAction(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "cli-action interactive";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick, { signal });
    return button;
  }

  function createLink(label: string, href: string): HTMLAnchorElement {
    const link = document.createElement("a");
    link.className = "cli-action interactive";
    link.href = href;
    link.textContent = label;
    if (href.startsWith("http")) {
      link.rel = "noopener";
      link.target = "_blank";
    }
    return link;
  }

  function appendActions(parent: HTMLElement, actions: Array<HTMLElement>): void {
    const row = document.createElement("div");
    row.className = "cli-actions";
    actions.forEach((action) => row.appendChild(action));
    parent.appendChild(row);
  }

  function appendList(parent: HTMLElement, items: string[]): void {
    const list = document.createElement("ul");
    list.className = "cli-list";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    parent.appendChild(list);
  }

  function appendCommandGrid(parent: HTMLElement): void {
    const grid = document.createElement("div");
    grid.className = "cli-command-grid";
    const commands = [
      ["help", "Show available commands."],
      ["projects --ai", "Open AI-related project proof."],
      ["why-hire-me", "Summarize the strongest hiring signals."],
      ["contact", "Show email, GitHub, LinkedIn, and contact form actions."],
      ["stack", "List the main technologies behind the portfolio and projects."],
      ["download-cv", "Download the current CV PDF."],
      ["clear", "Clear the terminal output."],
      ["exit", "Close the terminal."],
    ];

    commands.forEach(([command, description]) => {
      const button = document.createElement("button");
      button.className = "cli-command-card interactive";
      button.type = "button";
      button.addEventListener(
        "click",
        () => {
          cliInput.value = command;
          executeCommand(command);
          cliInput.value = "";
          cliInput.focus();
        },
        { signal },
      );

      const name = document.createElement("strong");
      name.textContent = command;
      const copy = document.createElement("span");
      copy.textContent = description;
      button.append(name, copy);
      grid.appendChild(button);
    });

    parent.appendChild(grid);
  }

  function appendWelcome(): void {
    const entry = createEntry("system");
    appendText(entry, `Welcome to ${cliData.site.name}'s portfolio terminal.`);
    appendText(entry, "Type help to see the command list, or run one of the suggested commands below.");
    scrollOutput();
  }

  function runHelp(): void {
    const entry = createEntry("result");
    appendText(entry, "Available commands:");
    appendCommandGrid(entry);
  }

  function runAiProjects(): void {
    const aiProjects = cliData.projects.filter((project) => project.isAi);
    const entry = createEntry("result");

    if (!aiProjects.length) {
      appendText(entry, "No AI-tagged projects were found in the portfolio content yet.");
      appendText(entry, "Tip: add AI-related tags or wording to a project case study to surface it here.");
      return;
    }

    appendText(entry, "AI-related project proof:");
    aiProjects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "cli-project-card";

      const title = document.createElement("h3");
      title.textContent = `${project.title} (${project.year})`;
      const description = document.createElement("p");
      description.textContent = project.description;
      const stack = document.createElement("p");
      stack.className = "cli-muted";
      stack.textContent = `Stack: ${project.stack.slice(0, 8).join(", ")}`;

      card.append(title, description, stack);

      const actions = [createLink("Case study", project.href)];
      if (project.links.repo) actions.push(createLink("Source", project.links.repo));
      if (project.links.live) actions.push(createLink("Live", project.links.live));
      appendActions(card, actions);
      entry.appendChild(card);
    });
  }

  function runWhyHireMe(): void {
    const entry = createEntry("result");
    appendText(entry, "Why hire Akiyoshi:");
    appendList(entry, [
      "He ships complete products, not only static UI screens.",
      "He can work across frontend, backend, deployment, email, auth, and data flows.",
      "InterviewAI Pro shows real AI product thinking with speech, local LLMs, dashboards, and role-based workflows.",
      "This portfolio itself is production-minded: Astro, MDX content, SEO, RSS, Netlify Functions, and validated SMTP contact.",
      "As a recent graduate, he brings current tooling, strong learning speed, and proof that he finishes ambitious projects.",
    ]);
    const actions: HTMLElement[] = [
      createAction("View projects", () => openHash("#projects")),
      createAction("Contact", () => openHash("#contact")),
    ];
    if (cliData.site.socials.github) {
      actions.push(createLink("Open GitHub", cliData.site.socials.github));
    }
    appendActions(entry, actions);
  }

  function runContact(): void {
    const entry = createEntry("result");
    appendText(entry, "Contact routes:");
    appendList(entry, [
      `Email: ${cliData.site.email}`,
      `Location: ${cliData.site.location} ${cliData.site.timeZoneLabel}`,
      "Best for: full-time roles, freelance builds, collaborations, and technical conversations.",
    ]);

    const actions: HTMLElement[] = [
      createLink("Email", `mailto:${cliData.site.email}`),
      createAction("Copy email", () => copyText(cliData.site.email, "Email copied to clipboard")),
      createAction("Open contact form", () => openHash("#contact")),
    ];
    if (cliData.site.socials.github) {
      actions.push(createLink("GitHub", cliData.site.socials.github));
    }
    if (cliData.site.socials.linkedin) {
      actions.push(createLink("LinkedIn", cliData.site.socials.linkedin));
    }
    appendActions(entry, actions);
  }

  function runStack(): void {
    const entry = createEntry("result");
    appendText(entry, "Current stack map:");

    const grid = document.createElement("div");
    grid.className = "cli-stack-grid";
    cliData.stack.forEach((group) => {
      const section = document.createElement("section");
      section.className = "cli-stack-group";
      const title = document.createElement("h3");
      title.textContent = group.title;
      const items = document.createElement("p");
      items.textContent = group.items.join(", ");
      section.append(title, items);
      grid.appendChild(section);
    });
    entry.appendChild(grid);
  }

  function runDownloadCv(): void {
    const entry = createEntry("result");
    appendText(entry, "Preparing CV download...");

    const anchor = document.createElement("a");
    anchor.href = cliData.site.cvPath;
    anchor.download = "Akiyoshi-Yapa-CV.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    appendActions(entry, [createLink("Open CV", cliData.site.cvPath)]);
    showToast("CV download started.");
  }

  function runUnknown(command: string): void {
    const entry = createEntry("error");
    appendText(entry, `Command not found: ${command}`);
    appendText(entry, "Type help to see the supported commands.");
  }

  function executeCommand(rawCommand: string): void {
    const command = rawCommand.trim();
    if (!command) return;

    appendCommand(command);
    if (history[history.length - 1] !== command) {
      history.push(command);
    }
    historyIndex = history.length;

    const normalized = command.toLowerCase();

    if (normalized === "help") runHelp();
    else if (normalized === "projects --ai") runAiProjects();
    else if (normalized === "projects") {
      const entry = createEntry("result");
      appendText(entry, "Try projects --ai for the strongest AI-related project proof.");
      appendActions(entry, [createLink("View all projects", "/#projects")]);
    } else if (normalized === "why-hire-me") runWhyHireMe();
    else if (normalized === "contact") runContact();
    else if (normalized === "stack") runStack();
    else if (normalized === "download-cv") runDownloadCv();
    else if (normalized === "clear") {
      cliOutput.replaceChildren();
      appendWelcome();
    } else if (normalized === "exit" || normalized === "close") {
      closeTerminal();
    } else runUnknown(command);

    scrollOutput();
  }

  function openHash(hash: string): void {
    closeTerminal();
    if (window.location.pathname !== "/") {
      window.location.href = `/${hash}`;
      return;
    }
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyText(text: string, successMessage: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      showToast(text);
    }
  }

  function autocompleteCommand(): void {
    const value = cliInput.value.trim().toLowerCase();
    if (!value) return;
    const matches = commandNames.filter((command) => command.startsWith(value));
    if (matches.length === 1) {
      cliInput.value = matches[0];
    }
  }

  function focusableInShell(): HTMLElement[] {
    return Array.from(
      cliShell.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);
  }

  function trapFocus(event: KeyboardEvent): void {
    if (event.key !== "Tab" || !isOpen) return;
    if (document.activeElement === cliInput && cliInput.value.trim() && !event.shiftKey) {
      event.preventDefault();
      autocompleteCommand();
      return;
    }

    const focusable = focusableInShell();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.querySelectorAll<HTMLButtonElement>("[data-cli-open]").forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        openTerminal();
      },
      { signal },
    );
  });

  document.querySelectorAll<HTMLButtonElement>("[data-cli-close]").forEach((button) => {
    button.addEventListener("click", closeTerminal, { signal });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-cli-run]").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const command = button.dataset.cliRun ?? "";
        openTerminal(command);
        executeCommand(command);
        cliInput.value = "";
      },
      { signal },
    );
  });

  cliForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const command = cliInput.value;
      cliInput.value = "";
      executeCommand(command);
    },
    { signal },
  );

  cliInput.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!history.length) return;
        historyIndex = Math.max(0, historyIndex - 1);
        cliInput.value = history[historyIndex] ?? "";
        cliInput.setSelectionRange(cliInput.value.length, cliInput.value.length);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!history.length) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        cliInput.value = history[historyIndex] ?? "";
        cliInput.setSelectionRange(cliInput.value.length, cliInput.value.length);
      }
    },
    { signal },
  );

  cliShell.addEventListener("keydown", trapFocus, { signal });

  const isCliShortcut = (event: KeyboardEvent): boolean => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return false;
    // Backtick (`), not apostrophe ('). Prefer physical key codes - layouts vary.
    if (event.code === "Backquote" || event.code === "IntlBackslash") return true;
    return event.key === "`" || event.key === "~";
  };

  window.addEventListener(
    "keydown",
    (event) => {
      if (isCliShortcut(event)) {
        event.preventDefault();
        if (event.repeat) return;
        if (isOpen) closeTerminal();
        else openTerminal();
      } else if (event.key === "Escape" && isOpen) {
        closeTerminal();
      }
    },
    { capture: true, signal },
  );
}

function getPortfolioCliData(): PortfolioCliData | null {
  const dataEl = document.getElementById("portfolio-cli-data");
  if (!dataEl?.textContent) return null;

  try {
    return JSON.parse(dataEl.textContent) as PortfolioCliData;
  } catch {
    return null;
  }
}

function setupTypewriter(): void {
  typewriterCleanup?.();
  typewriterCleanup = null;

  if (prefersReducedMotion()) return;
  const el = document.getElementById("typed-role");
  if (!el) return;
  const typedRole = el;

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
  let paused = false;

  const clearTimer = (): void => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };

  const schedule = (delay: number): void => {
    clearTimer();
    timer = window.setTimeout(tick, delay);
  };

  function tick(): void {
    if (paused) return;

    const role = roles[roleIndex] ?? "";

    if (deleting) {
      charIndex = Math.max(0, charIndex - 1);
      typedRole.textContent = role.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        schedule(280);
        return;
      }
      schedule(45);
      return;
    }

    const nextRole = roles[roleIndex] ?? "";
    const nextMax = nextRole.length;
    charIndex = Math.min(nextMax, charIndex + 1);
    typedRole.textContent = nextRole.slice(0, charIndex);
    if (charIndex >= nextMax) {
      deleting = true;
      schedule(1200);
      return;
    }
    schedule(72);
  }

  const onVisibilityChange = (): void => {
    if (document.hidden) {
      paused = true;
      clearTimer();
      return;
    }
    paused = false;
    schedule(deleting ? 45 : 72);
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  typewriterCleanup = () => {
    paused = true;
    clearTimer();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  schedule(1400);
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

  function shouldShowClickCursor(target: Element | null): boolean {
    if (!target?.closest(".interactive")) return false;
    return !target.closest(".site-header .icon-btn, .site-header .btn");
  }

  function onOver(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (shouldShowClickCursor(target)) ring!.classList.add("is-click");
    if (target?.closest(".image-hover, .project-media")) ring!.classList.add("is-view");
  }
  function onOut(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (shouldShowClickCursor(target)) ring!.classList.remove("is-click");
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
  setupPortfolioCli();
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
