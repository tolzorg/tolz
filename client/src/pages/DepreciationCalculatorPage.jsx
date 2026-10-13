import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DepreciationCalculatorTool from "../components/tools/depreciation-calculator/DepreciationCalculatorTool";
import DepreciationCalculatorFaqSection from "../components/tools/depreciation-calculator/DepreciationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DepreciationCalculatorPage() {
  const tool = getToolById("depreciation-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Depreciation Calculator - Straight Line, Declining Balance & SYD"
      seoDescription="Build a depreciation schedule with the straight line, declining balance, or sum of the years' digits method, with partial-year conventions and a book value chart. Free, no signup."
      footer={<DepreciationCalculatorFaqSection />}
      wide
    >
      <DepreciationCalculatorTool />
    </ToolPageWrapper>
  );
}
