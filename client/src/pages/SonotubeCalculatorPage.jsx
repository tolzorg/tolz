import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SonotubeCalculatorTool from "../components/tools/sonotube-calculator/SonotubeCalculatorTool";
import SonotubeCalculatorFaqSection from "../components/tools/sonotube-calculator/SonotubeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SonotubeCalculatorPage() {
  const tool = getToolById("sonotube-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sonotube Calculator | Free Concrete Volume & Cost Tool"
      seoDescription="Calculate concrete volume, weight, and cost for Sonotube forms instantly. Get bag counts or mix ratios by diameter and height. Free, no signup."
      footer={<SonotubeCalculatorFaqSection />}
    >
      <SonotubeCalculatorTool />
    </ToolPageWrapper>
  );
}
