import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SizeToWeightCalculatorTool from "../components/tools/size-to-weight-calculator/SizeToWeightCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SizeToWeightCalculatorPage() {
  const tool = getToolById("size-to-weight-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SizeToWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
