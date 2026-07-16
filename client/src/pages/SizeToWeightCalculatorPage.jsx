import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SizeToWeightCalculatorTool from "../components/tools/size-to-weight-calculator/SizeToWeightCalculatorTool";
import SizeToWeightCalculatorFaqSection from "../components/tools/size-to-weight-calculator/SizeToWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SizeToWeightCalculatorPage() {
  const tool = getToolById("size-to-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Size to Weight Calculator | Free Online Tool"
      seoDescription="Calculate the exact weight of any rectangular material instantly. Supports 20+ materials and all unit systems. Free, accurate, and no signup required."
      footer={<SizeToWeightCalculatorFaqSection />}
    >
      <SizeToWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
