import RetirementNeedCard from "./RetirementNeedCard";
import SavingsPlanCard from "./SavingsPlanCard";
import WithdrawalCard from "./WithdrawalCard";
import MoneyLongevityCard from "./MoneyLongevityCard";

// Four independent sub-calculators stacked vertically, matching the
// reference site's own 4-panel layout — each panel has its own inputs,
// its own Calculate button, and its own Result box.
export default function RetirementCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <RetirementNeedCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <SavingsPlanCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <WithdrawalCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <MoneyLongevityCard />
    </div>
  );
}
