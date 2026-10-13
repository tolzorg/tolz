import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AverageReturnCalculatorTool from "../components/tools/average-return-calculator/AverageReturnCalculatorTool";
import AverageReturnCalculatorFaqSection from "../components/tools/average-return-calculator/AverageReturnCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AverageReturnCalculatorPage() {
  const tool = getToolById("average-return-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Average Return Calculator - Cash Flow & Cumulative Return"
      seoDescription="Calculate an account's average annual return from deposits and withdrawals, or the cumulative and average return of investments held for different lengths of time. Free, no signup."
      footer={<AverageReturnCalculatorFaqSection />}
      wide
    >
      <AverageReturnCalculatorTool />
    </ToolPageWrapper>
  );
}
