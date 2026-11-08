import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentalPropertyCalculatorTool from "../components/tools/rental-property-calculator/RentalPropertyCalculatorTool";
import RentalPropertyCalculatorFaqSection from "../components/tools/rental-property-calculator/RentalPropertyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentalPropertyCalculatorPage() {
  const tool = getToolById("rental-property-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rental Property Calculator - Free IRR, Cap Rate & ROI"
      seoDescription="Free rental property calculator to analyze cash flow, cap rate, cash-on-cash return, IRR and total profit at sale, with a full year-by-year breakdown."
      footer={<RentalPropertyCalculatorFaqSection />}
      wide
    >
      <RentalPropertyCalculatorTool />
    </ToolPageWrapper>
  );
}
