import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BmrCalculatorTool from "../components/tools/bmr-calculator/BmrCalculatorTool";
import BmrCalculatorFaqSection from "../components/tools/bmr-calculator/BmrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BmrCalculatorPage() {
  const tool = getToolById("bmr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BMR Calculator: Free Basal Metabolic Rate & Daily Calories"
      seoDescription="Free BMR calculator with Mifflin-St Jeor, Harris-Benedict and Katch-McArdle. Find your basal metabolic rate, normal ranges and daily calories at six activity levels."
      footer={<BmrCalculatorFaqSection />}
      wide
    >
      <BmrCalculatorTool />
    </ToolPageWrapper>
  );
}
