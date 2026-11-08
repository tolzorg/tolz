import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PrintingCostCalculatorTool from "../components/tools/3d-printing-cost-calculator/PrintingCostCalculatorTool";
import PrintingCostCalculatorFaqSection from "../components/tools/3d-printing-cost-calculator/PrintingCostCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PrintingCostCalculatorPage() {
  const tool = getToolById("3d-printing-cost-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="3D Printing Cost Calculator - Filament, Labor & Final Price"
      seoDescription="Free 3D printing cost calculator: filament weight and material cost (ABS, PLA, PETG and more), labor cost from printing time, and the final price with your markup."
      footer={<PrintingCostCalculatorFaqSection />}
      wide
    >
      <PrintingCostCalculatorTool />
    </ToolPageWrapper>
  );
}
