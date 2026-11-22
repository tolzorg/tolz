import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodyTypeCalculatorTool from "../components/tools/body-type-calculator/BodyTypeCalculatorTool";
import BodyTypeCalculatorFaqSection from "../components/tools/body-type-calculator/BodyTypeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodyTypeCalculatorPage() {
  const tool = getToolById("body-type-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Body Type Calculator: Body, Bust, Waist and Hip Shape"
      seoDescription="Use our free body type calculator to find your body shape from bust, waist, high hip and hip measurements, and get your waist-hip ratio instantly."
      footer={<BodyTypeCalculatorFaqSection />}
      wide
    >
      <BodyTypeCalculatorTool />
    </ToolPageWrapper>
  );
}
