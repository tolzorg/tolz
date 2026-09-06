import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LoanCalculatorTool from "../components/tools/loan-calculator/LoanCalculatorTool";
import LoanCalculatorFaqSection from "../components/tools/loan-calculator/LoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LoanCalculatorPage() {
  const tool = getToolById("loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Loan Calculator Online | Amortization Schedule"
      seoDescription="Calculate loan payments, amortization schedules, deferred loans, and bond present value free online. No signup, instant results, full payment breakdown."
      footer={<LoanCalculatorFaqSection />}
      wide
    >
      <LoanCalculatorTool />
    </ToolPageWrapper>
  );
}
