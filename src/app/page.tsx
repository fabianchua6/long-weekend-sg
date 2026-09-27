import { Suspense } from "react";
import { Planner } from "@/components/planner/planner";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Planner initialYear={2027} />
    </Suspense>
  );
}
