import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FutureValueCalculatorTool from "../components/tools/future-value-calculator/FutureValueCalculatorTool";
import FutureValueCalculatorFaqSection from "../components/tools/future-value-calculator/FutureValueCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FutureValueCalculatorPage() {
  const tool = getToolById("future-value-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Future Value Calculator - FV with Deposits & Schedule"
      seoDescription="Calculate the future value of a starting amount plus periodic deposits made at the beginning or end of each period, with present value, total interest, a schedule and charts. Free, no signup."
      footer={<FutureValueCalculatorFaqSection />}
      wide
    >
      <FutureValueCalculatorTool />
    </ToolPageWrapper>
  );
}
