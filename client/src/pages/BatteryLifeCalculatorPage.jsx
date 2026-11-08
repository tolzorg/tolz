import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BatteryLifeCalculatorTool from "../components/tools/battery-life-calculator/BatteryLifeCalculatorTool";
import BatteryLifeCalculatorFaqSection from "../components/tools/battery-life-calculator/BatteryLifeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BatteryLifeCalculatorPage() {
  const tool = getToolById("battery-life-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Battery Life Calculator - Runtime from mAh, Current Draw or Watts"
      seoDescription="Free battery life calculator: estimate how long a battery lasts from its capacity (mAh), discharge safety and the device current draw or wattage, with optional sleep mode."
      footer={<BatteryLifeCalculatorFaqSection />}
      wide
    >
      <BatteryLifeCalculatorTool />
    </ToolPageWrapper>
  );
}
