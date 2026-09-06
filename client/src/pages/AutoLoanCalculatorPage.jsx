import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AutoLoanCalculatorTool from "../components/tools/auto-loan-calculator/AutoLoanCalculatorTool";
import AutoLoanCalculatorFaqSection from "../components/tools/auto-loan-calculator/AutoLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AutoLoanCalculatorPage() {
  const tool = getToolById("auto-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Auto Loan Calculator - Estimate Monthly Car Payments"
      seoDescription="Calculate your monthly auto loan payment free online, including sales tax, trade-in credit, and fees, plus a full amortization schedule on Tolz."
      footer={<AutoLoanCalculatorFaqSection />}
      wide
    >
      <AutoLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
