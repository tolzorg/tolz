import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageCalculatorUkTool from "../components/tools/mortgage-calculator-uk/MortgageCalculatorUkTool";
import MortgageCalculatorUkFaqSection from "../components/tools/mortgage-calculator-uk/MortgageCalculatorUkFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageCalculatorUkPage() {
  const tool = getToolById("mortgage-calculator-uk");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Calculator UK – Free Repayment & Interest-Only"
      seoDescription="Free mortgage calculator UK in pounds. Work out repayment or interest-only payments, add deposit, stamp duty and insurance, and see your full schedule."
      footer={<MortgageCalculatorUkFaqSection />}
      wide
    >
      <MortgageCalculatorUkTool />
    </ToolPageWrapper>
  );
}
