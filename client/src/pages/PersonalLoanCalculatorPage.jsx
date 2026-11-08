import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PersonalLoanCalculatorTool from "../components/tools/personal-loan-calculator/PersonalLoanCalculatorTool";
import PersonalLoanCalculatorFaqSection from "../components/tools/personal-loan-calculator/PersonalLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PersonalLoanCalculatorPage() {
  const tool = getToolById("personal-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Personal Loan Calculator – Payment, Interest & APR"
      seoDescription="Free personal loan calculator to find your monthly payment, total interest, payoff date and amortization schedule, plus the real APR with fees and insurance."
      footer={<PersonalLoanCalculatorFaqSection />}
      wide
    >
      <PersonalLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
