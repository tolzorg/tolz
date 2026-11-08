import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AutoLeaseCalculatorTool from "../components/tools/auto-lease-calculator/AutoLeaseCalculatorTool";
import AutoLeaseCalculatorFaqSection from "../components/tools/auto-lease-calculator/AutoLeaseCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AutoLeaseCalculatorPage() {
  const tool = getToolById("auto-lease-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Auto Lease Calculator – Free Monthly Car Lease Payment Tool"
      seoDescription="Free auto lease calculator: estimate your monthly car lease payment from price, money factor, residual and tax, or work backward from a payment you want."
      footer={<AutoLeaseCalculatorFaqSection />}
      wide
    >
      <AutoLeaseCalculatorTool />
    </ToolPageWrapper>
  );
}
