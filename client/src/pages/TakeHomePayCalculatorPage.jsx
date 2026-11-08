import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TakeHomePayCalculatorTool from "../components/tools/take-home-pay-calculator/TakeHomePayCalculatorTool";
import TakeHomePayCalculatorFaqSection from "../components/tools/take-home-pay-calculator/TakeHomePayCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TakeHomePayCalculatorPage() {
  const tool = getToolById("take-home-pay-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Take Home Pay Calculator 2027 - Paycheck & W-4 Steps 3–4"
      seoDescription="Free take home pay calculator for 2026. Estimate your paycheck after federal, state and city tax, FICA and deductions, plus W-4 Step 3 and 4 numbers."
      footer={<TakeHomePayCalculatorFaqSection />}
      wide
    >
      <TakeHomePayCalculatorTool />
    </ToolPageWrapper>
  );
}
