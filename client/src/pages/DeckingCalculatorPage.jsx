import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DeckingCalculatorTool from "../components/tools/decking-calculator/DeckingCalculatorTool";
import { getToolById } from "../utils/tools";

export default function DeckingCalculatorPage() {
  const tool = getToolById("decking-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <DeckingCalculatorTool />
    </ToolPageWrapper>
  );
}
