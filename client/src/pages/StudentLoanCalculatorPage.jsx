import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import StudentLoanCalculatorTool from "../components/tools/student-loan-calculator/StudentLoanCalculatorTool";
import StudentLoanCalculatorFaqSection from "../components/tools/student-loan-calculator/StudentLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function StudentLoanCalculatorPage() {
  const tool = getToolById("student-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Student Loan Calculator: Payment, Payoff & Interest"
      seoDescription="Free student loan calculator. Find your payment, payoff date and interest, test extra payments, and check federal loan limits and rates for 2026-27."
      footer={<StudentLoanCalculatorFaqSection />}
      wide
    >
      <StudentLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
