import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CreditCardPayoffCalculatorTool from "../components/tools/credit-card-payoff-calculator/CreditCardPayoffCalculatorTool";
import CreditCardPayoffCalculatorFaqSection from "../components/tools/credit-card-payoff-calculator/CreditCardPayoffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CreditCardPayoffCalculatorPage() {
  const tool = getToolById("credit-card-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Credit Card Payoff Calculator - Avalanche Method"
      seoDescription="Free credit card payoff calculator using the debt avalanche method. Add multiple cards, see your payoff date and total interest, and clear debt faster."
      footer={<CreditCardPayoffCalculatorFaqSection />}
      wide
    >
      <CreditCardPayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
