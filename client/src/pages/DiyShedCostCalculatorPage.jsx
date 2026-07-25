import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DiyShedCostCalculatorTool from "../components/tools/diy-shed-cost-calculator/DiyShedCostCalculatorTool";
import DiyShedCostCalculatorFaqSection from "../components/tools/diy-shed-cost-calculator/DiyShedCostCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DiyShedCostCalculatorPage() {
  const tool = getToolById("diy-shed-cost-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="DIY Shed Cost Calculator | Free Material & Build Cost"
      seoDescription="Estimate your shed's floor, wall, and roof area and total material cost free online. Supports gable, flat, and slanted roofs. No signup needed."
      footer={<DiyShedCostCalculatorFaqSection />}
    >
      <DiyShedCostCalculatorTool />
    </ToolPageWrapper>
  );
}
