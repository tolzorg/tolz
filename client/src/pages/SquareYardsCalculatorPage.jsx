import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SquareYardsCalculatorTool from "../components/tools/square-yards-calculator/SquareYardsCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SquareYardsCalculatorPage() {
  const tool = getToolById("square-yards-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SquareYardsCalculatorTool />
    </ToolPageWrapper>
  );
}
