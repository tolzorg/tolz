import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageCalculatorUkTool from "../components/tools/mortgage-calculator-uk/MortgageCalculatorUkTool";
import MortgageCalculatorUkFaqSection from "../components/tools/mortgage-calculator-uk/MortgageCalculatorUkFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageCalculatorUkPage() {
  const tool = getToolById("mortgage-calculator-uk");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Calculator UK - Monthly Repayment in Pounds"
      seoDescription="UK mortgage calculator in pounds: monthly repayment and interest-only payment, deposit, taxes, insurance and other costs, with an amortization schedule and charts. Free, no signup."
      footer={<MortgageCalculatorUkFaqSection />}
      wide
    >
      <MortgageCalculatorUkTool />
    </ToolPageWrapper>
  );
}
