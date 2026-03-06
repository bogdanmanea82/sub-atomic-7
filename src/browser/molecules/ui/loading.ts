// src/browser/molecules/ui/loading.ts
// Full-page loading overlay shown during async operations (form submit, delete).
// Prevents double-submit by covering the page with a visual indicator.

const OVERLAY_ID = "loading-overlay";

const LOADING_STYLES = `
  #${OVERLAY_ID} {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(255,255,255,0.7);
    display: flex; align-items: center; justify-content: center;
  }
  .loading-spinner {
    width: 40px; height: 40px;
    border: 4px solid #e0e0e0; border-top-color: #1a1a2e;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected) return;
  const style = document.createElement("style");
  style.textContent = LOADING_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

/**
 * Shows a full-page loading overlay with a spinner.
 * Call hideLoading() to remove it.
 */
export function showLoading(): void {
  // Don't stack multiple overlays
  if (document.getElementById(OVERLAY_ID)) return;

  injectStyles();

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.innerHTML = `<div class="loading-spinner"></div>`;
  document.body.appendChild(overlay);
}

/**
 * Removes the loading overlay.
 */
export function hideLoading(): void {
  document.getElementById(OVERLAY_ID)?.remove();
}
