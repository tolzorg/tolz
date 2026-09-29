import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InflationCalculatorTool from "../components/tools/inflation-calculator/InflationCalculatorTool";
import InflationCalculatorFaqSection from "../components/tools/inflation-calculator/InflationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InflationCalculatorPage() {
  const tool = getToolById("inflation-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Inflation Calculator - See What Your Money Is Worth"
      seoDescription="Free inflation calculator using real U.S. CPI data. Check dollar value by year, project future inflation, and see what's driving today's inflation rate."
      footer={<InflationCalculatorFaqSection />}
      wide
    >
      <InflationCalculatorTool />
    </ToolPageWrapper>
  );
}
