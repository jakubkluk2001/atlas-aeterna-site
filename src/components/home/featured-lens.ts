type Section = "history" | "geography" | "mysteries";
type Feature = Section | "idle";

const holdDelay = 450;
const holdTolerance = 12;

function isSection(value: string | undefined): value is Section {
  return value === "history" || value === "geography" || value === "mysteries";
}

export function initFeaturedLens(home: HTMLElement) {
  const lens = home.querySelector<HTMLElement>("#featured-lens");
  if (!lens || home.hasAttribute("data-lens-ready")) return;

  const links = [...home.querySelectorAll<HTMLAnchorElement>("a[data-section]")];
  const stories = [...lens.querySelectorAll<HTMLElement>("[data-story]")];
  let feature: Feature = "idle";
  let touchSelection: Feature = "idle";
  let press: { id: number; x: number; y: number; timer: number } | undefined;
  let heldLink: HTMLAnchorElement | undefined;

  function showFeature(next: Feature) {
    if (feature === next) return;
    feature = next;
    home.dataset.feature = next;
    for (const story of stories) story.hidden = story.dataset.story !== next;
  }

  function hasKeyboardFocus() {
    const focused = document.activeElement;
    return focused instanceof HTMLElement
      && home.contains(focused)
      && focused.matches(":focus-visible")
      && focused.matches("[data-section], [data-feature-link]");
  }

  function cancelPress() {
    if (!press) return;
    window.clearTimeout(press.timer);
    press = undefined;
  }

  for (const link of links) {
    const section = link.dataset.section;
    if (!isSection(section)) continue;

    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) showFeature(section);
    });
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && !hasKeyboardFocus()) showFeature(section);
    });
    link.addEventListener("pointerdown", (event) => {
      cancelPress();
      heldLink = undefined;
      if (!event.isPrimary || event.button !== 0 || !["touch", "pen"].includes(event.pointerType)) return;

      const timer = window.setTimeout(() => {
        heldLink = link;
        touchSelection = section;
        showFeature(section);
      }, holdDelay);
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, timer };
    });

    link.addEventListener("click", (event) => {
      // Release after a hold may still generate a pointer click.
      if (heldLink !== link || event.detail === 0) return;
      event.preventDefault();
      heldLink = undefined;
    });

    link.addEventListener("contextmenu", (event) => {
      if (press || heldLink === link) event.preventDefault();
    });
  }

  window.addEventListener("pointermove", (event) => {
    if (press?.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > holdTolerance) cancelPress();
  });
  for (const type of ["pointerup", "pointercancel"] as const) {
    window.addEventListener(type, (event) => {
      if (press?.id === event.pointerId) cancelPress();
    });
  }
  window.addEventListener("scroll", cancelPress, { passive: true });
  window.addEventListener("blur", cancelPress);

  home.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || feature === touchSelection || hasKeyboardFocus()) return;
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-section]")) return;

    // Keep the selected drawing available across the gap below its navigation link.
    const bounds = lens.getBoundingClientRect();
    const origin = links.find((link) => link.dataset.section === feature)?.getBoundingClientRect();
    const left = Math.min(bounds.left, origin?.left ?? bounds.left);
    const right = Math.max(bounds.right, origin?.right ?? bounds.right);
    if (event.clientX < left || event.clientX > right || event.clientY > bounds.bottom) {
      showFeature(touchSelection);
    }
  });

  home.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && !hasKeyboardFocus()) showFeature(touchSelection);
  });

  home.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && home.contains(event.relatedTarget)) return;
    if (!home.matches(":hover")) showFeature(touchSelection);
  });

  home.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || feature === "idle") return;
    const active = document.activeElement;
    if (active && lens.contains(active)) {
      const section = links.find((link) => link.dataset.section === feature);
      section?.focus({ preventScroll: true });
    }
    touchSelection = "idle";
    showFeature("idle");
  });

  home.setAttribute("data-lens-ready", "");
}

document.querySelectorAll<HTMLElement>("[data-featured-home]").forEach(initFeaturedLens);
