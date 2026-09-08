import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FinanceCalculatorTool from "../components/tools/finance-calculator/FinanceCalculatorTool";
import FinanceCalculatorFaqSection from "../components/tools/finance-calculator/FinanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FinanceCalculatorPage() {
  const tool = getToolById("finance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Finance Calculator - Free Online TVM (N, I/Y, PV, PMT, FV) Calculator"
      seoDescription="Solve for future value, payment, interest rate, number of periods, or present value with this free 5-key time-value-of-money calculator. Works like a BA II Plus or HP 12C."
      footer={<FinanceCalculatorFaqSection />}
      wide
    >
      <FinanceCalculatorTool />
    </ToolPageWrapper>
  );
}
