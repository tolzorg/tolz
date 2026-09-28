import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CreditCardPayoffCalculatorTool from "../components/tools/credit-card-payoff-calculator/CreditCardPayoffCalculatorTool";
import CreditCardPayoffCalculatorFaqSection from "../components/tools/credit-card-payoff-calculator/CreditCardPayoffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CreditCardPayoffCalculatorPage() {
  const tool = getToolById("credit-card-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Credit Card Payoff Calculator - Free Debt Avalanche Schedule"
      seoDescription="Build a cost-efficient payback schedule for multiple credit cards using the debt avalanche method. Free, fast, and no signup required."
      footer={<CreditCardPayoffCalculatorFaqSection />}
      wide
    >
      <CreditCardPayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
