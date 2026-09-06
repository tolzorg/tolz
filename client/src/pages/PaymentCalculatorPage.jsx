import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaymentCalculatorTool from "../components/tools/payment-calculator/PaymentCalculatorTool";
import PaymentCalculatorFaqSection from "../components/tools/payment-calculator/PaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaymentCalculatorPage() {
  const tool = getToolById("payment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Loan Payment Calculator | Monthly & Amortization"
      seoDescription="Calculate your monthly loan payment instantly with our free loan payment calculator. View a full amortization schedule and payoff timeline. No signup needed."
      footer={<PaymentCalculatorFaqSection />}
      wide
    >
      <PaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
