import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CanadianMortgageCalculatorTool from "../components/tools/canadian-mortgage-calculator/CanadianMortgageCalculatorTool";
import CanadianMortgageCalculatorFaqSection from "../components/tools/canadian-mortgage-calculator/CanadianMortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CanadianMortgageCalculatorPage() {
  const tool = getToolById("canadian-mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Canadian Mortgage Calculator – Payments & Amortization"
      seoDescription="Free Canadian mortgage calculator with semi-annual compounding. Get monthly payments, property tax, insurance, condo fees and an amortization schedule."
      footer={<CanadianMortgageCalculatorFaqSection />}
      wide
    >
      <CanadianMortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
