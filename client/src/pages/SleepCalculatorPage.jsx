import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SleepCalculatorTool from "../components/tools/sleep-calculator/SleepCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SleepCalculatorPage() {
  const tool = getToolById("sleep-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SleepCalculatorTool />
    </ToolPageWrapper>
  );
}
