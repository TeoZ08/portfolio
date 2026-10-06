"use client";

import { useCallback, useEffect, useRef } from "react";
import { touchMovement, worldInputBlocked } from "@/systems/experience-state";

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
  sprinting: boolean;
  jumpPressed: boolean;
  blocked: boolean;
};

function isUiControl(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLButtonElement ||
    target instanceof HTMLAnchorElement ||
    target.isContentEditable
  );
}

export function usePlayerInput() {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const jumpHeldRef = useRef(false);
  const jumpQueuedRef = useRef(false);
  const inputRef = useRef<PlayerInput>({
    x: 0,
    z: 0,
    sprinting: false,
    jumpPressed: false,
    blocked: false,
  });

  useEffect(() => {
    const clearInput = () => {
      pressedKeysRef.current.clear();
      jumpHeldRef.current = false;
      jumpQueuedRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const jumpKey = event.code === "Space" || key === " ";
      const sprintKey = key === "shift";

      if (
        (!MOVEMENT_KEYS.has(key) && !jumpKey && !sprintKey) ||
        isUiControl(event.target) ||
        worldInputBlocked()
      ) {
        return;
      }

      if (jumpKey) {
        if (!jumpHeldRef.current && !event.repeat) {
          jumpQueuedRef.current = true;
        }
        jumpHeldRef.current = true;
      } else {
        pressedKeysRef.current.add(key);
      }
      event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.code === "Space" || key === " ") {
        jumpHeldRef.current = false;
      } else {
        pressedKeysRef.current.delete(key);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInput();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearInput);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearInput);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInput();
    };
  }, []);

  return useCallback(() => {
    const pressedKeys = pressedKeysRef.current;
    const input = inputRef.current;

    if (worldInputBlocked()) {
      pressedKeys.clear();
      jumpHeldRef.current = false;
      jumpQueuedRef.current = false;
      input.x = 0;
      input.z = 0;
      input.sprinting = false;
      input.jumpPressed = false;
      input.blocked = true;
      return input;
    }

    input.x =
      (pressedKeys.has("d") || pressedKeys.has("arrowright") ? 1 : 0) -
      (pressedKeys.has("a") || pressedKeys.has("arrowleft") ? 1 : 0);
    input.z =
      (pressedKeys.has("s") || pressedKeys.has("arrowdown") ? 1 : 0) -
      (pressedKeys.has("w") || pressedKeys.has("arrowup") ? 1 : 0);
    input.x += touchMovement.x;
    input.z += touchMovement.z;

    const magnitude = Math.hypot(input.x, input.z);

    if (magnitude > 1) {
      input.x /= magnitude;
      input.z /= magnitude;
    }

    input.sprinting = pressedKeys.has("shift");
    input.jumpPressed = jumpQueuedRef.current;
    input.blocked = false;
    jumpQueuedRef.current = false;

    return input;
  }, []);
}
