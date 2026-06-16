function setupAdminCursor(): void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const dot = document.querySelector<HTMLElement>(".cursor-dot");
  const ring = document.querySelector<HTMLElement>(".cursor-ring");
  if (!dot || !ring) return;

  document.body.classList.add("admin-cursor-ready");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  function onMove(event: MouseEvent): void {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot!.style.left = `${mouseX}px`;
    dot!.style.top = `${mouseY}px`;
  }

  function animate(): void {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring!.style.left = `${ringX}px`;
    ring!.style.top = `${ringY}px`;
    requestAnimationFrame(animate);
  }

  function isInteractive(target: Element | null): boolean {
    return Boolean(
      target?.closest(
        "a, button, input, select, textarea, label, [role='button'], .admin-nav-item, .admin-upload-area",
      ),
    );
  }

  function onOver(event: MouseEvent): void {
    if (isInteractive(event.target as Element | null)) ring!.classList.add("is-click");
  }

  function onOut(event: MouseEvent): void {
    if (isInteractive(event.target as Element | null)) ring!.classList.remove("is-click");
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);
  animate();
}

setupAdminCursor();
