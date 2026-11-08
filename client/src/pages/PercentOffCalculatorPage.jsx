import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PercentOffCalculatorTool from "../components/tools/percent-off-calculator/PercentOffCalculatorTool";
import PercentOffCalculatorFaqSection from "../components/tools/percent-off-calculator/PercentOffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PercentOffCalculatorPage() {
  const tool = getToolById("percent-off-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Percent Off Calculator: Sale Price & Savings (Free)"
      seoDescription="Free percent off calculator. Find the sale price, amount saved, discount percent or original price, plus stackable extra discounts. Works in seconds."
      footer={<PercentOffCalculatorFaqSection />}
      wide
    >
      <PercentOffCalculatorTool />
    </ToolPageWrapper>
  );
}
