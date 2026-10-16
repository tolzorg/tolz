import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CanadianMortgageCalculatorTool from "../components/tools/canadian-mortgage-calculator/CanadianMortgageCalculatorTool";
import CanadianMortgageCalculatorFaqSection from "../components/tools/canadian-mortgage-calculator/CanadianMortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CanadianMortgageCalculatorPage() {
  const tool = getToolById("canadian-mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Canadian Mortgage Calculator - Semi-Annual Compounding"
      seoDescription="Canadian mortgage calculator with semi-annual compounding: monthly payment, property tax, insurance, condo fees and total cost, with an amortization schedule and charts. Free, no signup."
      footer={<CanadianMortgageCalculatorFaqSection />}
      wide
    >
      <CanadianMortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
