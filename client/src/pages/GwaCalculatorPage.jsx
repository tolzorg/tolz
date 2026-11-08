import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GwaCalculatorTool from "../components/tools/gwa-calculator/GwaCalculatorTool";
import GwaCalculatorFaqSection from "../components/tools/gwa-calculator/GwaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GwaCalculatorPage() {
  const tool = getToolById("gwa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GWA Calculator - General Weighted Average"
      seoDescription="Free GWA calculator: compute your general weighted average in college from your grades and units, on the 1.00-5.00 or 4.00-1.00 grade point scale or a letter grading system, with its letter grade equivalent."
      footer={<GwaCalculatorFaqSection />}
      wide
    >
      <GwaCalculatorTool />
    </ToolPageWrapper>
  );
}
