import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LoanCalculatorTool from "../components/tools/loan-calculator/LoanCalculatorTool";
import LoanCalculatorFaqSection from "../components/tools/loan-calculator/LoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LoanCalculatorPage() {
  const tool = getToolById("loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Loan Calculator – Amortized Loan, Deferred Payment & Bond"
      seoDescription="Calculate loan payments, lump-sum payoffs, and bond present values — for amortized loans with regular payments, deferred loans due in full at maturity, and bonds priced back from a known face value. Free, no signup."
      footer={<LoanCalculatorFaqSection />}
      wide
    >
      <LoanCalculatorTool />
    </ToolPageWrapper>
  );
}
