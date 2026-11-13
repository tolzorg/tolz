import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LoanCalculatorTool from "../components/tools/loan-calculator/LoanCalculatorTool";
import LoanCalculatorFaqSection from "../components/tools/loan-calculator/LoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LoanCalculatorPage() {
  const tool = getToolById("loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Loan Calculator: Amortization, Deferred & Bond Value"
      seoDescription="Free loan calculator for amortized payments, deferred loans, and zero-coupon bond present value. See a full payment schedule. No signup needed."
      footer={<LoanCalculatorFaqSection />}
      wide
    >
      <LoanCalculatorTool />
    </ToolPageWrapper>
  );
}
