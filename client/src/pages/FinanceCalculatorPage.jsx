import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FinanceCalculatorTool from "../components/tools/finance-calculator/FinanceCalculatorTool";
import FinanceCalculatorFaqSection from "../components/tools/finance-calculator/FinanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FinanceCalculatorPage() {
  const tool = getToolById("finance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Financial Calculator Online - Free TVM Calculator | Tolz"
      seoDescription="Solve future value, present value, payment, rate, or periods free online. Same 5-key TVM logic as a BA II Plus or HP 12C. No signup needed."
      footer={<FinanceCalculatorFaqSection />}
      wide
    >
      <FinanceCalculatorTool />
    </ToolPageWrapper>
  );
}
