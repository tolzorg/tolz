import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaybackPeriodCalculatorTool from "../components/tools/payback-period-calculator/PaybackPeriodCalculatorTool";
import PaybackPeriodCalculatorFaqSection from "../components/tools/payback-period-calculator/PaybackPeriodCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaybackPeriodCalculatorPage() {
  const tool = getToolById("payback-period-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Payback Period Calculator - Discounted Payback & IRR"
      seoDescription="Calculate the payback period, discounted payback period and cash flow return rate (IRR) of an investment with a growing or irregular cash flow, plus a year-by-year schedule. Free, no signup."
      footer={<PaybackPeriodCalculatorFaqSection />}
      wide
    >
      <PaybackPeriodCalculatorTool />
    </ToolPageWrapper>
  );
}
