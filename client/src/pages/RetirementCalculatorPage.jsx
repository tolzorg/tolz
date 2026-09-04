import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RetirementCalculatorTool from "../components/tools/retirement-calculator/RetirementCalculatorTool";
import RetirementCalculatorFaqSection from "../components/tools/retirement-calculator/RetirementCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RetirementCalculatorPage() {
  const tool = getToolById("retirement-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Retirement Calculator – How Much You Need to Retire & Save"
      seoDescription="Estimate how much you need to retire, build a savings plan to get there, project a sustainable withdrawal amount, and see how long your savings can last. Free, no signup."
      footer={<RetirementCalculatorFaqSection />}
      wide
    >
      <RetirementCalculatorTool />
    </ToolPageWrapper>
  );
}
