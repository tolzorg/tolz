import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HouseAffordabilityCalculatorTool from "../components/tools/house-affordability-calculator/HouseAffordabilityCalculatorTool";
import HouseAffordabilityCalculatorFaqSection from "../components/tools/house-affordability-calculator/HouseAffordabilityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HouseAffordabilityCalculatorPage() {
  const tool = getToolById("house-affordability-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="House Affordability Calculator - Free Home Buying Budget Estimator"
      seoDescription="Estimate an affordable house purchase amount based on household income, debts, and lending guidelines (Conventional, FHA, VA), or a fixed monthly budget. Free and instant."
      footer={<HouseAffordabilityCalculatorFaqSection />}
      wide
    >
      <HouseAffordabilityCalculatorTool />
    </ToolPageWrapper>
  );
}
