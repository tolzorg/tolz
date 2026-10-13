import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MutualFundCalculatorTool from "../components/tools/mutual-fund-calculator/MutualFundCalculatorTool";
import MutualFundCalculatorFaqSection from "../components/tools/mutual-fund-calculator/MutualFundCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MutualFundCalculatorPage() {
  const tool = getToolById("mutual-fund-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mutual Fund Calculator – Net Return, Fees & IRR"
      seoDescription="Free mutual fund calculator to estimate ending value, net return, and net IRR after loads, deferred charges, and expenses. No signup needed."
      footer={<MutualFundCalculatorFaqSection />}
      wide
    >
      <MutualFundCalculatorTool />
    </ToolPageWrapper>
  );
}
