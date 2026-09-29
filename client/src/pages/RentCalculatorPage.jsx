import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RentCalculatorTool from "../components/tools/rent-calculator/RentCalculatorTool";
import RentCalculatorFaqSection from "../components/tools/rent-calculator/RentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RentCalculatorPage() {
  const tool = getToolById("rent-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rent Calculator: How Much Rent Can I Afford? | Tolz"
      seoDescription=" Use this free rent calculator to see how much rent you can afford based on gross income and monthly debt, using the 28/36 rule lenders rely on. No signup."
      footer={<RentCalculatorFaqSection />}
      wide
    >
      <RentCalculatorTool />
    </ToolPageWrapper>
  );
}
