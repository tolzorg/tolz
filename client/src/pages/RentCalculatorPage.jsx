import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentCalculatorTool from "../components/tools/rent-calculator/RentCalculatorTool";
import RentCalculatorFaqSection from "../components/tools/rent-calculator/RentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentCalculatorPage() {
  const tool = getToolById("rent-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rent Calculator - How Much Rent Can I Afford?"
      seoDescription="Find out how much rent you can afford based on your income and monthly debt, using the same 28%/36% guidelines lenders use for mortgages. Free, fast, and no signup required."
      footer={<RentCalculatorFaqSection />}
      wide
    >
      <RentCalculatorTool />
    </ToolPageWrapper>
  );
}
