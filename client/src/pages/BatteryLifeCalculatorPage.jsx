import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BatteryLifeCalculatorTool from "../components/tools/battery-life-calculator/BatteryLifeCalculatorTool";
import BatteryLifeCalculatorFaqSection from "../components/tools/battery-life-calculator/BatteryLifeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BatteryLifeCalculatorPage() {
  const tool = getToolById("battery-life-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Battery Life Calculator - Estimate Runtime Free Online"
      seoDescription="Free battery life calculator to estimate runtime from capacity, discharge safety, and current draw or watts, with optional awake and sleep modes."
      footer={<BatteryLifeCalculatorFaqSection />}
      wide
    >
      <BatteryLifeCalculatorTool />
    </ToolPageWrapper>
  );
}
