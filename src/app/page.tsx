import { DevCanvas } from "@/world/DevCanvas";
import { DevPanel } from "@/ui/DevPanel";

export default function HomePage() {
  return (
    <main className="foundation-page">
      <DevCanvas />
      {process.env.NODE_ENV !== "production" ? <DevPanel /> : null}
    </main>
  );
}
