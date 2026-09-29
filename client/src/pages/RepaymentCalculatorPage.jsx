import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RepaymentCalculatorTool from "../components/tools/repayment-calculator/RepaymentCalculatorTool";
import RepaymentCalculatorFaqSection from "../components/tools/repayment-calculator/RepaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RepaymentCalculatorPage() {
  const tool = getToolById("repayment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Repayment Calculator - Free Loan Payment & Payoff Time"
      seoDescription="Solve for the loan payment given a fixed payoff time, or the payoff time given a fixed payment, with independent compounding and payment frequencies. Free, fast, and no signup required."
      footer={<RepaymentCalculatorFaqSection />}
      wide
    >
      <RepaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
