import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AutoLeaseCalculatorTool from "../components/tools/auto-lease-calculator/AutoLeaseCalculatorTool";
import AutoLeaseCalculatorFaqSection from "../components/tools/auto-lease-calculator/AutoLeaseCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AutoLeaseCalculatorPage() {
  const tool = getToolById("auto-lease-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Auto Lease Calculator - Monthly Car Lease Payment"
      seoDescription="Calculate a monthly car lease payment from the price, money factor, residual value, and sales tax, or the price a payment can afford, and compare leasing with buying. Free, no signup."
      footer={<AutoLeaseCalculatorFaqSection />}
      wide
    >
      <AutoLeaseCalculatorTool />
    </ToolPageWrapper>
  );
}
