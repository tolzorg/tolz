import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnnuityCalculatorTool from "../components/tools/annuity-calculator/AnnuityCalculatorTool";
import AnnuityCalculatorFaqSection from "../components/tools/annuity-calculator/AnnuityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AnnuityCalculatorPage() {
  const tool = getToolById("annuity-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Annuity Calculator - Free Online Accumulation Schedule"
      seoDescription="Calculate how a starting principal plus annual and monthly additions will grow into an annuity, with a full accumulation schedule. Free, fast, and no signup required."
      footer={<AnnuityCalculatorFaqSection />}
      wide
    >
      <AnnuityCalculatorTool />
    </ToolPageWrapper>
  );
}
