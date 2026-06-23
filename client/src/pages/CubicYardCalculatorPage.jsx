import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CubicYardCalculatorTool from "../components/tools/cubic-yard-calculator/CubicYardCalculatorTool";
import { getToolById } from "../utils/tools";

export default function CubicYardCalculatorPage() {
  const tool = getToolById("cubic-yard-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <CubicYardCalculatorTool />
    </ToolPageWrapper>
  );
}
