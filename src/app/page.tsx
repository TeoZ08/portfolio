import { DevPanel } from "@/ui/DevPanel";
import { FieldRegion } from "@/world/regions/FieldRegion";
import { WorldCanvas } from "@/world/WorldCanvas";

export default function HomePage() {
  return (
    <main className="world-page">
      <WorldCanvas
        backgroundColor="#aeb8b2"
        canvasLabel="Canvas DEV do vertical slice Arrival, Field e House exterior"
        dataWorldMode="vertical-slice"
        region="FIELD"
      >
        <FieldRegion />
      </WorldCanvas>
      {process.env.NODE_ENV !== "production" ? (
        <DevPanel title="DEV / Vertical Slice Blockout" />
      ) : null}
    </main>
  );
}
