// src/browser/sub-atoms/utilities/throttle.ts
// Limits function execution to at most once per interval.
// Used for scroll or resize handlers where you want steady updates, not a burst at the end.

/**
 * Returns a new function that invokes `fn` at most once every `intervalMs`
 * milliseconds. The first call fires immediately; subsequent calls during
 * the cooldown are ignored.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    if (now - lastCallTime >= intervalMs) {
      lastCallTime = now;
      fn(...args);
    }
  };
}
