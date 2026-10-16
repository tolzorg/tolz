import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageAmortizationCalculatorTool from "../components/tools/mortgage-amortization-calculator/MortgageAmortizationCalculatorTool";
import MortgageAmortizationCalculatorFaqSection from "../components/tools/mortgage-amortization-calculator/MortgageAmortizationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageAmortizationCalculatorPage() {
  const tool = getToolById("mortgage-amortization-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Amortization Calculator - Schedule & Payment"
      seoDescription="Mortgage amortization calculator: monthly payment, interest vs principal, taxes, insurance, PMI and HOA costs, with an annual or monthly amortization schedule and charts. Free, no signup."
      footer={<MortgageAmortizationCalculatorFaqSection />}
      wide
    >
      <MortgageAmortizationCalculatorTool />
    </ToolPageWrapper>
  );
}
