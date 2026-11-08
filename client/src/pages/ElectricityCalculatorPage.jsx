import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ElectricityCalculatorTool from "../components/tools/electricity-calculator/ElectricityCalculatorTool";
import ElectricityCalculatorFaqSection from "../components/tools/electricity-calculator/ElectricityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ElectricityCalculatorPage() {
  const tool = getToolById("electricity-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Electricity Calculator - Appliance kWh & Electricity Cost"
      seoDescription="Free electricity calculator: estimate the electricity usage (kWh) and cost of an appliance per day, week, month and year from its power, usage and your price per kWh."
      footer={<ElectricityCalculatorFaqSection />}
      wide
    >
      <ElectricityCalculatorTool />
    </ToolPageWrapper>
  );
}
