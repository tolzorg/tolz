import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FreightClassCalculatorTool from "../components/tools/freight-class-calculator/FreightClassCalculatorTool";
import FreightClassCalculatorFaqSection from "../components/tools/freight-class-calculator/FreightClassCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FreightClassCalculatorPage() {
  const tool = getToolById("freight-class-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Freight Class Calculator – Free NMFC Class & Cost Tool"
      seoDescription="Use our free freight class calculator to find your NMFC class from pallet dimensions and weight, check density in lb/ft³, and estimate total freight cost."
      footer={<FreightClassCalculatorFaqSection />}
      wide
    >
      <FreightClassCalculatorTool />
    </ToolPageWrapper>
  );
}
