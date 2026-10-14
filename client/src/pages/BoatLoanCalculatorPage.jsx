import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BoatLoanCalculatorTool from "../components/tools/boat-loan-calculator/BoatLoanCalculatorTool";
import BoatLoanCalculatorFaqSection from "../components/tools/boat-loan-calculator/BoatLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BoatLoanCalculatorPage() {
  const tool = getToolById("boat-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Boat Loan Calculator - Monthly Payment & Affordable Boat Price"
      seoDescription="Calculate a boat loan's monthly payment, total interest, and total cost with down payment, trade-in, sales tax, and fees, or find the boat price a monthly payment can buy. Free, no signup."
      footer={<BoatLoanCalculatorFaqSection />}
      wide
    >
      <BoatLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
