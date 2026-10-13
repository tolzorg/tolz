import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HouseAffordabilityCalculatorTool from "../components/tools/house-affordability-calculator/HouseAffordabilityCalculatorTool";
import HouseAffordabilityCalculatorFaqSection from "../components/tools/house-affordability-calculator/HouseAffordabilityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HouseAffordabilityCalculatorPage() {
  const tool = getToolById("house-affordability-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free House Affordability Calculator: How Much Can I Afford?"
      seoDescription="Use our free house affordability calculator to see how much house you can afford. Enter income, debts and down payment, compare Conventional, FHA and VA."
      footer={<HouseAffordabilityCalculatorFaqSection />}
      wide
    >
      <HouseAffordabilityCalculatorTool />
    </ToolPageWrapper>
  );
}
