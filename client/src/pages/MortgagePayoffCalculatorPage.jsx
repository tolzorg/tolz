import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgagePayoffCalculatorTool from "../components/tools/mortgage-payoff-calculator/MortgagePayoffCalculatorTool";
import MortgagePayoffFaqSection from "../components/tools/mortgage-payoff-calculator/MortgagePayoffFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgagePayoffCalculatorPage() {
  const tool = getToolById("mortgage-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Payoff Calculator - Free Early Payoff Tool"
      seoDescription="Use our free mortgage payoff calculator to see how extra or biweekly payments cut your loan term and interest, or find your exact payoff amount today."
      footer={<MortgagePayoffFaqSection />}
      wide
    >
      <MortgagePayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
