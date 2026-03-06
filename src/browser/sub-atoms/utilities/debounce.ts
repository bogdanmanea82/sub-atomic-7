// src/browser/sub-atoms/utilities/debounce.ts
// Delays function execution until a pause in calls.
// Used for input handlers — validates after the user stops typing, not on every keystroke.

/**
 * Returns a new function that delays invoking `fn` until `delayMs`
 * milliseconds have elapsed since the last call.
 * Each new call resets the timer.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delayMs);
  };
}
