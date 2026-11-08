import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TaktTimeCalculatorTool from "../components/tools/takt-time-calculator/TaktTimeCalculatorTool";
import TaktTimeCalculatorFaqSection from "../components/tools/takt-time-calculator/TaktTimeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TaktTimeCalculatorPage() {
  const tool = getToolById("takt-time-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Takt Time Calculator - Simple, Batch & Weekly Takt Time"
      seoDescription="Free takt time calculator: find how fast each product must be made to meet demand, with simple, batch production and weekly takt time from working hours and breaks."
      footer={<TaktTimeCalculatorFaqSection />}
      wide
    >
      <TaktTimeCalculatorTool />
    </ToolPageWrapper>
  );
}
