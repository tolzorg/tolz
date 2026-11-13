import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SleepCalculatorTool from "../components/tools/sleep-calculator/SleepCalculatorTool";
import SleepCalculatorFaqSection from "../components/tools/sleep-calculator/SleepCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SleepCalculatorPage() {
  const tool = getToolById("sleep-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sleep Calculator: Best Bedtime & Wake-Up Time"
      seoDescription="Free sleep calculator based on 90-minute cycles. Find your ideal bedtime or wake-up time in seconds, plus science-backed tips for falling and staying asleep."
      footer={<SleepCalculatorFaqSection />}
      wide
    >
      <SleepCalculatorTool />
    </ToolPageWrapper>
  );
}
