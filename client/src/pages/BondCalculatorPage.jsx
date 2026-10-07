import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BondCalculatorTool from "../components/tools/bond-calculator/BondCalculatorTool";
import BondCalculatorFaqSection from "../components/tools/bond-calculator/BondCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BondCalculatorPage() {
  const tool = getToolById("bond-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Bond Calculator - Price, Yield, Coupon & Accrued Interest"
      seoDescription="Solve for a bond's price, face value, yield, time to maturity, or coupon, and price bonds between coupon dates with dirty price, clean price, and accrued interest under 30/360, Actual/360, Actual/365, or Actual/Actual. Free, no signup."
      footer={<BondCalculatorFaqSection />}
      wide
    >
      <BondCalculatorTool />
    </ToolPageWrapper>
  );
}
