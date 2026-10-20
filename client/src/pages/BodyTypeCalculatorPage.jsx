import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodyTypeCalculatorTool from "../components/tools/body-type-calculator/BodyTypeCalculatorTool";
import BodyTypeCalculatorFaqSection from "../components/tools/body-type-calculator/BodyTypeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodyTypeCalculatorPage() {
  const tool = getToolById("body-type-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Body Type Calculator - Find Your Body Shape"
      seoDescription="Free body type calculator for women: find your body shape (hourglass, bottom or top hourglass, spoon, triangle, inverted triangle or rectangle) from bust, waist, high hip and hip sizes, plus your waist-hip ratio."
      footer={<BodyTypeCalculatorFaqSection />}
      wide
    >
      <BodyTypeCalculatorTool />
    </ToolPageWrapper>
  );
}
