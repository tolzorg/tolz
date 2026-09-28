import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtPayoffCalculatorTool from "../components/tools/debt-payoff-calculator/DebtPayoffCalculatorTool";
import DebtPayoffCalculatorFaqSection from "../components/tools/debt-payoff-calculator/DebtPayoffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtPayoffCalculatorPage() {
  const tool = getToolById("debt-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt Payoff Calculator - Free Debt Avalanche Schedule"
      seoDescription="Build a cost-efficient payoff schedule for multiple debts using the debt avalanche method, with optional extra payments. Free, fast, and no signup required."
      footer={<DebtPayoffCalculatorFaqSection />}
      wide
    >
      <DebtPayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
