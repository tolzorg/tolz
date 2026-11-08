import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BusinessLoanCalculatorTool from "../components/tools/business-loan-calculator/BusinessLoanCalculatorTool";
import BusinessLoanCalculatorFaqSection from "../components/tools/business-loan-calculator/BusinessLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BusinessLoanCalculatorPage() {
  const tool = getToolById("business-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Business Loan Calculator - Payment, Interest & Real APR"
      seoDescription="Free business loan calculator. See your payment, total interest and real APR with origination and other fees, for regular, interest-only or lump-sum loans."
      footer={<BusinessLoanCalculatorFaqSection />}
      wide
    >
      <BusinessLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
