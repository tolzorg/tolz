import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FramingCalculatorTool from "../components/tools/framing-calculator/FramingCalculatorTool";
import { getToolById } from "../utils/tools";

export default function FramingCalculatorPage() {
  const tool = getToolById("framing-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <FramingCalculatorTool />
    </ToolPageWrapper>
  );
}
