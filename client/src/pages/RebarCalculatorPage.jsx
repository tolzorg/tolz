import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RebarCalculatorTool from "../components/tools/rebar-calculator/RebarCalculatorTool";
import { getToolById } from "../utils/tools";

export default function RebarCalculatorPage() {
  const tool = getToolById("rebar-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <RebarCalculatorTool />
    </ToolPageWrapper>
  );
}
