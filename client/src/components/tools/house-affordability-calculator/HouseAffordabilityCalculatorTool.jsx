import MainAffordabilityCard from "./MainAffordabilityCard";
import BudgetAffordabilityCard from "./BudgetAffordabilityCard";

// Two independent sub-calculators stacked vertically, matching the
// reference site's own two-panel layout — each panel has its own
// inputs, its own Calculate button, and its own Result box.
export default function HouseAffordabilityCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <MainAffordabilityCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <BudgetAffordabilityCard />
    </div>
  );
}
