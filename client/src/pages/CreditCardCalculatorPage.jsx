import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CreditCardCalculatorTool from "../components/tools/credit-card-calculator/CreditCardCalculatorTool";
import CreditCardCalculatorFaqSection from "../components/tools/credit-card-calculator/CreditCardCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CreditCardCalculatorPage() {
  const tool = getToolById("credit-card-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Credit Card Calculator - Free Payoff Time & Payment Calculator"
      seoDescription="Calculate how long it will take to pay off a credit card balance, or the monthly payment needed to pay it off within a certain timeframe. Free, fast, and no signup required."
      footer={<CreditCardCalculatorFaqSection />}
      wide
    >
      <CreditCardCalculatorTool />
    </ToolPageWrapper>
  );
}
