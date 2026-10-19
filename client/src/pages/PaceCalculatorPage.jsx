import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaceCalculatorTool from "../components/tools/pace-calculator/PaceCalculatorTool";
import PaceCalculatorFaqSection from "../components/tools/pace-calculator/PaceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaceCalculatorPage() {
  const tool = getToolById("pace-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Pace Calculator - Running Pace, Finish Time, Splits & Converter"
      seoDescription="Free pace calculator for running, walking and cycling: find pace, time or distance, race times and splits, multipoint section paces, a pace converter and a finish-time estimate."
      footer={<PaceCalculatorFaqSection />}
      wide
    >
      <PaceCalculatorTool />
    </ToolPageWrapper>
  );
}
