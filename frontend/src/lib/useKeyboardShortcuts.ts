import { useEffect } from "react";

type KeyMap = Record<string, () => void>;

/**
 * Lightweight keyboard shortcut hook.
 * Binds key handlers at the document level and cleans up on unmount.
 * Keys are matched by `event.key` (case-insensitive).
 * Ignores events originating from input, textarea, or select elements.
 */
export function useKeyboardShortcuts(keyMap: KeyMap) {
  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }

      const action = keyMap[event.key] ?? keyMap[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        action();
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [keyMap]);
}
