import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodySurfaceAreaCalculatorTool from "../components/tools/body-surface-area-calculator/BodySurfaceAreaCalculatorTool";
import BodySurfaceAreaCalculatorFaqSection from "../components/tools/body-surface-area-calculator/BodySurfaceAreaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodySurfaceAreaCalculatorPage() {
  const tool = getToolById("body-surface-area-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Body Surface Area Calculator - BSA in m², ft² & in²"
      seoDescription="Free body surface area calculator using Du Bois, Mosteller, Haycock, Boyd and 4 more formulas. Get BSA in m², ft² and in² from height, weight and gender."
      footer={<BodySurfaceAreaCalculatorFaqSection />}
      wide
    >
      <BodySurfaceAreaCalculatorTool />
    </ToolPageWrapper>
  );
}
