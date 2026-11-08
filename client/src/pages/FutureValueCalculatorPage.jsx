import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FutureValueCalculatorTool from "../components/tools/future-value-calculator/FutureValueCalculatorTool";
import FutureValueCalculatorFaqSection from "../components/tools/future-value-calculator/FutureValueCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FutureValueCalculatorPage() {
  const tool = getToolById("future-value-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Future Value Calculator – Free FV with Deposits"
      seoDescription="Free future value calculator with periodic deposits at the start or end of each period. See present value, total interest and a year-by-year schedule."
      footer={<FutureValueCalculatorFaqSection />}
      wide
    >
      <FutureValueCalculatorTool />
    </ToolPageWrapper>
  );
}
