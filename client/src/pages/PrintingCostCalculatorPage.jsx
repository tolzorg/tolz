import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PrintingCostCalculatorTool from "../components/tools/3d-printing-cost-calculator/PrintingCostCalculatorTool";
import PrintingCostCalculatorFaqSection from "../components/tools/3d-printing-cost-calculator/PrintingCostCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PrintingCostCalculatorPage() {
  const tool = getToolById("3d-printing-cost-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="3D Printing Cost Calculator – Free Print Price Estimator"
      seoDescription="Free 3D printing cost calculator. Estimate filament cost, labor, and final price with markup for PLA, ABS, PETG and more. No signup needed."
      footer={<PrintingCostCalculatorFaqSection />}
      wide
    >
      <PrintingCostCalculatorTool />
    </ToolPageWrapper>
  );
}
