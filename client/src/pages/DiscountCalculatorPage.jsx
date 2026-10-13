import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DiscountCalculatorTool from "../components/tools/discount-calculator/DiscountCalculatorTool";
import DiscountCalculatorFaqSection from "../components/tools/discount-calculator/DiscountCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DiscountCalculatorPage() {
  const tool = getToolById("discount-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Discount Calculator - Sale Price, Amount Saved & Percent Off"
      seoDescription="Find the price after discount, the amount you save, the original price, or the discount from any two values. Supports percent off and fixed amount off. Free, no signup."
      footer={<DiscountCalculatorFaqSection />}
      wide
    >
      <DiscountCalculatorTool />
    </ToolPageWrapper>
  );
}
