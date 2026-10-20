import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TdeeCalculatorTool from "../components/tools/tdee-calculator/TdeeCalculatorTool";
import TdeeCalculatorFaqSection from "../components/tools/tdee-calculator/TdeeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TdeeCalculatorPage() {
  const tool = getToolById("tdee-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="TDEE Calculator - Total Daily Energy Expenditure"
      seoDescription="Free TDEE calculator: estimate your total daily energy expenditure (maintenance Calories or kJ) from your age, gender, height, weight and activity, plus Calories to lose or gain weight and your BMI."
      footer={<TdeeCalculatorFaqSection />}
      wide
    >
      <TdeeCalculatorTool />
    </ToolPageWrapper>
  );
}
