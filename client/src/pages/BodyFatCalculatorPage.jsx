import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodyFatCalculatorTool from "../components/tools/body-fat-calculator/BodyFatCalculatorTool";
import BodyFatCalculatorFaqSection from "../components/tools/body-fat-calculator/BodyFatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodyFatCalculatorPage() {
  const tool = getToolById("body-fat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Body Fat Calculator - Free Navy Method Tool"
      seoDescription="Free body fat calculator using the Navy method. Get your body fat percentage, fat mass, lean mass, ACE category and ideal range for your age in seconds."
      footer={<BodyFatCalculatorFaqSection />}
      wide
    >
      <BodyFatCalculatorTool />
    </ToolPageWrapper>
  );
}
