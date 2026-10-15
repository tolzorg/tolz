import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FhaLoanCalculatorTool from "../components/tools/fha-loan-calculator/FhaLoanCalculatorTool";
import FhaLoanCalculatorFaqSection from "../components/tools/fha-loan-calculator/FhaLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FhaLoanCalculatorPage() {
  const tool = getToolById("fha-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="FHA Loan Calculator - Payment with MIP, Taxes & Schedule"
      seoDescription="Estimate an FHA mortgage payment with upfront and annual MIP, property taxes, insurance, HOA and other costs, extra payments, a bi-weekly comparison and a full amortization schedule. Free, no signup."
      footer={<FhaLoanCalculatorFaqSection />}
      wide
    >
      <FhaLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
