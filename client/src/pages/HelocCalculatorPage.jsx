import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HelocCalculatorTool from "../components/tools/heloc-calculator/HelocCalculatorTool";
import HelocCalculatorFaqSection from "../components/tools/heloc-calculator/HelocCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HelocCalculatorPage() {
  const tool = getToolById("heloc-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="HELOC Calculator: Payments, Interest & APR (Free)"
      seoDescription="Free HELOC calculator to estimate draw and repayment payments, total interest, APR with fees, borrowing limit, and a full amortization schedule."
      footer={<HelocCalculatorFaqSection />}
      wide
    >
      <HelocCalculatorTool />
    </ToolPageWrapper>
  );
}
