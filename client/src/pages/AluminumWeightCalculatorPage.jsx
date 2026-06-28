import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AluminumWeightCalculatorTool from "../components/tools/aluminum-weight-calculator/AluminumWeightCalculatorTool";
import { getToolById } from "../utils/tools";

export default function AluminumWeightCalculatorPage() {
  const tool = getToolById("aluminum-weight-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <AluminumWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
