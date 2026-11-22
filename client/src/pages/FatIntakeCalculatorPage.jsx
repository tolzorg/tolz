import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FatIntakeCalculatorTool from "../components/tools/fat-intake-calculator/FatIntakeCalculatorTool";
import FatIntakeCalculatorFaqSection from "../components/tools/fat-intake-calculator/FatIntakeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FatIntakeCalculatorPage() {
  const tool = getToolById("fat-intake-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Fat Intake Calculator – Daily Fat & Saturated Fat Grams"
      seoDescription="Free Fat Intake Calculator: find your daily grams of total and saturated fat to lose, maintain or gain weight, based on age, height, weight and activity."
      footer={<FatIntakeCalculatorFaqSection />}
      wide
    >
      <FatIntakeCalculatorTool />
    </ToolPageWrapper>
  );
}
