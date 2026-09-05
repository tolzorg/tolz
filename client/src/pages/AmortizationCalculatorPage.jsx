import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AmortizationCalculatorTool from "../components/tools/amortization-calculator/AmortizationCalculatorTool";
import AmortizationCalculatorFaqSection from "../components/tools/amortization-calculator/AmortizationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AmortizationCalculatorPage() {
  const tool = getToolById("amortization-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Amortization Calculator – Monthly Payment & Payoff Schedule"
      seoDescription="Calculate your loan's monthly payment, total interest, and a full amortization schedule. See how extra monthly, yearly, or one-time payments can shorten your payoff time and save interest. Free, no signup."
      footer={<AmortizationCalculatorFaqSection />}
      wide
    >
      <AmortizationCalculatorTool />
    </ToolPageWrapper>
  );
}
