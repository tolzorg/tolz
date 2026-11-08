import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ReorderPointCalculatorTool from "../components/tools/reorder-point-calculator/ReorderPointCalculatorTool";
import ReorderPointCalculatorFaqSection from "../components/tools/reorder-point-calculator/ReorderPointCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ReorderPointCalculatorPage() {
  const tool = getToolById("reorder-point-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Reorder Point Calculator - ROP Formula for Inventory"
      seoDescription="Free reorder point calculator: find when to reorder inventory from your basic stock, safety stock, lead time and unit sales, or solve for any one of them."
      footer={<ReorderPointCalculatorFaqSection />}
      wide
    >
      <ReorderPointCalculatorTool />
    </ToolPageWrapper>
  );
}
