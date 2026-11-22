import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TaktTimeCalculatorTool from "../components/tools/takt-time-calculator/TaktTimeCalculatorTool";
import TaktTimeCalculatorFaqSection from "../components/tools/takt-time-calculator/TaktTimeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TaktTimeCalculatorPage() {
  const tool = getToolById("takt-time-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Takt Time Calculator - Free Online Tool"
      seoDescription="Free takt time calculator to find how fast each unit must be made. Calculate simple, batch or weekly takt time from working hours, breaks and demand."
      footer={<TaktTimeCalculatorFaqSection />}
      wide
    >
      <TaktTimeCalculatorTool />
    </ToolPageWrapper>
  );
}
