import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SagCalculatorTool from "../components/tools/sag-calculator/SagCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SagCalculatorPage() {
  const tool = getToolById("sag-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SagCalculatorTool />
    </ToolPageWrapper>
  );
}
