import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SavingsCalculatorTool from "../components/tools/savings-calculator/SavingsCalculatorTool";
import SavingsCalculatorFaqSection from "../components/tools/savings-calculator/SavingsCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SavingsCalculatorPage() {
  const tool = getToolById("savings-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Savings Calculator - Free Online Savings Growth Projector"
      seoDescription="Project how your savings will grow with an initial deposit plus growing annual and monthly contributions. See your end balance, interest earned, and a full accumulation schedule. Free, fast, and no signup required."
      footer={<SavingsCalculatorFaqSection />}
      wide
    >
      <SavingsCalculatorTool />
    </ToolPageWrapper>
  );
}
