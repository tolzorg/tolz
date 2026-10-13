import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RepaymentCalculatorTool from "../components/tools/repayment-calculator/RepaymentCalculatorTool";
import RepaymentCalculatorFaqSection from "../components/tools/repayment-calculator/RepaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RepaymentCalculatorPage() {
  const tool = getToolById("repayment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Repayment Calculator: Loan Payment & Payoff Time (Free)"
      seoDescription="Free repayment calculator for loans, mortgages, and credit cards. Find your monthly payment or payoff date with custom compounding and payment schedules."
      footer={<RepaymentCalculatorFaqSection />}
      wide
    >
      <RepaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
