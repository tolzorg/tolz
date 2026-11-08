import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DiscountCalculatorTool from "../components/tools/discount-calculator/DiscountCalculatorTool";
import DiscountCalculatorFaqSection from "../components/tools/discount-calculator/DiscountCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DiscountCalculatorPage() {
  const tool = getToolById("discount-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Discount Calculator - Find Sale Price & Savings | Tolz"
      seoDescription="Free discount calculator to find the sale price, amount saved, original price, or discount percent for percent-off and fixed-amount deals. Try it now."
      footer={<DiscountCalculatorFaqSection />}
      wide
    >
      <DiscountCalculatorTool />
    </ToolPageWrapper>
  );
}
