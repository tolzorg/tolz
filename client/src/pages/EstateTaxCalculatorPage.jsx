import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import EstateTaxCalculatorTool from "../components/tools/estate-tax-calculator/EstateTaxCalculatorTool";
import EstateTaxCalculatorFaqSection from "../components/tools/estate-tax-calculator/EstateTaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function EstateTaxCalculatorPage() {
  const tool = getToolById("estate-tax-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Estate Tax Calculator - Free 2026 Federal Estimate"
      seoDescription="Free estate tax calculator for 2026. Enter assets, debts, and lifetime gifts to estimate federal estate tax using the $15M exemption and 40% rate."
      footer={<EstateTaxCalculatorFaqSection />}
      wide
    >
      <EstateTaxCalculatorTool />
    </ToolPageWrapper>
  );
}
