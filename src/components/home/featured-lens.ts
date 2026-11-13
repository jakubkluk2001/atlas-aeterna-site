type Section = "history" | "geography" | "mysteries";
type Feature = Section | "idle";

function isSection(value: string | undefined): value is Section {
  return value === "history" || value === "geography" || value === "mysteries";
}

export function initFeaturedLens(home: HTMLElement) {
  const lens = home.querySelector<HTMLElement>("#featured-lens");
  if (!lens || home.hasAttribute("data-lens-ready")) return;

  const links = [...home.querySelectorAll<HTMLAnchorElement>("a[data-section]")];
  const previews = [...home.querySelectorAll<HTMLButtonElement>("button[data-preview]")];
  const stories = [...lens.querySelectorAll<HTMLElement>("[data-story]")];
  let feature: Feature = "idle";
  let touchSelection: Feature = "idle";

  function showFeature(next: Feature) {
    if (feature === next) return;
    feature = next;
    home.dataset.feature = next;
    for (const story of stories) story.hidden = story.dataset.story !== next;
    for (const preview of previews) {
      preview.setAttribute("aria-pressed", String(preview.dataset.preview === next));
    }
  }

  function hasKeyboardFocus() {
    const focused = document.activeElement;
    return focused instanceof HTMLElement
      && home.contains(focused)
      && focused.matches(":focus-visible")
      && focused.matches("[data-section], [data-preview], [data-feature-link]");
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
  }

  for (const preview of previews) {
    const section = preview.dataset.preview;
    if (!isSection(section)) continue;

    const select = () => {
      touchSelection = section;
      showFeature(section);
    };

    preview.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") select();
    });
    preview.addEventListener("click", select);
  }

  home.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || feature === touchSelection || hasKeyboardFocus()) return;
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-section], [data-preview]")) return;

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
      const preview = previews.find((button) => button.dataset.preview === feature && button.getClientRects().length);
      const section = links.find((link) => link.dataset.section === feature);
      (preview ?? section)?.focus({ preventScroll: true });
    }
    touchSelection = "idle";
    showFeature("idle");
  });

  home.setAttribute("data-lens-ready", "");
}

document.querySelectorAll<HTMLElement>("[data-featured-home]").forEach(initFeaturedLens);
