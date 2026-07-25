import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RollingOffsetCalculatorTool from "../components/tools/rolling-offset-calculator/RollingOffsetCalculatorTool";
import RollingOffsetCalculatorFaqSection from "../components/tools/rolling-offset-calculator/RollingOffsetCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RollingOffsetCalculatorPage() {
  const tool = getToolById("rolling-offset-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Rolling Offset Calculator | True Offset & Travel"
      seoDescription="Calculate true offset, travel, and run for rolling pipe offsets. Free tool supports 22½°, 45°, 60°, 90° and custom fittings. No signup, no cost."
      footer={<RollingOffsetCalculatorFaqSection />}
    >
      <RollingOffsetCalculatorTool />
    </ToolPageWrapper>
  );
}
