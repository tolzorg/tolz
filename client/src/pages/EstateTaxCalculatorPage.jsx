import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import EstateTaxCalculatorTool from "../components/tools/estate-tax-calculator/EstateTaxCalculatorTool";
import EstateTaxCalculatorFaqSection from "../components/tools/estate-tax-calculator/EstateTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function EstateTaxCalculatorPage() {
  const tool = getToolById("estate-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Estate Tax Calculator - Estimate Federal Estate Tax"
      seoDescription="Estimate federal estate tax due based on your assets, liabilities, and lifetime gifts, using the current year's federal lifetime exemption and tax rate. Free, fast, and no signup required."
      footer={<EstateTaxCalculatorFaqSection />}
      wide
    >
      <EstateTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
