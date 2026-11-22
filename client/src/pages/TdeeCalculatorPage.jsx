import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TdeeCalculatorTool from "../components/tools/tdee-calculator/TdeeCalculatorTool";
import TdeeCalculatorFaqSection from "../components/tools/tdee-calculator/TdeeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TdeeCalculatorPage() {
  const tool = getToolById("tdee-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="TDEE Calculator - Free Maintenance Calories Estimator"
      seoDescription="Use our free TDEE calculator to find your maintenance calories, BMI, and daily Calorie targets to lose or gain weight. Fast, with no signup needed."
      footer={<TdeeCalculatorFaqSection />}
      wide
    >
      <TdeeCalculatorTool />
    </ToolPageWrapper>
  );
}
