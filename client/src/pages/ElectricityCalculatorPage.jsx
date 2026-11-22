import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ElectricityCalculatorTool from "../components/tools/electricity-calculator/ElectricityCalculatorTool";
import ElectricityCalculatorFaqSection from "../components/tools/electricity-calculator/ElectricityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ElectricityCalculatorPage() {
  const tool = getToolById("electricity-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Electricity Calculator - Free kWh & Cost Estimator"
      seoDescription="Use this free electricity calculator to estimate any appliance’s kWh usage and cost per day, week, month and year from watts, hours and your price per unit."
      footer={<ElectricityCalculatorFaqSection />}
      wide
    >
      <ElectricityCalculatorTool />
    </ToolPageWrapper>
  );
}
