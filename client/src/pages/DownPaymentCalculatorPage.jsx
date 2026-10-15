import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DownPaymentCalculatorTool from "../components/tools/down-payment-calculator/DownPaymentCalculatorTool";
import DownPaymentCalculatorFaqSection from "../components/tools/down-payment-calculator/DownPaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DownPaymentCalculatorPage() {
  const tool = getToolById("down-payment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Down Payment Calculator - Home Price, Cash Needed & Down %"
      seoDescription="Find the home price your upfront cash can buy, the cash needed for a home, or the down payment percentage you can afford, with closing costs, loan amount, monthly payment and 3.5% to 20% comparisons. Free, no signup."
      footer={<DownPaymentCalculatorFaqSection />}
      wide
    >
      <DownPaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
