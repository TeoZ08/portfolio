import { create } from "zustand";

export type ArchiveApp = "projects" | "faculty" | "notes" | "terminal" | "about" | "contact" | "settings";
type ExperienceState = {
  overlay: "menu" | "archive" | null;
  archiveApp: ArchiveApp;
  deviceActive: boolean;
  reducedMotion: boolean;
  quality: "balanced" | "low";
  debugVisible: boolean;
  openMenu: () => void;
  openArchive: (app?: ArchiveApp) => void;
  closeOverlay: () => void;
  setDevice: (active: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setQuality: (value: "balanced" | "low") => void;
  toggleDebug: () => void;
};

export const useExperienceState = create<ExperienceState>(set => ({
  overlay: null,
  archiveApp: "projects",
  deviceActive: false,
  reducedMotion: false,
  quality: "balanced",
  debugVisible: false,
  openMenu: () => set({ overlay: "menu" }),
  openArchive: (archiveApp = "projects") => set({ overlay: "archive", archiveApp }),
  closeOverlay: () => set({ overlay: null }),
  setDevice: (deviceActive) => set({ deviceActive }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setQuality: (quality) => set({ quality }),
  toggleDebug: () => set(state => ({ debugVisible: !state.debugVisible })),
}));

export function worldInputBlocked() {
  const state = useExperienceState.getState();
  return state.overlay !== null || state.deviceActive;
}

// Touch values are transient; never published through React/Zustand.
export const touchMovement = { x: 0, z: 0 };
export const CAMERA_RECENTER_EVENT = "camera:recenter";

export function requestCameraRecenter() {
  window.dispatchEvent(new CustomEvent(CAMERA_RECENTER_EVENT));
}

export function requestWorldInteraction(cancel = false) {
  window.dispatchEvent(new CustomEvent(cancel ? "world:cancel" : "world:interact"));
}
