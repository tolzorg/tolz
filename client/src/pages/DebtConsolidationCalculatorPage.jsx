import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtConsolidationCalculatorTool from "../components/tools/debt-consolidation-calculator/DebtConsolidationCalculatorTool";
import DebtConsolidationCalculatorFaqSection from "../components/tools/debt-consolidation-calculator/DebtConsolidationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtConsolidationCalculatorPage() {
  const tool = getToolById("debt-consolidation-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt Consolidation Calculator - Compare APR & Savings"
      seoDescription="Use this free debt consolidation calculator to compare your current APRs with a new loan. See monthly payment, payoff time, and total cost side by side."
      footer={<DebtConsolidationCalculatorFaqSection />}
      wide
    >
      <DebtConsolidationCalculatorTool />
    </ToolPageWrapper>
  );
}
