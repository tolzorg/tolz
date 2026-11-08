import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FreightClassCalculatorTool from "../components/tools/freight-class-calculator/FreightClassCalculatorTool";
import FreightClassCalculatorFaqSection from "../components/tools/freight-class-calculator/FreightClassCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FreightClassCalculatorPage() {
  const tool = getToolById("freight-class-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Freight Class Calculator - NMFC Class from Density & Freight Cost"
      seoDescription="Free freight class calculator: find your shipment's NMFC freight class from the pallet's dimensions and weight, its density and the total freight cost."
      footer={<FreightClassCalculatorFaqSection />}
      wide
    >
      <FreightClassCalculatorTool />
    </ToolPageWrapper>
  );
}
