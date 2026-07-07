import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DrywallCalculatorTool from "../components/tools/drywall-calculator/DrywallCalculatorTool";
import { getToolById } from "../utils/tools";

export default function DrywallCalculatorPage() {
  const tool = getToolById("drywall-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <DrywallCalculatorTool />
    </ToolPageWrapper>
  );
}
