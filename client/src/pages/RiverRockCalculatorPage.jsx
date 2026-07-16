import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RiverRockCalculatorTool from "../components/tools/river-rock-calculator/RiverRockCalculatorTool";
import RiverRockCalculatorFaqSection from "../components/tools/river-rock-calculator/RiverRockCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RiverRockCalculatorPage() {
  const tool = getToolById("river-rock-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="River Rock Calculator | Free Volume, Weight & Cost Tool"
      seoDescription="Calculate exactly how much river rock you need. Enter length, width & depth for instant volume, weight, and cost estimates. Free, no signup."
      footer={<RiverRockCalculatorFaqSection />}
    >
      <RiverRockCalculatorTool />
    </ToolPageWrapper>
  );
}
