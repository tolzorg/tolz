import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BodyFatCalculatorTool from "../components/tools/body-fat-calculator/BodyFatCalculatorTool";
import BodyFatCalculatorFaqSection from "../components/tools/body-fat-calculator/BodyFatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BodyFatCalculatorPage() {
  const tool = getToolById("body-fat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Body Fat Calculator - U.S. Navy Method & Body Fat Percentage"
      seoDescription="Free body fat calculator: estimate your body fat percentage with the U.S. Navy method from neck, waist and hip measurements, plus fat mass, lean mass, ACE category, ideal body fat for your age and the BMI method."
      footer={<BodyFatCalculatorFaqSection />}
      wide
    >
      <BodyFatCalculatorTool />
    </ToolPageWrapper>
  );
}
