"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { resetTouchControls, touchMovement, useExperienceState } from "@/systems/experience-state";
import { calculateJoystick } from "@/world/player/touch-joystick";

const REST = { x: 0, y: 0, sprinting: false };

export function TouchJoystick() {
  const activePointer = useRef<number | null>(null);
  const [thumb, setThumb] = useState(REST);

  const clear = useCallback(() => {
    activePointer.current = null;
    resetTouchControls();
    setThumb(REST);
  }, []);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) clear(); };
    const stopWhenBlocked = useExperienceState.subscribe((state) => {
      if (state.overlay !== null || state.deviceActive) clear();
    });
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", onVisibility);
      stopWhenBlocked();
      clear();
    };
  }, [clear]);

  const update = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = rect.width * 0.31;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const stick = calculateJoystick(dx, dy, radius);
    touchMovement.x = stick.x;
    touchMovement.z = stick.z;
    touchMovement.sprinting = stick.sprinting;
    setThumb({ x: stick.thumbX, y: stick.thumbY, sprinting: stick.sprinting });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    update(event);
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    clear();
  };

  return (
    <div className="touch-joystick" role="group" aria-label="Controle de movimento: arraste para andar, até a borda para correr">
      <div
        className="touch-joystick-pad"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
        data-sprinting={thumb.sprinting ? "true" : "false"}
        aria-label="Joystick analógico"
      >
        <span aria-hidden="true" className="touch-joystick-ring" />
        <span
          aria-hidden="true"
          className="touch-joystick-thumb"
          style={{ transform: `translate(calc(-50% + ${thumb.x}px), calc(-50% + ${thumb.y}px))` }}
        />
      </div>
      <span className="touch-joystick-caption" aria-hidden="true">{thumb.sprinting ? "Correndo" : "Mover"}</span>
    </div>
  );
}
