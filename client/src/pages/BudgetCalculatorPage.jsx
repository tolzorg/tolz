import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BudgetCalculatorTool from "../components/tools/budget-calculator/BudgetCalculatorTool";
import BudgetCalculatorFaqSection from "../components/tools/budget-calculator/BudgetCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BudgetCalculatorPage() {
  const tool = getToolById("budget-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Budget Calculator - Monthly & Annual Budget, DTI & Expense Breakdown"
      seoDescription="Plan a personal budget: enter incomes and expenses by month or year to see after-tax income, net surplus or deficit, debt-to-income ratio, and an expense breakdown by category. Free, no signup."
      footer={<BudgetCalculatorFaqSection />}
      wide
    >
      <BudgetCalculatorTool />
    </ToolPageWrapper>
  );
}
