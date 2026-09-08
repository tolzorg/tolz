import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgagePayoffCalculatorTool from "../components/tools/mortgage-payoff-calculator/MortgagePayoffCalculatorTool";
import MortgagePayoffFaqSection from "../components/tools/mortgage-payoff-calculator/MortgagePayoffFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgagePayoffCalculatorPage() {
  const tool = getToolById("mortgage-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Payoff Calculator - Free Extra Payment & Biweekly Payoff Tool"
      seoDescription="See how extra payments or biweekly payments can shorten your mortgage and save on interest, or find out exactly what it costs to pay off your loan today. Free and instant."
      footer={<MortgagePayoffFaqSection />}
      wide
    >
      <MortgagePayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
