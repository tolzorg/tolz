import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PensionCalculatorTool from "../components/tools/pension-calculator/PensionCalculatorTool";
import PensionCalculatorFaqSection from "../components/tools/pension-calculator/PensionCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PensionCalculatorPage() {
  const tool = getToolById("pension-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Pension Calculator: Lump Sum vs Monthly Pension (Free)"
      seoDescription="Free pension calculator to compare lump sum vs monthly pension, single-life vs joint-and-survivor payouts, and see if working longer is worth it."
      footer={<PensionCalculatorFaqSection />}
      wide
    >
      <PensionCalculatorTool />
    </ToolPageWrapper>
  );
}
