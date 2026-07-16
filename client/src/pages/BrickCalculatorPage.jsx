import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BrickCalculatorTool from "../components/tools/brick-calculator/BrickCalculatorTool";
import BrickCalculatorFaqSection from "../components/tools/brick-calculator/BrickCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BrickCalculatorPage() {
  const tool = getToolById("brick-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Brick Calculator | Free Online Wall & Mortar Estimator"
      seoDescription="Calculate bricks, cement, sand, and water needed for single or double walls instantly. Free brick calculator with cost estimate, no signup required."
      footer={<BrickCalculatorFaqSection />}
    >
      <BrickCalculatorTool />
    </ToolPageWrapper>
  );
}
