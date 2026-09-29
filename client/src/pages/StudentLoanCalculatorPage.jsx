import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import StudentLoanCalculatorTool from "../components/tools/student-loan-calculator/StudentLoanCalculatorTool";
import StudentLoanCalculatorFaqSection from "../components/tools/student-loan-calculator/StudentLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function StudentLoanCalculatorPage() {
  const tool = getToolById("student-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Student Loan Calculator - Payment, Payoff & Projection"
      seoDescription="Solve for your student loan payment, term, rate, or balance, see how extra payments shorten payoff and save interest, and project what you'll owe after graduation. Free, no signup."
      footer={<StudentLoanCalculatorFaqSection />}
      wide
    >
      <StudentLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
