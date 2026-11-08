import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IrrCalculatorTool from "../components/tools/irr-calculator/IrrCalculatorTool";
import IrrCalculatorFaqSection from "../components/tools/irr-calculator/IrrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IrrCalculatorPage() {
  const tool = getToolById("irr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IRR Calculator - Free Internal Rate of Return Tool"
      seoDescription="Free IRR calculator that finds your internal rate of return from recurring deposits and an ending balance or irregular yearly cash flows. Try it for free."
      footer={<IrrCalculatorFaqSection />}
      wide
    >
      <IrrCalculatorTool />
    </ToolPageWrapper>
  );
}
