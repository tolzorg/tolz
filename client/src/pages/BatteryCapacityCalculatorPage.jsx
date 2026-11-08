import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BatteryCapacityCalculatorTool from "../components/tools/battery-capacity-calculator/BatteryCapacityCalculatorTool";
import BatteryCapacityCalculatorFaqSection from "../components/tools/battery-capacity-calculator/BatteryCapacityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BatteryCapacityCalculatorPage() {
  const tool = getToolById("battery-capacity-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Battery Capacity Calculator - Ah to Wh, C-Rate & Runtime"
      seoDescription="Free battery capacity calculator: convert amp-hours to watt-hours from the voltage, and find the C-rate, discharge current and runtime to full capacity."
      footer={<BatteryCapacityCalculatorFaqSection />}
      wide
    >
      <BatteryCapacityCalculatorTool />
    </ToolPageWrapper>
  );
}
