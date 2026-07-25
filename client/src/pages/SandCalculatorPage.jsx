import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SandCalculatorTool from "../components/tools/sand-calculator/SandCalculatorTool";
import SandCalculatorFaqSection from "../components/tools/sand-calculator/SandCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SandCalculatorPage() {
  const tool = getToolById("sand-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sand Calculator | Estimate Volume, Weight & Cost"
      seoDescription="Calculate how much sand you need from length, width, and depth. Get volume, weight, and instant cost estimates, free, fast, no signup."
      footer={<SandCalculatorFaqSection />}
    >
      <SandCalculatorTool />
    </ToolPageWrapper>
  );
}
