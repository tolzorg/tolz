import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FhaLoanCalculatorTool from "../components/tools/fha-loan-calculator/FhaLoanCalculatorTool";
import FhaLoanCalculatorFaqSection from "../components/tools/fha-loan-calculator/FhaLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FhaLoanCalculatorPage() {
  const tool = getToolById("fha-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="FHA Loan Calculator - Free Payment, MIP & Amortization"
      seoDescription="Free FHA loan calculator: estimate your monthly payment with upfront and annual MIP, taxes, insurance, HOA, extra payments and an amortization schedule."
      footer={<FhaLoanCalculatorFaqSection />}
      wide
    >
      <FhaLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
