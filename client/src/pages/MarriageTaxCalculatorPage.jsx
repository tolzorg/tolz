import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MarriageTaxCalculatorTool from "../components/tools/marriage-tax-calculator/MarriageTaxCalculatorTool";
import MarriageTaxCalculatorFaqSection from "../components/tools/marriage-tax-calculator/MarriageTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MarriageTaxCalculatorPage() {
  const tool = getToolById("marriage-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Marriage Tax Calculator - Marriage Penalty or Bonus Estimator"
      seoDescription="Estimate the financial impact of filing a joint tax return as a married couple vs. each spouse filing on their own, based on U.S. federal income tax brackets. Free, fast, and no signup required."
      footer={<MarriageTaxCalculatorFaqSection />}
      wide
    >
      <MarriageTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
