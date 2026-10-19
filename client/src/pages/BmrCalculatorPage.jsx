import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BmrCalculatorTool from "../components/tools/bmr-calculator/BmrCalculatorTool";
import BmrCalculatorFaqSection from "../components/tools/bmr-calculator/BmrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BmrCalculatorPage() {
  const tool = getToolById("bmr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BMR Calculator - Basal Metabolic Rate & Daily Calorie Needs"
      seoDescription="Free BMR calculator: estimate your basal metabolic rate with the Mifflin-St Jeor, Harris-Benedict or Katch-McArdle formula and see your daily calorie needs at six activity levels, in Calories or kilojoules."
      footer={<BmrCalculatorFaqSection />}
      wide
    >
      <BmrCalculatorTool />
    </ToolPageWrapper>
  );
}
