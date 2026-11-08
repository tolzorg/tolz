import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentVsBuyCalculatorTool from "../components/tools/rent-vs-buy-calculator/RentVsBuyCalculatorTool";
import RentVsBuyCalculatorFaqSection from "../components/tools/rent-vs-buy-calculator/RentVsBuyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentVsBuyCalculatorPage() {
  const tool = getToolById("rent-vs-buy-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rent vs Buy Calculator: Find Your Break-Even Year"
      seoDescription="Free rent vs buy calculator. Compare buying and renting costs for every stay from 1 to 30 years, with taxes, upkeep and returns, and find your break-even."
      footer={<RentVsBuyCalculatorFaqSection />}
      wide
    >
      <RentVsBuyCalculatorTool />
    </ToolPageWrapper>
  );
}
