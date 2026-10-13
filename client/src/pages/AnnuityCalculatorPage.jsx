import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnnuityCalculatorTool from "../components/tools/annuity-calculator/AnnuityCalculatorTool";
import AnnuityCalculatorFaqSection from "../components/tools/annuity-calculator/AnnuityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AnnuityCalculatorPage() {
  const tool = getToolById("annuity-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Annuity Calculator - Free Annuity Due & Ordinary Annuity"
      seoDescription="Free annuity calculator: project growth from a principal plus annual and monthly additions. Compare annuity due vs ordinary annuity with a full schedule."
      footer={<AnnuityCalculatorFaqSection />}
      wide
    >
      <AnnuityCalculatorTool />
    </ToolPageWrapper>
  );
}
