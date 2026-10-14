import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RefinanceCalculatorTool from "../components/tools/refinance-calculator/RefinanceCalculatorTool";
import RefinanceCalculatorFaqSection from "../components/tools/refinance-calculator/RefinanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RefinanceCalculatorPage() {
  const tool = getToolById("refinance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Refinance Calculator - New Payment, APR, Savings & Break-Even"
      seoDescription="Compare your current loan with a refinance: new monthly payment, APR with points and fees, lifetime savings, cash-out take-home amount, and break-even point. Free, no signup."
      footer={<RefinanceCalculatorFaqSection />}
      wide
    >
      <RefinanceCalculatorTool />
    </ToolPageWrapper>
  );
}
