import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GfrCalculatorTool from "../components/tools/gfr-calculator/GfrCalculatorTool";
import GfrCalculatorFaqSection from "../components/tools/gfr-calculator/GfrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GfrCalculatorPage() {
  const tool = getToolById("gfr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GFR Calculator - eGFR by CKD-EPI, MDRD & Mayo"
      seoDescription="Free GFR calculator: estimate glomerular filtration rate from serum creatinine, age, gender and race with the CKD-EPI, MDRD and Mayo Quadratic formulas, plus the bedside Schwartz formula for children."
      footer={<GfrCalculatorFaqSection />}
      wide
    >
      <GfrCalculatorTool />
    </ToolPageWrapper>
  );
}
