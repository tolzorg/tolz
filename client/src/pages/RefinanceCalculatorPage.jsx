import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RefinanceCalculatorTool from "../components/tools/refinance-calculator/RefinanceCalculatorTool";
import RefinanceCalculatorFaqSection from "../components/tools/refinance-calculator/RefinanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RefinanceCalculatorPage() {
  const tool = getToolById("refinance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Refinance Calculator – Free Savings & Break-Even Tool"
      seoDescription="Use our free refinance calculator to compare loans, see your new payment, APR with points, lifetime savings, cash-out amount and break-even point."
      footer={<RefinanceCalculatorFaqSection />}
      wide
    >
      <RefinanceCalculatorTool />
    </ToolPageWrapper>
  );
}
