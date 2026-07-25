import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GlassWeightCalculatorTool from "../components/tools/glass-weight-calculator/GlassWeightCalculatorTool";
import GlassWeightCalculatorFaqSection from "../components/tools/glass-weight-calculator/GlassWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GlassWeightCalculatorPage() {
  const tool = getToolById("glass-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Glass Weight Calculator | Free Online Tool"
      seoDescription="Calculate glass weight instantly by type, shape, and dimensions. 19 glass types, 8 shapes, all units, free and accurate."
      footer={<GlassWeightCalculatorFaqSection />}
    >
      <GlassWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
