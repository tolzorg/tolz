import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TargetHeartRateCalculatorTool from "../components/tools/target-heart-rate-calculator/TargetHeartRateCalculatorTool";
import TargetHeartRateCalculatorFaqSection from "../components/tools/target-heart-rate-calculator/TargetHeartRateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TargetHeartRateCalculatorPage() {
  const tool = getToolById("target-heart-rate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Target Heart Rate Calculator - Free HR Zones Online"
      seoDescription="Free target heart rate calculator. Find your training zones from age or max heart rate using Karvonen, Borg RPE or CR10 and three formulas. No signup."
      footer={<TargetHeartRateCalculatorFaqSection />}
      wide
    >
      <TargetHeartRateCalculatorTool />
    </ToolPageWrapper>
  );
}
