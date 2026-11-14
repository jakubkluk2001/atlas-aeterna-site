type Section = "history" | "geography" | "mysteries";
type Feature = Section | "idle";

const holdDelay = 450;
const holdTolerance = 12;
const previewTimeout = 10_000;

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
  let resetTimer: number | undefined;
  let mousePreview = false;
  let press: {
    id: number;
    x: number;
    y: number;
    startedAt: number;
    link: HTMLAnchorElement;
    section: Section;
    alreadySelected: boolean;
  } | undefined;
  let suppressedClick: HTMLAnchorElement | undefined;

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

  function selectTouchPreview(section: Section) {
    touchSelection = section;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      const expired = touchSelection;
      touchSelection = "idle";
      if (!press && !mousePreview && !hasKeyboardFocus() && feature === expired) showFeature("idle");
    }, previewTimeout);
  }

  function cancelPress() {
    if (!press) return;
    const { link, section } = press;
    press = undefined;
    suppressedClick = link;
    if (!mousePreview && !hasKeyboardFocus() && feature === section) showFeature(touchSelection);
  }

  for (const link of links) {
    const section = link.dataset.section;
    if (!isSection(section)) continue;

    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) showFeature(section);
    });
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse" || hasKeyboardFocus()) return;
      mousePreview = true;
      showFeature(section);
    });
    link.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary) return;
      cancelPress();
      suppressedClick = undefined;
      if (event.button !== 0 || !["touch", "pen"].includes(event.pointerType)) return;

      mousePreview = false;
      press = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        link,
        section,
        alreadySelected: touchSelection === section,
      };
      showFeature(section);
    });

    link.addEventListener("click", (event) => {
      if (suppressedClick !== link || event.detail === 0) return;
      event.preventDefault();
      suppressedClick = undefined;
    });

    link.addEventListener("contextmenu", (event) => {
      if (press?.link === link || suppressedClick === link) event.preventDefault();
    });
  }

  window.addEventListener("pointermove", (event) => {
    if (press?.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > holdTolerance) cancelPress();
  });
  window.addEventListener("pointerup", (event) => {
    if (press?.id !== event.pointerId) return;
    const { link, section, startedAt, alreadySelected } = press;
    press = undefined;
    // A second quick tap follows the link. A hold always keeps the preview open.
    if (!alreadySelected || performance.now() - startedAt >= holdDelay) suppressedClick = link;
    selectTouchPreview(section);
  });
  window.addEventListener("pointercancel", (event) => {
    if (press?.id === event.pointerId) cancelPress();
  });
  window.addEventListener("scroll", cancelPress, { passive: true });
  window.addEventListener("blur", cancelPress);

  home.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || hasKeyboardFocus()) return;
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-section]")) return;

    // Keep the selected drawing available across the gap below its navigation link.
    const bounds = lens.getBoundingClientRect();
    const origin = links.find((link) => link.dataset.section === feature)?.getBoundingClientRect();
    const left = Math.min(bounds.left, origin?.left ?? bounds.left);
    const right = Math.max(bounds.right, origin?.right ?? bounds.right);
    if (event.clientX < left || event.clientX > right || event.clientY > bounds.bottom) {
      mousePreview = false;
      showFeature(touchSelection);
    }
  });

  home.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    mousePreview = false;
    if (!hasKeyboardFocus()) showFeature(touchSelection);
  });

  home.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && home.contains(event.relatedTarget)) return;
    if (!mousePreview) showFeature(touchSelection);
  });

  home.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || feature === "idle") return;
    cancelPress();
    const active = document.activeElement;
    if (active && lens.contains(active)) {
      const section = links.find((link) => link.dataset.section === feature);
      section?.focus({ preventScroll: true });
    }
    touchSelection = "idle";
    mousePreview = false;
    window.clearTimeout(resetTimer);
    showFeature("idle");
  });

  home.setAttribute("data-lens-ready", "");
}

document.querySelectorAll<HTMLElement>("[data-featured-home]").forEach(initFeaturedLens);
