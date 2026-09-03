import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AutoLoanCalculatorTool from "../components/tools/auto-loan-calculator/AutoLoanCalculatorTool";
import AutoLoanCalculatorFaqSection from "../components/tools/auto-loan-calculator/AutoLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AutoLoanCalculatorPage() {
  const tool = getToolById("auto-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Auto Loan Calculator – Monthly Car Payment, Tax & Fees"
      seoDescription="Calculate your monthly auto loan payment including sales tax, trade-in credit, cash incentives, and title/registration fees. Solve for price or payment. Free, no signup."
      footer={<AutoLoanCalculatorFaqSection />}
      wide
    >
      <AutoLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
