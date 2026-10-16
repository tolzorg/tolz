import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PercentOffCalculatorTool from "../components/tools/percent-off-calculator/PercentOffCalculatorTool";
import PercentOffCalculatorFaqSection from "../components/tools/percent-off-calculator/PercentOffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PercentOffCalculatorPage() {
  const tool = getToolById("percent-off-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Percent Off Calculator - Final Price & Stacked Discounts"
      seoDescription="Percent off calculator: find the final price, amount saved, percent off or original price from any two values, with stackable additional discounts. Free, no signup."
      footer={<PercentOffCalculatorFaqSection />}
      wide
    >
      <PercentOffCalculatorTool />
    </ToolPageWrapper>
  );
}
