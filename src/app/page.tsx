import { DevPanel } from "@/ui/DevPanel";
import { FieldRegion } from "@/world/regions/FieldRegion";
import { WorldCanvas } from "@/world/WorldCanvas";
import { FIELD_PALETTE } from "@/world/regions/field/field-palette";
import { FIELD_CAMERA_COMPOSITION } from "@/world/regions/field/field-view";

export default function HomePage() {
  return (
    <main className="world-page">
      <WorldCanvas
        backgroundColor={FIELD_PALETTE.sky}
        playerColor={FIELD_PALETTE.player}
        cameraPreset={FIELD_CAMERA_COMPOSITION}
        canvasLabel="Protótipo visual do mundo: Arrival, Field e exterior da Casa"
        dataWorldMode="vertical-slice"
        region="FIELD"
      >
        <FieldRegion />
      </WorldCanvas>
      {process.env.NODE_ENV !== "production" ? (
        <DevPanel title="DEV / Visual Vertical Slice" />
      ) : null}
    </main>
  );
}
