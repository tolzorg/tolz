import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaceCalculatorTool from "../components/tools/pace-calculator/PaceCalculatorTool";
import PaceCalculatorFaqSection from "../components/tools/pace-calculator/PaceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaceCalculatorPage() {
  const tool = getToolById("pace-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Pace Calculator: Running, Walking & Cycling Pace"
      seoDescription="Use our free pace calculator to find running, walking or cycling pace, time or distance. Get race splits, pace conversion and finish-time estimates."
      footer={<PaceCalculatorFaqSection />}
      wide
    >
      <PaceCalculatorTool />
    </ToolPageWrapper>
  );
}
