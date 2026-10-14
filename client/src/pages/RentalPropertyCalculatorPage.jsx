import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentalPropertyCalculatorTool from "../components/tools/rental-property-calculator/RentalPropertyCalculatorTool";
import RentalPropertyCalculatorFaqSection from "../components/tools/rental-property-calculator/RentalPropertyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentalPropertyCalculatorPage() {
  const tool = getToolById("rental-property-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rental Property Calculator - IRR, Cap Rate, Cash Flow & Profit"
      seoDescription="Analyze a rental property investment: IRR, total profit when sold, cash-on-cash return, cap rate, first-year cash flow, and a year-by-year breakdown of income, expenses, equity, and sale proceeds. Free, no signup."
      footer={<RentalPropertyCalculatorFaqSection />}
      wide
    >
      <RentalPropertyCalculatorTool />
    </ToolPageWrapper>
  );
}
