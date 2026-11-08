import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MortgageAmortizationCalculatorTool from "../components/tools/mortgage-amortization-calculator/MortgageAmortizationCalculatorTool";
import MortgageAmortizationCalculatorFaqSection from "../components/tools/mortgage-amortization-calculator/MortgageAmortizationCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MortgageAmortizationCalculatorPage() {
  const tool = getToolById("mortgage-amortization-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Mortgage Amortization Calculator - Free Payment Schedule"
      seoDescription="Free mortgage amortization calculator. See your monthly payment, interest vs principal, taxes, insurance, PMI and HOA, plus a full amortization schedule."
      footer={<MortgageAmortizationCalculatorFaqSection />}
      wide
    >
      <MortgageAmortizationCalculatorTool />
    </ToolPageWrapper>
  );
}
