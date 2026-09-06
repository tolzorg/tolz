import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RetirementCalculatorTool from "../components/tools/retirement-calculator/RetirementCalculatorTool";
import RetirementCalculatorFaqSection from "../components/tools/retirement-calculator/RetirementCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RetirementCalculatorPage() {
  const tool = getToolById("retirement-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Retirement Calculator: Plan Your Savings Goal"
      seoDescription="Use our free retirement calculator to estimate how much you need to retire, build a savings plan, and see how long your money will last."
      footer={<RetirementCalculatorFaqSection />}
      wide
    >
      <RetirementCalculatorTool />
    </ToolPageWrapper>
  );
}
