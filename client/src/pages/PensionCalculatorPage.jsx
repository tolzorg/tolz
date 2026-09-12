import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PensionCalculatorTool from "../components/tools/pension-calculator/PensionCalculatorTool";
import PensionCalculatorFaqSection from "../components/tools/pension-calculator/PensionCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PensionCalculatorPage() {
  const tool = getToolById("pension-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Pension Calculator - Lump Sum vs. Monthly Income"
      seoDescription="Compare a lump sum payout vs. monthly pension income, single-life vs. joint-and-survivor payout options, and whether working longer is worth it financially. Free, fast, and no signup required."
      footer={<PensionCalculatorFaqSection />}
      wide
    >
      <PensionCalculatorTool />
    </ToolPageWrapper>
  );
}
