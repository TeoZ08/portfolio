"use client";

import { Component, type ReactNode } from "react";

// Optional visual assets must never take down physics or the surrounding world.
export class AssetBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children; }
}
