import { DevPanel } from "@/ui/DevPanel";
import { DevCanvas } from "@/world/DevCanvas";

export default function DevPlaygroundPage() {
  return (
    <main className="dev-page">
      <DevCanvas />
      {process.env.NODE_ENV !== "production" ? <DevPanel /> : null}
    </main>
  );
}
