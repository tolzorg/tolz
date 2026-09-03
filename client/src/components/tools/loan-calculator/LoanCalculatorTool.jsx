import AmortizedLoanCard from "./AmortizedLoanCard";
import DeferredLoanCard from "./DeferredLoanCard";
import BondCard from "./BondCard";

const dividerStyle = { border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" };

export default function LoanCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AmortizedLoanCard />
      <hr style={dividerStyle} />
      <DeferredLoanCard />
      <hr style={dividerStyle} />
      <BondCard />
    </div>
  );
}
