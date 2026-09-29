import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SavingsCalculatorTool from "../components/tools/savings-calculator/SavingsCalculatorTool";
import SavingsCalculatorFaqSection from "../components/tools/savings-calculator/SavingsCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SavingsCalculatorPage() {
  const tool = getToolById("savings-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Savings Calculator -  Free Online Tool to Project Growth"
      seoDescription="See how your savings grow over time with deposits, monthly contributions, interest, and taxes factored in. Free savings calculator, no signup needed."
      footer={<SavingsCalculatorFaqSection />}
      wide
    >
      <SavingsCalculatorTool />
    </ToolPageWrapper>
  );
}
