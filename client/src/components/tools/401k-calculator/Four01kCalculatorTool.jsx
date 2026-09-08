import BalanceProjectionCard from "./BalanceProjectionCard";
import EarlyWithdrawalCard from "./EarlyWithdrawalCard";
import MaximizeMatchCard from "./MaximizeMatchCard";

// Three independent sub-calculators stacked vertically, matching the
// reference site's own 3-panel layout — each panel has its own inputs,
// its own Calculate button, and its own Result box.
export default function Four01kCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <BalanceProjectionCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <EarlyWithdrawalCard />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
      <MaximizeMatchCard />
    </div>
  );
}
