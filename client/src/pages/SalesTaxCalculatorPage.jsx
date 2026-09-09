import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SalesTaxCalculatorTool from "../components/tools/sales-tax-calculator/SalesTaxCalculatorTool";
import SalesTaxCalculatorFaqSection from "../components/tools/sales-tax-calculator/SalesTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SalesTaxCalculatorPage() {
  const tool = getToolById("sales-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sales Tax Calculator - Free Before/After Tax Price & Rate Finder"
      seoDescription="Solve for any one of before-tax price, sales tax rate, or after-tax price, given the other two. Free and instant."
      footer={<SalesTaxCalculatorFaqSection />}
      wide
    >
      <SalesTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
