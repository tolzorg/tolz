import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BoatLoanCalculatorTool from "../components/tools/boat-loan-calculator/BoatLoanCalculatorTool";
import BoatLoanCalculatorFaqSection from "../components/tools/boat-loan-calculator/BoatLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BoatLoanCalculatorPage() {
  const tool = getToolById("boat-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Boat Loan Calculator - Monthly Payment & Total Cost"
      seoDescription="Free boat loan calculator to estimate your monthly payment, total interest, and full cost with down payment, trade-in, tax, and fees. No signup needed."
      footer={<BoatLoanCalculatorFaqSection />}
      wide
    >
      <BoatLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
