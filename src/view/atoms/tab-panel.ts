// src/view/atoms/tab-panel.ts
// Wraps content in an accessible tab panel container.
// Inactive panels are hidden with display:none (toggled by browser JS).

export function tabPanel(id: string, content: string, active: boolean): string {
  const style = active ? "" : ' style="display:none"';
  return `<div class="tab-panel" id="panel-${id}" role="tabpanel"${style}>${content}</div>`;
}
