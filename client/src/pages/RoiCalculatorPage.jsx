import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RoiCalculatorTool from "../components/tools/roi-calculator/RoiCalculatorTool";
import RoiCalculatorFaqSection from "../components/tools/roi-calculator/RoiCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RoiCalculatorPage() {
  const tool = getToolById("roi-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="ROI Calculator - Return on Investment & Annualized ROI"
      seoDescription="Calculate return on investment (ROI), investment gain or loss, and annualized ROI from the amount invested and returned, using dates or an investment length. Free, no signup."
      footer={<RoiCalculatorFaqSection />}
      wide
    >
      <RoiCalculatorTool />
    </ToolPageWrapper>
  );
}
