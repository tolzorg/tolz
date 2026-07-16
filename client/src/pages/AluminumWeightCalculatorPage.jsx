import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AluminumWeightCalculatorTool from "../components/tools/aluminum-weight-calculator/AluminumWeightCalculatorTool";
import AluminumWeightCalculatorFaqSection from "../components/tools/aluminum-weight-calculator/AluminumWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AluminumWeightCalculatorPage() {
  const tool = getToolById("aluminum-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Aluminum Weight Calculator | Free Online Tool"
      seoDescription="Calculate aluminum weight instantly for bars, pipes, tubes, sheets and beams. 12 alloys, 15 shapes, all units, free price estimates."
      footer={<AluminumWeightCalculatorFaqSection />}
    >
      <AluminumWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
