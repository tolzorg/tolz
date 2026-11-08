import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DownPaymentCalculatorTool from "../components/tools/down-payment-calculator/DownPaymentCalculatorTool";
import DownPaymentCalculatorFaqSection from "../components/tools/down-payment-calculator/DownPaymentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DownPaymentCalculatorPage() {
  const tool = getToolById("down-payment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Down Payment Calculator - Free Home Price & Cash Needed"
      seoDescription="Use our free down payment calculator to find the home price you can afford, cash needed, or down payment percentage, with closing costs and monthly payment."
      footer={<DownPaymentCalculatorFaqSection />}
      wide
    >
      <DownPaymentCalculatorTool />
    </ToolPageWrapper>
  );
}
