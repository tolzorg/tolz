import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CubicYardCalculatorTool from "../components/tools/cubic-yard-calculator/CubicYardCalculatorTool";
import CubicYardCalculatorFaqSection from "../components/tools/cubic-yard-calculator/CubicYardCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CubicYardCalculatorPage() {
  const tool = getToolById("cubic-yard-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Cubic Yard Calculator | Free Volume & Weight Tool"
      seoDescription="Calculate cubic yards for concrete, gravel, sand, soil and mulch instantly. Free online tool with weight estimates, no signup required."
      footer={<CubicYardCalculatorFaqSection />}
    >
      <CubicYardCalculatorTool />
    </ToolPageWrapper>
  );
}
