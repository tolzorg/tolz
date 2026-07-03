import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RipRapCalculatorTool from "../components/tools/rip-rap-calculator/RipRapCalculatorTool";
import { getToolById } from "../utils/tools";

export default function RipRapCalculatorPage() {
  const tool = getToolById("rip-rap-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <RipRapCalculatorTool />
    </ToolPageWrapper>
  );
}
