import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BalusterCalculatorTool from "../components/tools/baluster-calculator/BalusterCalculatorTool";
import { getToolById } from "../utils/tools";

export default function BalusterCalculatorPage() {
  const tool = getToolById("baluster-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <BalusterCalculatorTool />
    </ToolPageWrapper>
  );
}
