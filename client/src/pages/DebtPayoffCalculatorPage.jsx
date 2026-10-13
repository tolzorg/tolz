import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtPayoffCalculatorTool from "../components/tools/debt-payoff-calculator/DebtPayoffCalculatorTool";
import DebtPayoffCalculatorFaqSection from "../components/tools/debt-payoff-calculator/DebtPayoffCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtPayoffCalculatorPage() {
  const tool = getToolById("debt-payoff-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt Payoff Calculator - Free Avalanche Payoff Planner"
      seoDescription="Free debt payoff calculator for credit cards, loans, and mortgages. See your avalanche payoff order, debt-free date, and interest saved with extra payments."
      footer={<DebtPayoffCalculatorFaqSection />}
      wide
    >
      <DebtPayoffCalculatorTool />
    </ToolPageWrapper>
  );
}
