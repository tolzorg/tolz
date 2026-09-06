import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AmortizationCalculatorTool from "../components/tools/amortization-calculator/AmortizationCalculatorTool";
import AmortizationCalculatorFaqSection from "../components/tools/amortization-calculator/AmortizationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AmortizationCalculatorPage() {
  const tool = getToolById("amortization-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Amortization Calculator - Free Loan Payment Schedule"
      seoDescription="Calculate monthly payments, total interest, and your full amortization schedule free. See how extra payments cut your payoff time. No signup."
      footer={<AmortizationCalculatorFaqSection />}
      wide
    >
      <AmortizationCalculatorTool />
    </ToolPageWrapper>
  );
}
