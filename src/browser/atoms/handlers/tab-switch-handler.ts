// src/browser/atoms/handlers/tab-switch-handler.ts
// Client-side tab switching with hash-based URL sync and keyboard navigation.
// Safe to call on any page — no-ops if no .tab-bar is found.

export function attachTabSwitchHandler(): void {
  const tabBar = document.querySelector<HTMLElement>(".tab-bar");
  if (!tabBar) return;

  const tabs = Array.from(tabBar.querySelectorAll<HTMLButtonElement>(".tab-bar__tab"));
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".tab-panel"));

  function activateTab(tabId: string): void {
    for (const tab of tabs) {
      const isTarget = tab.dataset["tab"] === tabId;
      tab.classList.toggle("tab-bar__tab--active", isTarget);
      tab.setAttribute("aria-selected", String(isTarget));
    }
    for (const panel of panels) {
      const isTarget = panel.id === `panel-${tabId}`;
      panel.style.display = isTarget ? "" : "none";
    }
  }

  // Click handler
  tabBar.addEventListener("click", (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>(".tab-bar__tab");
    if (!button || button.disabled) return;

    const tabId = button.dataset["tab"];
    if (!tabId) return;

    activateTab(tabId);
    history.replaceState(null, "", `#${tabId}`);
  });

  // Keyboard navigation: left/right arrows move between tabs, Enter/Space activates
  tabBar.addEventListener("keydown", (e) => {
    const current = e.target as HTMLButtonElement;
    if (!current.classList.contains("tab-bar__tab")) return;

    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.indexOf(current);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % enabledTabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = enabledTabs[nextIndex] as HTMLButtonElement;
      nextTab.focus();
      const tabId = nextTab.dataset["tab"];
      if (tabId) {
        activateTab(tabId);
        history.replaceState(null, "", `#${tabId}`);
      }
    }
  });

  // On load: activate tab from hash if valid
  const hash = location.hash.slice(1);
  if (hash) {
    const matchingTab = tabs.find((t) => t.dataset["tab"] === hash && !t.disabled);
    if (matchingTab) {
      activateTab(hash);
    }
  }
}
