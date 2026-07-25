import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SagCalculatorTool from "../components/tools/sag-calculator/SagCalculatorTool";
import SagCalculatorFaqSection from "../components/tools/sag-calculator/SagCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SagCalculatorPage() {
  const tool = getToolById("sag-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free SAG Calculator Online | Sagitta, Radius & Diameter"
      seoDescription="Calculate sagitta, radius of curvature, or diameter instantly with our free SAG calculator. Enter any two values—no signup, 100% accurate results."
      footer={<SagCalculatorFaqSection />}
    >
      <SagCalculatorTool />
    </ToolPageWrapper>
  );
}
