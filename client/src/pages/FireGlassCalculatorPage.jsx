import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FireGlassCalculatorTool from "../components/tools/fire-glass-calculator/FireGlassCalculatorTool";
import { getToolById } from "../utils/tools";

export default function FireGlassCalculatorPage() {
  const tool = getToolById("fire-glass-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <FireGlassCalculatorTool />
    </ToolPageWrapper>
  );
}
