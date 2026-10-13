import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CashBackOrLowInterestCalculatorTool from "../components/tools/cash-back-or-low-interest-calculator/CashBackOrLowInterestCalculatorTool";
import CashBackOrLowInterestFaqSection from "../components/tools/cash-back-or-low-interest-calculator/CashBackOrLowInterestFaqSection";
import { getToolById } from "../utils/tools";

export default function CashBackOrLowInterestCalculatorPage() {
  const tool = getToolById("cash-back-or-low-interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Cash Back or Low Interest Calculator - Car Rebate vs. Low APR"
      seoDescription="Compare a car's cash back rebate with its low-interest financing offer, including state sales tax rules, to see which deal costs less. Free, no signup."
      footer={<CashBackOrLowInterestFaqSection />}
      wide
    >
      <CashBackOrLowInterestCalculatorTool />
    </ToolPageWrapper>
  );
}
