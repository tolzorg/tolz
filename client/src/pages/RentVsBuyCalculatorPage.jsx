import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentVsBuyCalculatorTool from "../components/tools/rent-vs-buy-calculator/RentVsBuyCalculatorTool";
import RentVsBuyCalculatorFaqSection from "../components/tools/rent-vs-buy-calculator/RentVsBuyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentVsBuyCalculatorPage() {
  const tool = getToolById("rent-vs-buy-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rent vs. Buy Calculator - Should I Rent or Buy a Home?"
      seoDescription="Compare the average cost of buying and renting a home for every stay from 1 to 30 years, with mortgage, taxes, insurance, maintenance, appreciation, investment returns and tax savings, and find your break-even stay. Free, no signup."
      footer={<RentVsBuyCalculatorFaqSection />}
      wide
    >
      <RentVsBuyCalculatorTool />
    </ToolPageWrapper>
  );
}
