import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IrrCalculatorTool from "../components/tools/irr-calculator/IrrCalculatorTool";
import IrrCalculatorFaqSection from "../components/tools/irr-calculator/IrrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IrrCalculatorPage() {
  const tool = getToolById("irr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IRR Calculator - Internal Rate of Return for Fixed & Irregular Cash Flows"
      seoDescription="Calculate the internal rate of return (IRR) from a fixed recurring deposit or withdrawal and an ending balance, or from irregular yearly cash flows, with total and gross return. Free, no signup."
      footer={<IrrCalculatorFaqSection />}
      wide
    >
      <IrrCalculatorTool />
    </ToolPageWrapper>
  );
}
