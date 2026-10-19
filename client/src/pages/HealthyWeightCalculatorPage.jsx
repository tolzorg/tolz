import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HealthyWeightCalculatorTool from "../components/tools/healthy-weight-calculator/HealthyWeightCalculatorTool";
import HealthyWeightCalculatorFaqSection from "../components/tools/healthy-weight-calculator/HealthyWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HealthyWeightCalculatorPage() {
  const tool = getToolById("healthy-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Healthy Weight Calculator - Healthy Weight Range for Your Height"
      seoDescription="Free healthy weight calculator: find the healthy weight range for your height (BMI 18.5-25), plus the weights for underweight, overweight and each obesity class, in pounds or kilograms."
      footer={<HealthyWeightCalculatorFaqSection />}
      wide
    >
      <HealthyWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
