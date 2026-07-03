import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RiverRockCalculatorTool from "../components/tools/river-rock-calculator/RiverRockCalculatorTool";
import { getToolById } from "../utils/tools";

export default function RiverRockCalculatorPage() {
  const tool = getToolById("river-rock-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <RiverRockCalculatorTool />
    </ToolPageWrapper>
  );
}
