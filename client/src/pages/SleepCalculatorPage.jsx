import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SleepCalculatorTool from "../components/tools/sleep-calculator/SleepCalculatorTool";
import SleepCalculatorFaqSection from "../components/tools/sleep-calculator/SleepCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SleepCalculatorPage() {
  const tool = getToolById("sleep-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sleep Calculator | Find Your Best Bedtime & Wake Time"
      seoDescription="Calculate the best bedtime or wake-up time based on sleep cycles. Free, fast, and no signup needed, just accurate, science-based results."
      footer={<SleepCalculatorFaqSection />}
    >
      <SleepCalculatorTool />
    </ToolPageWrapper>
  );
}
