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
      seoDescription="Free auto loan calculator with sales tax, trade-in, fees, and a full amortization schedule. Learn how car loans, pre-approval, and rates work on Tolz."
      footer={<AutoLoanCalculatorFaqSection />}
      wide
    >
      <AutoLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
