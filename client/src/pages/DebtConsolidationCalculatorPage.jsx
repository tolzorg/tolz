import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtConsolidationCalculatorTool from "../components/tools/debt-consolidation-calculator/DebtConsolidationCalculatorTool";
import DebtConsolidationCalculatorFaqSection from "../components/tools/debt-consolidation-calculator/DebtConsolidationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtConsolidationCalculatorPage() {
  const tool = getToolById("debt-consolidation-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt Consolidation Calculator - Free APR Comparison"
      seoDescription="Compare the APR of your existing debts against a proposed consolidation loan, with a full side-by-side cost breakdown. Free, fast, and no signup required."
      footer={<DebtConsolidationCalculatorFaqSection />}
      wide
    >
      <DebtConsolidationCalculatorTool />
    </ToolPageWrapper>
  );
}
