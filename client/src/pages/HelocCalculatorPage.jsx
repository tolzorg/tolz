import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HelocCalculatorTool from "../components/tools/heloc-calculator/HelocCalculatorTool";
import HelocCalculatorFaqSection from "../components/tools/heloc-calculator/HelocCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HelocCalculatorPage() {
  const tool = getToolById("heloc-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="HELOC Calculator - Payments, APR & How Much You Can Borrow"
      seoDescription="Calculate HELOC draw-period and repayment payments, total interest, cost and APR with closing costs and annual fees, plus an amortization schedule and how much line of credit you can borrow. Free, no signup."
      footer={<HelocCalculatorFaqSection />}
      wide
    >
      <HelocCalculatorTool />
    </ToolPageWrapper>
  );
}
