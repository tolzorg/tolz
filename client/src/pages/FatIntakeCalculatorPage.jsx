import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FatIntakeCalculatorTool from "../components/tools/fat-intake-calculator/FatIntakeCalculatorTool";
import FatIntakeCalculatorFaqSection from "../components/tools/fat-intake-calculator/FatIntakeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FatIntakeCalculatorPage() {
  const tool = getToolById("fat-intake-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Fat Intake Calculator - Daily Fat & Saturated Fat"
      seoDescription="Free fat intake calculator: find how many grams of fat (20-35% of Calories) and saturated fat (under 10%, or 7% for heart health) to eat each day to maintain, lose or gain weight, from your age, gender, height, weight and activity."
      footer={<FatIntakeCalculatorFaqSection />}
      wide
    >
      <FatIntakeCalculatorTool />
    </ToolPageWrapper>
  );
}
