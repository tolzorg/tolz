import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PaybackPeriodCalculatorTool from "../components/tools/payback-period-calculator/PaybackPeriodCalculatorTool";
import PaybackPeriodCalculatorFaqSection from "../components/tools/payback-period-calculator/PaybackPeriodCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PaybackPeriodCalculatorPage() {
  const tool = getToolById("payback-period-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Payback Period Calculator – Free Discounted Payback & IRR"
      seoDescription="Free payback period calculator for uneven or growing cash flows. Get simple and discounted payback, IRR, and a year-by-year schedule in one place."
      footer={<PaybackPeriodCalculatorFaqSection />}
      wide
    >
      <PaybackPeriodCalculatorTool />
    </ToolPageWrapper>
  );
}
