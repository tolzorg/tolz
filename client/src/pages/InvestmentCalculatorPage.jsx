import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InvestmentCalculatorTool from "../components/tools/investment-calculator/InvestmentCalculatorTool";
import InvestmentCalculatorFaqSection from "../components/tools/investment-calculator/InvestmentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InvestmentCalculatorPage() {
  const tool = getToolById("investment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Investment Calculator - Free Online Growth & Goal Planner"
      seoDescription="Calculate how your investments will grow over time, or find the contribution, rate, or time needed to hit your goal. Free, fast, and no signup required."
      footer={<InvestmentCalculatorFaqSection />}
      wide
    >
      <InvestmentCalculatorTool />
    </ToolPageWrapper>
  );
}
