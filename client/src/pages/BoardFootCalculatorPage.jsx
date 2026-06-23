import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BoardFootCalculatorTool from "../components/tools/board-foot-calculator/BoardFootCalculatorTool";
import { getToolById } from "../utils/tools";

export default function BoardFootCalculatorPage() {
  const tool = getToolById("board-foot-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <BoardFootCalculatorTool />
    </ToolPageWrapper>
  );
}
