import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LeaseCalculatorTool from "../components/tools/lease-calculator/LeaseCalculatorTool";
import LeaseCalculatorFaqSection from "../components/tools/lease-calculator/LeaseCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LeaseCalculatorPage() {
  const tool = getToolById("lease-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Lease Calculator: Monthly Payment & Interest Rate"
      seoDescription="Free lease calculator: get your monthly lease payment or find the interest rate hidden in a quote. Covers residual value, money factor and lease vs buy."
      footer={<LeaseCalculatorFaqSection />}
      wide
    >
      <LeaseCalculatorTool />
    </ToolPageWrapper>
  );
}
