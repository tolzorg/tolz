import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TargetHeartRateCalculatorTool from "../components/tools/target-heart-rate-calculator/TargetHeartRateCalculatorTool";
import TargetHeartRateCalculatorFaqSection from "../components/tools/target-heart-rate-calculator/TargetHeartRateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TargetHeartRateCalculatorPage() {
  const tool = getToolById("target-heart-rate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Target Heart Rate Calculator - Heart Rate Zones (Karvonen & Borg)"
      seoDescription="Free target heart rate calculator: find your heart rate training zones from your age or tested maximum heart rate, with the Karvonen method (heart rate reserve), Borg RPE or CR10 scales and three max heart rate formulas."
      footer={<TargetHeartRateCalculatorFaqSection />}
      wide
    >
      <TargetHeartRateCalculatorTool />
    </ToolPageWrapper>
  );
}
