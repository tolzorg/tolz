import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InflationCalculatorTool from "../components/tools/inflation-calculator/InflationCalculatorTool";
import InflationCalculatorFaqSection from "../components/tools/inflation-calculator/InflationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InflationCalculatorPage() {
  const tool = getToolById("inflation-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Inflation Calculator – U.S. CPI Data 1913–Present"
      seoDescription="Find the equivalent value of a dollar amount between any two points in time using real U.S. CPI data, or project a flat inflation rate forward or backward. Free, no signup."
      footer={<InflationCalculatorFaqSection />}
      wide
    >
      <InflationCalculatorTool />
    </ToolPageWrapper>
  );
}
