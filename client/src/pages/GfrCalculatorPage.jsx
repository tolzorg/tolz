import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GfrCalculatorTool from "../components/tools/gfr-calculator/GfrCalculatorTool";
import GfrCalculatorFaqSection from "../components/tools/gfr-calculator/GfrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GfrCalculatorPage() {
  const tool = getToolById("gfr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GFR Calculator - Free eGFR Calculator (CKD-EPI, MDRD)"
      seoDescription="Use Tolz's free GFR calculator to estimate eGFR from creatinine, age and gender with CKD-EPI, MDRD, Mayo Quadratic or Schwartz formulas. No signup needed."
      footer={<GfrCalculatorFaqSection />}
      wide
    >
      <GfrCalculatorTool />
    </ToolPageWrapper>
  );
}
