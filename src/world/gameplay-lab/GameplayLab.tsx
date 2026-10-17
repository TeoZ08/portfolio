"use client";

import { useEffect } from "react";
import { WorldCanvas } from "@/world/WorldCanvas";
import { DevPlayground } from "@/world/playground/DevPlayground";
import { DiscoveryMarkers } from "./DiscoveryMarkers";
import { DiscoveryHUD } from "./DiscoveryHUD";
import { useDiscoveryLabStore } from "./discovery-store";

export function GameplayLab() {
  useEffect(() => {
    // Deliberately ephemeral prototype. No persistence and no impact on world state.
    useDiscoveryLabStore.getState().reset();
  }, []);

  return (
    <main className="dev-page">
      <WorldCanvas
        canvasLabel="Protótipo isolado de descobertas contextuais"
        dataWorldMode="physics-playground"
        region="DEV_FOUNDATION"
      >
        <DevPlayground />
        <DiscoveryMarkers />
      </WorldCanvas>
      <DiscoveryHUD />
    </main>
  );
}
