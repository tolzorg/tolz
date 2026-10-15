import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VaMortgageCalculatorTool from "../components/tools/va-mortgage-calculator/VaMortgageCalculatorTool";
import VaMortgageCalculatorFaqSection from "../components/tools/va-mortgage-calculator/VaMortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VaMortgageCalculatorPage() {
  const tool = getToolById("va-mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="VA Mortgage Calculator - Payment with VA Funding Fee"
      seoDescription="Estimate a VA home loan payment with the VA funding fee (financed or paid upfront), property taxes, insurance and other costs, extra payments, a bi-weekly comparison and a full amortization schedule. Free, no signup."
      footer={<VaMortgageCalculatorFaqSection />}
      wide
    >
      <VaMortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
