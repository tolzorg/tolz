import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BudgetCalculatorTool from "../components/tools/budget-calculator/BudgetCalculatorTool";
import BudgetCalculatorFaqSection from "../components/tools/budget-calculator/BudgetCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BudgetCalculatorPage() {
  const tool = getToolById("budget-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Budget Calculator - Monthly & Yearly Budget Planner"
      seoDescription="Free budget calculator for monthly or yearly planning. See after-tax income, surplus or deficit, debt-to-income ratio, and where your money goes by category."
      footer={<BudgetCalculatorFaqSection />}
      wide
    >
      <BudgetCalculatorTool />
    </ToolPageWrapper>
  );
}
