import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BrickCalculatorTool from "../components/tools/brick-calculator/BrickCalculatorTool";
import { getToolById } from "../utils/tools";

export default function BrickCalculatorPage() {
  const tool = getToolById("brick-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <BrickCalculatorTool />
    </ToolPageWrapper>
  );
}
