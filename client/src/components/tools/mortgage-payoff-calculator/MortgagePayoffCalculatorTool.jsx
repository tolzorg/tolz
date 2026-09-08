import MortgagePayoffFromTermCard from "./MortgagePayoffFromTermCard";
import MortgagePayoffFromBalanceCard from "./MortgagePayoffFromBalanceCard";

export default function MortgagePayoffCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <MortgagePayoffFromTermCard />
      <div style={{ borderTop: "1px solid var(--border)" }} />
      <MortgagePayoffFromBalanceCard />
    </div>
  );
}
