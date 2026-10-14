import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TakeHomePayCalculatorTool from "../components/tools/take-home-pay-calculator/TakeHomePayCalculatorTool";
import TakeHomePayCalculatorFaqSection from "../components/tools/take-home-pay-calculator/TakeHomePayCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TakeHomePayCalculatorPage() {
  const tool = getToolById("take-home-pay-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Take-Home-Paycheck Calculator 2026 - Net Pay After Taxes & W-4"
      seoDescription="Estimate your 2026 take-home paycheck after federal, state, and city income tax, Social Security, Medicare, and deductions, plus the numbers for Steps 3 and 4 of your W-4. Free, no signup."
      footer={<TakeHomePayCalculatorFaqSection />}
      wide
    >
      <TakeHomePayCalculatorTool />
    </ToolPageWrapper>
  );
}
