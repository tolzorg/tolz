import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GwaCalculatorTool from "../components/tools/gwa-calculator/GwaCalculatorTool";
import GwaCalculatorFaqSection from "../components/tools/gwa-calculator/GwaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GwaCalculatorPage() {
  const tool = getToolById("gwa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GWA Calculator - Free Online GWA Computation Tool"
      seoDescription="Compute your general weighted average in seconds. Free GWA calculator for 1.00–5.00, 4.00–1.00 and letter grades. Add subjects, units and see your GWA."
      footer={<GwaCalculatorFaqSection />}
      wide
    >
      <GwaCalculatorTool />
    </ToolPageWrapper>
  );
}
