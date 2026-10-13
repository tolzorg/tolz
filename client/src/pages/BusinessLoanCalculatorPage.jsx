import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BusinessLoanCalculatorTool from "../components/tools/business-loan-calculator/BusinessLoanCalculatorTool";
import BusinessLoanCalculatorFaqSection from "../components/tools/business-loan-calculator/BusinessLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BusinessLoanCalculatorPage() {
  const tool = getToolById("business-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Business Loan Calculator - Payment, Fees & Real APR"
      seoDescription="Calculate a business loan's payment, total interest, and real rate (APR) including origination, documentation, and other fees. Supports interest-only and lump-sum repayment. Free, no signup."
      footer={<BusinessLoanCalculatorFaqSection />}
      wide
    >
      <BusinessLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
