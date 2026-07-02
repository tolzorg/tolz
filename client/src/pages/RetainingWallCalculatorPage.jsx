import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RetainingWallCalculatorTool from "../components/tools/retaining-wall-calculator/RetainingWallCalculatorTool";
import { getToolById } from "../utils/tools";

export default function RetainingWallCalculatorPage() {
  const tool = getToolById("retaining-wall-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <RetainingWallCalculatorTool />
    </ToolPageWrapper>
  );
}
