import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageCalculatorTool from "../components/tools/mortgage-calculator/MortgageCalculatorTool";
import MortgageCalculatorFaqSection from "../components/tools/mortgage-calculator/MortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageCalculatorPage() {
  const tool = getToolById("mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Mortgage Calculator - Estimate Monthly Payments"
      seoDescription="Estimate your monthly mortgage payment free online, including taxes, insurance, PMI, and HOA fees. Model extra payments and biweekly payoff instantly."
      footer={<MortgageCalculatorFaqSection />}
      wide
    >
      <MortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
