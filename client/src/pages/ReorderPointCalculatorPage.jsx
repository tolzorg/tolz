import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ReorderPointCalculatorTool from "../components/tools/reorder-point-calculator/ReorderPointCalculatorTool";
import ReorderPointCalculatorFaqSection from "../components/tools/reorder-point-calculator/ReorderPointCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ReorderPointCalculatorPage() {
  const tool = getToolById("reorder-point-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Reorder Point Calculator - Free ROP & Safety Stock Tool"
      seoDescription="Free reorder point calculator. Find when to restock from basic stock, safety stock, lead time and unit sales, or solve for any one value. Instant results."
      footer={<ReorderPointCalculatorFaqSection />}
      wide
    >
      <ReorderPointCalculatorTool />
    </ToolPageWrapper>
  );
}
