import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SalesTaxCalculatorTool from "../components/tools/sales-tax-calculator/SalesTaxCalculatorTool";
import SalesTaxCalculatorFaqSection from "../components/tools/sales-tax-calculator/SalesTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SalesTaxCalculatorPage() {
  const tool = getToolById("sales-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sales Tax Calculator: Free Before & After Tax Tool"
      seoDescription="Free sales tax calculator. Find the price before tax, the tax rate, or the total after tax by entering any two. Works backward too. No signup needed."
      footer={<SalesTaxCalculatorFaqSection />}
      wide
    >
      <SalesTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
