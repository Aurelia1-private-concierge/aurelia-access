import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "h",
      alt: true,
      action: () => navigate("/"),
      description: "Go to home",
    },
    {
      key: "d",
      alt: true,
      action: () => navigate("/dashboard"),
      description: "Go to dashboard",
    },
    {
      key: "o",
      alt: true,
      action: () => navigate("/orla"),
      description: "Open Orla assistant",
    },
    {
      key: "s",
      alt: true,
      action: () => navigate("/services"),
      description: "Go to services",
    },
    {
      key: "/",
      ctrl: true,
      action: () => {
        // Focus search if available
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: "Focus search",
    },
    {
      key: "Escape",
      action: () => {
        // Close any open modals
        const closeButtons = document.querySelectorAll(
          '[data-dialog-close], [data-sheet-close]'
        );
        closeButtons.forEach((btn) => (btn as HTMLElement).click());
      },
      description: "Close modal/sheet",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to work in inputs
        if (event.key !== "Escape") return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
};

export default useKeyboardShortcuts;
