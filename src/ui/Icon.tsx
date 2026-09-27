import type { CSSProperties } from "react";

export type IconName = "folder" | "book" | "note" | "terminal" | "person" | "mail" | "settings" | "arrow" | "close" | "expand" | "sun" | "home" | "walk" | "menu";
const paths: Record<IconName, React.ReactNode> = {
  folder: <><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3Z" /><path d="M3 10h18" /></>,
  book: <><path d="M12 5v15M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a5 5 0 0 0-4 2 5 5 0 0 0-4-2H3Z" /></>,
  note: <><path d="M5 3h10l4 4v14H5Z" /><path d="M15 3v5h4M8 12h8M8 16h6" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
  person: <><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6m8 0v6M10 15v6" /></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  home: <><path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7" /></>,
  walk: <><circle cx="14" cy="4" r="2" /><path d="m9 22 3-8 3 3v5M4 12l4-1 3-5 3 6 5 2m-8-8 1 8" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
};
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
