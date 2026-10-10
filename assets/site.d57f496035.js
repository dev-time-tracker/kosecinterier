/* Kosec interier: progressive enhancements only. Every page works without this file. */
(() => {
  const d = document;
  const root = d.documentElement;

  /* Header: transparent over the photo hero, solid once the page scrolls. */
  const header = d.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu */
  const toggle = d.querySelector(".menu-toggle");
  const menu = d.getElementById("menu");
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
    if (open) menu.removeAttribute("inert");
    else menu.setAttribute("inert", "");
  };
  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  d.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("menu-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", (e) => e.matches && setMenu(false));
  menu?.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

  /* Gallery lightbox on <dialog> */
  const dlg = d.querySelector("[data-lightbox]");
  const items = [...d.querySelectorAll("[data-lb-src]")];
  if (dlg && items.length && typeof dlg.showModal === "function") {
    const im = dlg.querySelector("[data-lb-img]");
    const cap = dlg.querySelector("[data-lb-cap]");
    const count = dlg.querySelector("[data-lb-count]");
    let i = 0;
    const show = (n) => {
      i = (n + items.length) % items.length;
      const it = items[i];
      im.src = it.dataset.lbSrc;
      im.alt = it.dataset.lbCap;
      cap.textContent = it.dataset.lbCap;
      count.textContent = `${i + 1} / ${items.length}`;
    };
    items.forEach((btn, n) =>
      btn.addEventListener("click", () => {
        show(n);
        dlg.showModal();
      }),
    );
    dlg.querySelector("[data-lb-prev]").addEventListener("click", () => show(i - 1));
    dlg.querySelector("[data-lb-next]").addEventListener("click", () => show(i + 1));
    dlg.querySelector("[data-lb-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.classList.contains("lightbox__stage")) dlg.close();
    });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    let sx = null;
    dlg.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    dlg.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) show(dx < 0 ? i + 1 : i - 1);
      sx = null;
    });
    dlg.addEventListener("close", () => items[i]?.focus());
  }

  /* Copy phone / e-mail */
  d.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("span");
    const original = label.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("is-done");
        label.textContent = btn.dataset.done;
        setTimeout(() => {
          btn.classList.remove("is-done");
          label.textContent = original;
        }, 2000);
      } catch {
        /* clipboard unavailable: the value is visible and selectable anyway */
      }
    });
  });

  /* Footer year stays current between rebuilds. */
  d.querySelectorAll("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));
})();
