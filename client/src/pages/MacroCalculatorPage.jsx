import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MacroCalculatorTool from "../components/tools/macro-calculator/MacroCalculatorTool";
import MacroCalculatorFaqSection from "../components/tools/macro-calculator/MacroCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MacroCalculatorPage() {
  const tool = getToolById("macro-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Macro Calculator: Free Daily Macro Targets"
      seoDescription="Use this free macro calculator to find your daily protein, carbs, fat, sugar and saturated fat from your age, weight, activity and goal. Instant results."
      footer={<MacroCalculatorFaqSection />}
      wide
    >
      <MacroCalculatorTool />
    </ToolPageWrapper>
  );
}
