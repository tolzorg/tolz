import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodySurfaceAreaCalculatorTool from "../components/tools/body-surface-area-calculator/BodySurfaceAreaCalculatorTool";
import BodySurfaceAreaCalculatorFaqSection from "../components/tools/body-surface-area-calculator/BodySurfaceAreaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodySurfaceAreaCalculatorPage() {
  const tool = getToolById("body-surface-area-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Body Surface Area Calculator - BSA by 8 Formulas"
      seoDescription="Free body surface area (BSA) calculator: Du Bois, Mosteller, Haycock, Gehan & George, Boyd, Fujimoto, Takahira and Schlich formulas in m², ft² and in², from your weight, height and gender, plus your BMI."
      footer={<BodySurfaceAreaCalculatorFaqSection />}
      wide
    >
      <BodySurfaceAreaCalculatorTool />
    </ToolPageWrapper>
  );
}
