import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HealthyWeightCalculatorTool from "../components/tools/healthy-weight-calculator/HealthyWeightCalculatorTool";
import HealthyWeightCalculatorFaqSection from "../components/tools/healthy-weight-calculator/HealthyWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HealthyWeightCalculatorPage() {
  const tool = getToolById("healthy-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Healthy Weight Calculator – Find Your Weight Range by Height"
      seoDescription="Free healthy weight calculator: find your healthy weight range for your height (BMI 18.5–25) in kg or lbs, plus underweight and obesity class ranges."
      footer={<HealthyWeightCalculatorFaqSection />}
      wide
    >
      <HealthyWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
