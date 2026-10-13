import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CreditCardCalculatorTool from "../components/tools/credit-card-calculator/CreditCardCalculatorTool";
import CreditCardCalculatorFaqSection from "../components/tools/credit-card-calculator/CreditCardCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CreditCardCalculatorPage() {
  const tool = getToolById("credit-card-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Credit Card Calculator: Payoff Time & Payment"
      seoDescription="Free credit card calculator: see how long payoff takes at a fixed payment, or what monthly payment clears your balance by a set date. No signup needed."
      footer={<CreditCardCalculatorFaqSection />}
      wide
    >
      <CreditCardCalculatorTool />
    </ToolPageWrapper>
  );
}
