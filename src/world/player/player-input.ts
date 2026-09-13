"use client";

import { useCallback, useEffect, useRef } from "react";

const MOVEMENT_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowleft",
  "arrowdown",
  "arrowright",
]);

export type PlayerInput = {
  x: number;
  z: number;
};

function isFormControl(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

export function usePlayerInput() {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<PlayerInput>({ x: 0, z: 0 });

  useEffect(() => {
    const clearPressedKeys = () => {
      pressedKeysRef.current.clear();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (!MOVEMENT_KEYS.has(key) || isFormControl(event.target)) {
        return;
      }

      pressedKeysRef.current.add(key);
      event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key.toLowerCase());
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPressedKeys();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPressedKeys();
    };
  }, []);

  return useCallback(() => {
    const pressedKeys = pressedKeysRef.current;
    const input = inputRef.current;

    input.x =
      (pressedKeys.has("d") || pressedKeys.has("arrowright") ? 1 : 0) -
      (pressedKeys.has("a") || pressedKeys.has("arrowleft") ? 1 : 0);
    input.z =
      (pressedKeys.has("s") || pressedKeys.has("arrowdown") ? 1 : 0) -
      (pressedKeys.has("w") || pressedKeys.has("arrowup") ? 1 : 0);

    const magnitude = Math.hypot(input.x, input.z);

    if (magnitude > 1) {
      input.x /= magnitude;
      input.z /= magnitude;
    }

    return input;
  }, []);
}
