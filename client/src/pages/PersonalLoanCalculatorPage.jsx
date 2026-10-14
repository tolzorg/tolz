import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PersonalLoanCalculatorTool from "../components/tools/personal-loan-calculator/PersonalLoanCalculatorTool";
import PersonalLoanCalculatorFaqSection from "../components/tools/personal-loan-calculator/PersonalLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PersonalLoanCalculatorPage() {
  const tool = getToolById("personal-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Personal Loan Calculator - Monthly Payment, APR & Amortization"
      seoDescription="Calculate a personal loan's monthly payment, total interest, payoff date, and amortization schedule, plus the real APR with origination fees and insurance. Free, no signup."
      footer={<PersonalLoanCalculatorFaqSection />}
      wide
    >
      <PersonalLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
