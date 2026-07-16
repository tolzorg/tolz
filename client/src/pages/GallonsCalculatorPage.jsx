import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GallonsCalculatorTool from "../components/tools/gallons-calculator/GallonsCalculatorTool";
import GallonsCalculatorFaqSection from "../components/tools/gallons-calculator/GallonsCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GallonsCalculatorPage() {
  const tool = getToolById("gallons-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Gallons per Sq Ft Calculator | Free Paint & Coverage Tool"
      seoDescription="Calculate gallons per square foot for paint, primer, epoxy, and sealers. Free coverage calculator with no signup, supports gallons, liters, and more."
      footer={<GallonsCalculatorFaqSection />}
    >
      <GallonsCalculatorTool />
    </ToolPageWrapper>
  );
}
