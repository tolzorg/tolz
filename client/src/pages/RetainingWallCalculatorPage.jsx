import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RetainingWallCalculatorTool from "../components/tools/retaining-wall-calculator/RetainingWallCalculatorTool";
import RetainingWallCalculatorFaqSection from "../components/tools/retaining-wall-calculator/RetainingWallCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RetainingWallCalculatorPage() {
  const tool = getToolById("retaining-wall-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Retaining Wall Calculator | Free Cost & Material Estimator"
      seoDescription="Estimate retaining wall materials and costs free with Tolz's calculator. Covers concrete, block, segmental, and stone walls, plus footing and drainage."
      footer={<RetainingWallCalculatorFaqSection />}
    >
      <RetainingWallCalculatorTool />
    </ToolPageWrapper>
  );
}
