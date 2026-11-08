import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VaMortgageCalculatorTool from "../components/tools/va-mortgage-calculator/VaMortgageCalculatorTool";
import VaMortgageCalculatorFaqSection from "../components/tools/va-mortgage-calculator/VaMortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VaMortgageCalculatorPage() {
  const tool = getToolById("va-mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="VA Mortgage Calculator - Free VA Loan Payment Estimator"
      seoDescription="Use our free VA mortgage calculator to estimate monthly payments with the VA funding fee, taxes, insurance, HOA, extra payments and an amortization schedule."
      footer={<VaMortgageCalculatorFaqSection />}
      wide
    >
      <VaMortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
