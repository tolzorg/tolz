import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageCalculatorTool from "../components/tools/mortgage-calculator/MortgageCalculatorTool";
import MortgageCalculatorFaqSection from "../components/tools/mortgage-calculator/MortgageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageCalculatorPage() {
  const tool = getToolById("mortgage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Calculator – Monthly Payment, Amortization & More"
      seoDescription="Calculate your monthly mortgage payment with taxes, insurance, PMI, HOA, extra payments, and a full amortization schedule. Free, no signup."
      footer={<MortgageCalculatorFaqSection />}
      wide
    >
      <MortgageCalculatorTool />
    </ToolPageWrapper>
  );
}
