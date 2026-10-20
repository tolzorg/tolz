import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MacroCalculatorTool from "../components/tools/macro-calculator/MacroCalculatorTool";
import MacroCalculatorFaqSection from "../components/tools/macro-calculator/MacroCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MacroCalculatorPage() {
  const tool = getToolById("macro-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Macro Calculator - Daily Protein, Carbs & Fat"
      seoDescription="Free macro calculator: find your daily protein, carbs, fat, sugar and saturated fat with healthy ranges, from your age, gender, height, weight, activity and goal. Balanced, low fat, low carb, high protein or your own plan."
      footer={<MacroCalculatorFaqSection />}
      wide
    >
      <MacroCalculatorTool />
    </ToolPageWrapper>
  );
}
