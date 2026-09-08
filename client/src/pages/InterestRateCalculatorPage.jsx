import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InterestRateCalculatorTool from "../components/tools/interest-rate-calculator/InterestRateCalculatorTool";
import InterestRateCalculatorFaqSection from "../components/tools/interest-rate-calculator/InterestRateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InterestRateCalculatorPage() {
  const tool = getToolById("interest-rate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Interest Rate Calculator - Free Loan Interest Rate Finder"
      seoDescription="Find the interest rate implied by a loan amount, term, and fixed monthly payment, plus the total interest paid over the life of the loan. Free and instant."
      footer={<InterestRateCalculatorFaqSection />}
      wide
    >
      <InterestRateCalculatorTool />
    </ToolPageWrapper>
  );
}
