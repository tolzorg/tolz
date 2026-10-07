import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MutualFundCalculatorTool from "../components/tools/mutual-fund-calculator/MutualFundCalculatorTool";
import MutualFundCalculatorFaqSection from "../components/tools/mutual-fund-calculator/MutualFundCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MutualFundCalculatorPage() {
  const tool = getToolById("mutual-fund-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mutual Fund Calculator - Ending Value, Fees & Net IRR"
      seoDescription="Estimate a mutual fund's ending value and net return after sales charges, deferred charges, and operating expenses, plus the net IRR after all fees. Free, no signup."
      footer={<MutualFundCalculatorFaqSection />}
      wide
    >
      <MutualFundCalculatorTool />
    </ToolPageWrapper>
  );
}
