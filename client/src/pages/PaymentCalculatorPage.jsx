import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaymentCalculatorTool from "../components/tools/payment-calculator/PaymentCalculatorTool";
import PaymentCalculatorFaqSection from "../components/tools/payment-calculator/PaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaymentCalculatorPage() {
  const tool = getToolById("payment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Payment Calculator – Monthly Payment or Loan Payoff Time"
      seoDescription="Calculate the monthly payment for a fixed-term loan, or the time it takes to pay off a loan with a fixed monthly payment. View a full amortization schedule. Free, no signup."
      footer={<PaymentCalculatorFaqSection />}
      wide
    >
      <PaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
