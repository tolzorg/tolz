import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RollingOffsetCalculatorTool from "../components/tools/rolling-offset-calculator/RollingOffsetCalculatorTool";
import { getToolById } from "../utils/tools";

export default function RollingOffsetCalculatorPage() {
  const tool = getToolById("rolling-offset-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <RollingOffsetCalculatorTool />
    </ToolPageWrapper>
  );
}
