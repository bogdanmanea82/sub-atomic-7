// src/browser/sub-atoms/utilities/flash-message.ts
// Persists a toast message across page navigations using sessionStorage.
// The form controller stores a flash before redirecting; main.ts reads and
// displays it on the next page load, then clears it so it only shows once.

import type { ToastType } from "../../molecules/ui/toast";

const STORAGE_KEY = "flash_message";

export interface FlashMessage {
  readonly message: string;
  readonly type: ToastType;
}

/**
 * Stores a flash message that will be shown after the next page load.
 * Call this right before a redirect (window.location.href = ...).
 */
export function setFlashMessage(message: string, type: ToastType): void {
  const flash: FlashMessage = { message, type };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flash));
}

/**
 * Reads and clears the stored flash message.
 * Returns null if no message is stored.
 * The message is removed from sessionStorage so it only shows once.
 */
export function consumeFlashMessage(): FlashMessage | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as FlashMessage;
  } catch {
    return null;
  }
}
