import { notFound } from "next/navigation";
import { GameplayLab } from "@/world/gameplay-lab/GameplayLab";

// Research route is never served in the production portfolio.
export default function GameplayLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GameplayLab />;
}
