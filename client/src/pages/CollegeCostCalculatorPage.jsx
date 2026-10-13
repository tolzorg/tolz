import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CollegeCostCalculatorTool from "../components/tools/college-cost-calculator/CollegeCostCalculatorTool";
import CollegeCostCalculatorFaqSection from "../components/tools/college-cost-calculator/CollegeCostCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CollegeCostCalculatorPage() {
  const tool = getToolById("college-cost-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="College Cost Calculator: Free Tuition & Savings Estimator"
      seoDescription="Free college cost calculator. Estimate total tuition with yearly increases, see it in today's dollars, and get the monthly amount to save. No signup needed."
      footer={<CollegeCostCalculatorFaqSection />}
      wide
    >
      <CollegeCostCalculatorTool />
    </ToolPageWrapper>
  );
}
