import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RoiCalculatorTool from "../components/tools/roi-calculator/RoiCalculatorTool";
import RoiCalculatorFaqSection from "../components/tools/roi-calculator/RoiCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RoiCalculatorPage() {
  const tool = getToolById("roi-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="ROI Calculator: Free Return on Investment & Annualized ROI"
      seoDescription="Free ROI calculator that shows your gain or loss, total ROI and annualized ROI from dates or holding period. No signup. Plus formulas, examples and tips."
      footer={<RoiCalculatorFaqSection />}
      wide
    >
      <RoiCalculatorTool />
    </ToolPageWrapper>
  );
}
