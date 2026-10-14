import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LeaseCalculatorTool from "../components/tools/lease-calculator/LeaseCalculatorTool";
import LeaseCalculatorFaqSection from "../components/tools/lease-calculator/LeaseCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LeaseCalculatorPage() {
  const tool = getToolById("lease-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Lease Calculator - Monthly Lease Payment or Implied Interest Rate"
      seoDescription="Calculate the monthly payment of a lease from the asset value, residual value, term, and interest rate, or find the interest rate implied by a monthly payment. Free, no signup."
      footer={<LeaseCalculatorFaqSection />}
      wide
    >
      <LeaseCalculatorTool />
    </ToolPageWrapper>
  );
}
