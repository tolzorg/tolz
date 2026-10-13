import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BondCalculatorTool from "../components/tools/bond-calculator/BondCalculatorTool";
import BondCalculatorFaqSection from "../components/tools/bond-calculator/BondCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BondCalculatorPage() {
  const tool = getToolById("bond-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Bond Calculator – Price, Yield, Coupon & Accrued Interest"
      seoDescription="Use this free bond calculator to solve for bond price, yield, coupon, face value or maturity, and find clean price, dirty price and accrued interest."
      footer={<BondCalculatorFaqSection />}
      wide
    >
      <BondCalculatorTool />
    </ToolPageWrapper>
  );
}
