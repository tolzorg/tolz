import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SandCalculatorTool from "../components/tools/sand-calculator/SandCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SandCalculatorPage() {
  const tool = getToolById("sand-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SandCalculatorTool />
    </ToolPageWrapper>
  );
}
