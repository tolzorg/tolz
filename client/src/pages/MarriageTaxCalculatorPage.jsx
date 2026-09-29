import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MarriageTaxCalculatorTool from "../components/tools/marriage-tax-calculator/MarriageTaxCalculatorTool";
import MarriageTaxCalculatorFaqSection from "../components/tools/marriage-tax-calculator/MarriageTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MarriageTaxCalculatorPage() {
  const tool = getToolById("marriage-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Marriage Tax Calculator - Free Joint vs Single Filing"
      seoDescription="Estimate how marriage affects your taxes. Compare joint vs single filing using 2025 IRS brackets - free, instant, no signup required."
      footer={<MarriageTaxCalculatorFaqSection />}
      wide
    >
      <MarriageTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
