import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CollegeCostCalculatorTool from "../components/tools/college-cost-calculator/CollegeCostCalculatorTool";
import CollegeCostCalculatorFaqSection from "../components/tools/college-cost-calculator/CollegeCostCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CollegeCostCalculatorPage() {
  const tool = getToolById("college-cost-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="College Cost Calculator - Total Cost & Monthly Savings"
      seoDescription="Estimate the total cost of college with yearly tuition increases, its value in today's money, and how much to save each month to cover all or part of it. Free, no signup."
      footer={<CollegeCostCalculatorFaqSection />}
      wide
    >
      <CollegeCostCalculatorTool />
    </ToolPageWrapper>
  );
}
