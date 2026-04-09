// src/view/molecules/sections/tab-bar.ts
// Renders a horizontal tab bar with accessible tablist role.
// Each tab is a button that targets a corresponding tab-panel element.

export interface TabDefinition {
  readonly id: string;
  readonly label: string;
  readonly active: boolean;
  readonly disabled?: boolean;
}

export function tabBar(tabs: readonly TabDefinition[]): string {
  const buttons = tabs
    .map((tab) => {
      const classes = [
        "tab-bar__tab",
        tab.active ? "tab-bar__tab--active" : "",
        tab.disabled ? "tab-bar__tab--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const attrs = [
        `class="${classes}"`,
        'role="tab"',
        `aria-selected="${tab.active}"`,
        `aria-controls="panel-${tab.id}"`,
        `data-tab="${tab.id}"`,
        tab.disabled ? "disabled" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `<button ${attrs}>${tab.label}</button>`;
    })
    .join("\n      ");

  return `
    <nav class="tab-bar" role="tablist">
      ${buttons}
    </nav>`;
}
