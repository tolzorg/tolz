import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SquareFootageCalculatorTool from "../components/tools/square-footage-calculator/SquareFootageCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SquareFootageCalculatorPage() {
  const tool = getToolById("square-footage-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SquareFootageCalculatorTool />
    </ToolPageWrapper>
  );
}
