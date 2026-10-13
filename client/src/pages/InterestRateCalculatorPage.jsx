import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InterestRateCalculatorTool from "../components/tools/interest-rate-calculator/InterestRateCalculatorTool";
import InterestRateCalculatorFaqSection from "../components/tools/interest-rate-calculator/InterestRateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InterestRateCalculatorPage() {
  const tool = getToolById("interest-rate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Interest Rate Calculator: Find Your Loan Rate Free"
      seoDescription="Free interest rate calculator. Enter your loan amount, term, and monthly payment to find the real rate and total interest you'll pay over the loan."
      footer={<InterestRateCalculatorFaqSection />}
      wide
    >
      <InterestRateCalculatorTool />
    </ToolPageWrapper>
  );
}
